import Favorite from '../models/Favorite.js'
import Property from '../models/Property.js'
import AppError from '../utils/AppError.js'
import { imageUrl } from '../utils/imageStorage.js'

const favoritePropertyFields =
  'title description category type purpose price priceFrequency area areaUnit location images bedrooms bathrooms phoneVisible moderationStatus availabilityStatus recordStatus createdAt'

function pagination(page, limit, totalItems) {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  }
}

function serializeFavorite(favorite) {
  const value = favorite.toObject()
  if (value.property) {
    value.property.images = value.property.images.map((image) => ({
      ...image,
      url: imageUrl(image.filename),
    }))
  }
  return value
}

export async function addFavorite(userId, propertyId) {
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
    throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property is not currently available to favorite.')
  }

  try {
    const favorite = await Favorite.create({ user: userId, property: propertyId })
    await favorite.populate({
      path: 'property',
      select: favoritePropertyFields,
    })
    return { favorite: serializeFavorite(favorite), created: true }
  } catch (error) {
    if (error.code !== 11000) throw error
    const favorite = await Favorite.findOne({ user: userId, property: propertyId })
      .populate({
        path: 'property',
        select: favoritePropertyFields,
      })
    if (!favorite) throw error
    return { favorite: serializeFavorite(favorite), created: false }
  }
}

export async function listFavorites(userId, { page, limit }) {
  const filter = { user: userId }
  const [favorites, totalItems] = await Promise.all([
    Favorite.find(filter)
      .populate({
        path: 'property',
        select: favoritePropertyFields,
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Favorite.countDocuments(filter),
  ])
  return {
    favorites: favorites.map(serializeFavorite),
    pagination: pagination(page, limit, totalItems),
  }
}

export async function removeFavorite(userId, propertyId) {
  await Favorite.deleteOne({ user: userId, property: propertyId })
}
