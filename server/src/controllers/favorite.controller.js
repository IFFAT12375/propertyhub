import * as favoriteService from '../services/favorite.service.js'

export async function addFavorite(req, res) {
  const result = await favoriteService.addFavorite(
    req.user._id,
    req.validated.body.propertyId,
  )
  res.status(result.created ? 201 : 200).json({
    success: true,
    data: { favorite: result.favorite },
  })
}

export async function listFavorites(req, res) {
  const result = await favoriteService.listFavorites(
    req.user._id,
    req.validated.query,
  )
  res.status(200).json({ success: true, data: result })
}

export async function removeFavorite(req, res) {
  await favoriteService.removeFavorite(
    req.user._id,
    req.validated.params.propertyId,
  )
  res.status(200).json({ success: true, message: 'Favorite removed.' })
}
