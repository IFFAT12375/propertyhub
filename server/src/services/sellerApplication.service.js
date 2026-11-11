import SellerApplication from '../models/SellerApplication.js'
import User from '../models/User.js'
import AppError from '../utils/AppError.js'

function pagination(page, limit, totalItems) {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  }
}

export async function createApplication(user, fields) {
  if (user.role !== 'user' || user.accountStatus !== 'active') {
    throw new AppError(409, 'SELLER_APPLICATION_UNAVAILABLE', 'This account cannot submit a seller application.')
  }

  const pendingApplication = await SellerApplication.exists({
    applicant: user._id,
    status: 'pending',
  })
  if (pendingApplication) {
    throw new AppError(409, 'PENDING_APPLICATION_EXISTS', 'You already have a pending seller application.')
  }

  try {
    return await SellerApplication.create({ ...fields, applicant: user._id })
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(409, 'PENDING_APPLICATION_EXISTS', 'You already have a pending seller application.')
    }
    throw error
  }
}

export async function listMyApplications(userId, { page, limit, status }) {
  const filter = { applicant: userId }
  if (status) filter.status = status
  const [applications, totalItems] = await Promise.all([
    SellerApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SellerApplication.countDocuments(filter),
  ])
  return { applications, pagination: pagination(page, limit, totalItems) }
}

export async function listApplications({ page, limit, status }) {
  const filter = { status: status ?? 'pending' }
  const [applications, totalItems] = await Promise.all([
    SellerApplication.find(filter)
      .populate('applicant', 'name email phone role accountStatus')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SellerApplication.countDocuments(filter),
  ])
  return { applications, pagination: pagination(page, limit, totalItems) }
}

export async function reviewApplication(applicationId, adminId, decision) {
  const existing = await SellerApplication.findById(applicationId)
  if (!existing) {
    throw new AppError(404, 'SELLER_APPLICATION_NOT_FOUND', 'Seller application not found.')
  }

  if (existing.status !== 'pending') {
    if (existing.status === decision.status && decision.status === 'approved') {
      const applicant = await User.findById(existing.applicant)
      if (!applicant) {
        throw new AppError(404, 'APPLICANT_NOT_FOUND', 'The applicant account could not be found.')
      }
      if (applicant.role !== 'seller') {
        applicant.role = 'seller'
        await applicant.save()
      }
      return existing
    }
    throw new AppError(409, 'SELLER_APPLICATION_ALREADY_REVIEWED', 'This seller application has already been reviewed.')
  }

  const reviewedApplication = await SellerApplication.findOneAndUpdate(
    { _id: applicationId, status: 'pending' },
    {
      $set: {
        status: decision.status,
        rejectionReason: decision.status === 'rejected' ? decision.rejectionReason : '',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    },
    { returnDocument: 'after', runValidators: true },
  )

  if (!reviewedApplication) {
    throw new AppError(409, 'SELLER_APPLICATION_ALREADY_REVIEWED', 'This seller application has already been reviewed.')
  }

  if (decision.status === 'approved') {
    const applicant = await User.findById(reviewedApplication.applicant)
    if (!applicant) {
      throw new AppError(404, 'APPLICANT_NOT_FOUND', 'The applicant account could not be found.')
    }
    applicant.role = 'seller'
    await applicant.save()
  }

  return reviewedApplication
}
