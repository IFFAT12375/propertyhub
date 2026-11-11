import Property from '../models/Property.js'
import User from '../models/User.js'
import AppError from '../utils/AppError.js'
import {
  cleanupUploads,
  imageUrl,
  promoteUploads,
  removePublishedImages,
} from '../utils/imageStorage.js'

function pagination(page, limit, totalItems) {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  }
}

function normalizeFields(fields, existingLocation) {
  const {
    locationArea,
    block,
    street,
    address,
    ...propertyFields
  } = fields

  if (
    locationArea !== undefined ||
    block !== undefined ||
    street !== undefined ||
    address !== undefined
  ) {
    propertyFields.location = {
      ...(existingLocation?.toObject?.() ?? existingLocation ?? {}),
      ...(locationArea !== undefined ? { area: locationArea } : {}),
      ...(block !== undefined ? { block } : {}),
      ...(street !== undefined ? { street } : {}),
      ...(address !== undefined ? { address } : {}),
      city: 'Lahore',
    }
  }
  return propertyFields
}

function serializeProperty(property) {
  const value = property.toObject ? property.toObject() : { ...property }
  value.images = (value.images ?? []).map((image) => ({
    ...image,
    url: imageUrl(image.filename),
  }))

  if (value.owner && typeof value.owner === 'object' && value.owner.name) {
    const seller = { name: value.owner.name }
    if (value.phoneVisible) seller.phone = value.owner.phone
    value.seller = seller
    delete value.owner
  }

  return value
}

function addImageMetadata(images, additions) {
  return [
    ...images,
    ...additions.map((image, index) => ({ ...image, order: images.length + index })),
  ]
}

export async function createProperty(owner, fields, files) {
  const images = await promoteUploads(files)
  try {
    const property = new Property({
      ...normalizeFields(fields),
      owner: owner._id,
      images: addImageMetadata([], images),
    })
    await property.save()
    return serializeProperty(property)
  } catch (error) {
    await removePublishedImages(images.map(({ filename }) => filename))
    throw error
  }
}

export async function listSellerProperties(ownerId, { page, limit, recordStatus }) {
  const filter = { owner: ownerId }
  if (recordStatus) filter.recordStatus = recordStatus
  const [properties, totalItems] = await Promise.all([
    Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter),
  ])
  return {
    properties: properties.map(serializeProperty),
    pagination: pagination(page, limit, totalItems),
  }
}

export async function getSellerProperty(propertyId, ownerId) {
  const property = await Property.findOne({ _id: propertyId, owner: ownerId })
  if (!property) {
    throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
  }
  return serializeProperty(property)
}

export async function updateSellerProperty(propertyId, ownerId, fields, files) {
  const additions = files ?? []
  const property = await Property.findOne({
    _id: propertyId,
    owner: ownerId,
    recordStatus: 'active',
  })
  if (!property) {
    await cleanupUploads(additions)
    throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
  }

  if (property.images.length + additions.length > 10) {
    await cleanupUploads(additions)
    throw new AppError(400, 'TOO_MANY_PROPERTY_IMAGES', 'A property can have no more than 10 images.')
  }

  const images = await promoteUploads(additions)
  try {
    Object.assign(property, normalizeFields(fields, property.location))
    property.images = addImageMetadata(property.images, images)
    property.moderationStatus = 'pending'
    property.rejectionReason = ''
    await property.save()
    return serializeProperty(property)
  } catch (error) {
    await removePublishedImages(images.map(({ filename }) => filename))
    throw error
  }
}

export async function deleteSellerImage(propertyId, ownerId, filename) {
  const property = await Property.findOne({
    _id: propertyId,
    owner: ownerId,
    recordStatus: 'active',
  })
  if (!property) {
    throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
  }

  const imageIndex = property.images.findIndex((image) => image.filename === filename)
  if (imageIndex === -1) {
    throw new AppError(404, 'PROPERTY_IMAGE_NOT_FOUND', 'Property image not found.')
  }
  if (property.images.length <= 1) {
    throw new AppError(400, 'PROPERTY_IMAGE_REQUIRED', 'A property must retain at least one image.')
  }

  property.images.splice(imageIndex, 1)
  property.images.forEach((image, order) => { image.order = order })
  property.moderationStatus = 'pending'
  property.rejectionReason = ''
  await property.save()
  await removePublishedImages([filename])
  return serializeProperty(property)
}

export async function updateAvailability(propertyId, ownerId, availabilityStatus) {
  const property = await Property.findOne({
    _id: propertyId,
    owner: ownerId,
    recordStatus: 'active',
  })
  if (!property) {
    throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
  }

  const invalidSaleStatus =
    property.purpose === 'sale' && availabilityStatus === 'rented'
  const invalidRentStatus =
    property.purpose === 'rent' && availabilityStatus === 'sold'
  if (invalidSaleStatus || invalidRentStatus) {
    throw new AppError(
      400,
      'INVALID_AVAILABILITY_STATUS',
      'Availability status must match the listing purpose.',
    )
  }

  property.availabilityStatus = availabilityStatus
  await property.save()
  return serializeProperty(property)
}

export async function archiveProperty(propertyId, ownerId) {
  const property = await Property.findOneAndUpdate(
    { _id: propertyId, owner: ownerId, recordStatus: 'active' },
    { $set: { recordStatus: 'deleted' } },
    { returnDocument: 'after', runValidators: true },
  )
  if (!property) {
    throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
  }
  return serializeProperty(property)
}

export async function listPublicProperties(query) {
  const {
    page,
    limit,
    area,
    category,
    type,
    purpose,
    minPrice,
    maxPrice,
  } = query
  const filter = {
    moderationStatus: 'approved',
    availabilityStatus: 'available',
    recordStatus: 'active',
  }
  if (area) filter['location.area'] = area
  if (category) filter.category = category
  if (type) filter.type = type
  if (purpose) filter.purpose = purpose
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {}
    if (minPrice !== undefined) filter.price.$gte = minPrice
    if (maxPrice !== undefined) filter.price.$lte = maxPrice
  }

  const results = await Property.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: User.collection.name,
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
      },
    },
    { $unwind: '$owner' },
    {
      $match: {
        'owner.role': 'seller',
        'owner.accountStatus': 'active',
      },
    },
    {
      $facet: {
        properties: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              title: 1,
              description: 1,
              category: 1,
              type: 1,
              purpose: 1,
              price: 1,
              priceFrequency: 1,
              area: 1,
              areaUnit: 1,
              bedrooms: 1,
              bathrooms: 1,
              location: 1,
              images: 1,
              phoneVisible: 1,
              moderationStatus: 1,
              availabilityStatus: 1,
              createdAt: 1,
              updatedAt: 1,
              seller: { name: '$owner.name', phone: '$owner.phone' },
            },
          },
        ],
        total: [{ $count: 'totalItems' }],
      },
    },
  ])

  const result = results[0] ?? { properties: [], total: [] }
  const totalItems = result.total[0]?.totalItems ?? 0
  return {
    properties: result.properties.map((property) => {
      if (!property.phoneVisible) delete property.seller.phone
      property.images = property.images.map((image) => ({
        ...image,
        url: imageUrl(image.filename),
      }))
      return property
    }),
    pagination: pagination(page, limit, totalItems),
  }
}

export async function getPublicProperty(propertyId) {
  const property = await Property.findOne({
    _id: propertyId,
    moderationStatus: 'approved',
    availabilityStatus: 'available',
    recordStatus: 'active',
  }).populate({
    path: 'owner',
    select: 'name phone role accountStatus',
    match: { role: 'seller', accountStatus: 'active' },
  })
  if (!property?.owner) {
    throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
  }
  return serializeProperty(property)
}

export async function listPropertiesForModeration({ page, limit, moderationStatus }) {
  const filter = { moderationStatus: moderationStatus ?? 'pending' }
  if (!moderationStatus || moderationStatus === 'pending') {
    filter.recordStatus = 'active'
  }
  const [properties, totalItems] = await Promise.all([
    Property.find(filter)
      .populate('owner', 'name email phone role accountStatus')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter),
  ])
  return {
    properties: properties.map(serializeProperty),
    pagination: pagination(page, limit, totalItems),
  }
}

export async function reviewProperty(propertyId, adminId, decision) {
  const property = await Property.findOneAndUpdate(
    { _id: propertyId, moderationStatus: 'pending', recordStatus: 'active' },
    {
      $set: {
        moderationStatus: decision.moderationStatus,
        rejectionReason: decision.moderationStatus === 'rejected' ? decision.rejectionReason : '',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    },
    { returnDocument: 'after', runValidators: true },
  ).populate('owner', 'name email phone role accountStatus')

  if (!property) {
    const exists = await Property.exists({ _id: propertyId })
    if (!exists) {
      throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found.')
    }
    throw new AppError(409, 'PROPERTY_ALREADY_REVIEWED', 'Only active pending listings can be reviewed.')
  }
  return serializeProperty(property)
}
