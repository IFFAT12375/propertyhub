import { env } from '../config/env.js'
import Inquiry from '../models/Inquiry.js'
import Property from '../models/Property.js'
import AppError from '../utils/AppError.js'
import { createOpaqueToken, hashToken } from '../utils/tokens.js'
import { sendInquiryVerification } from './email.service.js'

function pagination(page, limit, totalItems) {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  }
}

async function findPublicProperty(propertyId) {
  const property = await Property.findOne({
    _id: propertyId,
    moderationStatus: 'approved',
    availabilityStatus: 'available',
    recordStatus: 'active',
  }).populate({
    path: 'owner',
    select: 'role accountStatus',
    match: { role: 'seller', accountStatus: 'active' },
  })

  if (!property?.owner) {
    throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property is not currently accepting inquiries.')
  }
  return property
}

export async function createInquiry({ user, fields }) {
  await findPublicProperty(fields.propertyId)

  const name = fields.name ?? user?.name
  const email = fields.email ?? user?.email
  if (!name || !email) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Name and email are required for guest inquiries.',
      [
        ...(!name ? [{ field: 'body.name', message: 'Name is required.' }] : []),
        ...(!email ? [{ field: 'body.email', message: 'Email is required.' }] : []),
      ],
    )
  }

  if (user) {
    return {
      inquiry: await Inquiry.create({
        property: fields.propertyId,
        seeker: user._id,
        name,
        email,
        phone: fields.phone ?? user.phone,
        message: fields.message,
        verificationStatus: 'verified',
        verifiedAt: new Date(),
      }),
      verificationRequired: false,
    }
  }

  const verificationToken = createOpaqueToken()
  const inquiry = await Inquiry.create({
    property: fields.propertyId,
    seeker: null,
    name,
    email,
    phone: fields.phone ?? '',
    message: fields.message,
    verificationStatus: 'pending',
    verificationTokenHash: hashToken(verificationToken),
    verificationExpiresAt: new Date(
      Date.now() + env.INQUIRY_VERIFICATION_TTL_MINUTES * 60 * 1000,
    ),
  })

  const verificationUrl = new URL('/inquiries/verify', env.PUBLIC_WEB_URL)
  verificationUrl.searchParams.set('token', verificationToken)

  let emailSent
  try {
    emailSent = await sendInquiryVerification({ email, verificationUrl: verificationUrl.toString() })
  } catch (error) {
    await Inquiry.deleteOne({ _id: inquiry._id, verificationStatus: 'pending' })
    throw error
  }

  return { inquiry, verificationRequired: true, emailSent }
}

export async function verifyInquiry(token) {
  const tokenHash = hashToken(token)
  const now = new Date()
  const expiredInquiry = await Inquiry.findOneAndUpdate(
    {
      verificationTokenHash: tokenHash,
      verificationStatus: 'pending',
      verificationExpiresAt: { $lte: now },
    },
    {
      $set: { verificationStatus: 'expired' },
      $unset: { verificationTokenHash: '', verificationExpiresAt: '' },
    },
    { returnDocument: 'after', runValidators: true },
  )

  if (expiredInquiry) {
    throw new AppError(410, 'INQUIRY_VERIFICATION_EXPIRED', 'This inquiry verification link has expired.')
  }

  const inquiry = await Inquiry.findOneAndUpdate(
    {
      verificationTokenHash: tokenHash,
      verificationStatus: 'pending',
      verificationExpiresAt: { $gt: now },
    },
    {
      $set: {
        verificationStatus: 'verified',
        verifiedAt: now,
      },
      $unset: { verificationTokenHash: '', verificationExpiresAt: '' },
    },
    { returnDocument: 'after', runValidators: true },
  )

  if (!inquiry) {
    throw new AppError(400, 'INVALID_INQUIRY_VERIFICATION', 'This inquiry verification link is invalid or has already been used.')
  }
  return inquiry
}

export async function listSellerInquiries(sellerId, { page, limit, propertyId, followUpStatus }) {
  const propertyFilter = { owner: sellerId }
  if (propertyId) {
    const ownedProperty = await Property.exists({ _id: propertyId, owner: sellerId })
    if (!ownedProperty) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
    }
    propertyFilter._id = propertyId
  }
  const propertyIds = await Property.distinct('_id', propertyFilter)
  const filter = {
    property: { $in: propertyIds },
    verificationStatus: 'verified',
  }
  if (followUpStatus) filter.followUpStatus = followUpStatus

  const [inquiries, totalItems] = await Promise.all([
    Inquiry.find(filter)
      .populate('property', 'title category type purpose location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Inquiry.countDocuments(filter),
  ])
  return { inquiries, pagination: pagination(page, limit, totalItems) }
}

export async function listMyInquiries(userId, { page, limit }) {
  const filter = { seeker: userId }
  const [inquiries, totalItems] = await Promise.all([
    Inquiry.find(filter)
      .populate('property', 'title category type purpose location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Inquiry.countDocuments(filter),
  ])
  return { inquiries, pagination: pagination(page, limit, totalItems) }
}

export async function updateFollowUpStatus(inquiryId, sellerId, followUpStatus) {
  const propertyIds = await Property.distinct('_id', { owner: sellerId })
  const inquiry = await Inquiry.findOne({
    _id: inquiryId,
    property: { $in: propertyIds },
    verificationStatus: 'verified',
  })
  if (!inquiry) {
    throw new AppError(404, 'INQUIRY_NOT_FOUND', 'Verified inquiry not found.')
  }

  inquiry.followUpStatus = followUpStatus
  await inquiry.save()
  return inquiry
}
