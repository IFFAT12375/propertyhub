import * as propertyService from '../services/property.service.js'

export async function listPublicProperties(req, res) {
  const result = await propertyService.listPublicProperties(req.validated.query)
  res.status(200).json({ success: true, data: result })
}

export async function getPublicProperty(req, res) {
  const property = await propertyService.getPublicProperty(req.validated.params.id)
  res.status(200).json({ success: true, data: { property } })
}

export async function createProperty(req, res) {
  const property = await propertyService.createProperty(
    req.user,
    req.validated.body,
    req.files,
  )
  res.status(201).json({ success: true, data: { property } })
}

export async function listSellerProperties(req, res) {
  const result = await propertyService.listSellerProperties(
    req.user._id,
    req.validated.query,
  )
  res.status(200).json({ success: true, data: result })
}

export async function getSellerProperty(req, res) {
  const property = await propertyService.getSellerProperty(
    req.validated.params.id,
    req.user._id,
  )
  res.status(200).json({ success: true, data: { property } })
}

export async function updateSellerProperty(req, res) {
  const property = await propertyService.updateSellerProperty(
    req.validated.params.id,
    req.user._id,
    req.validated.body,
    req.files,
  )
  res.status(200).json({ success: true, data: { property } })
}

export async function deleteSellerImage(req, res) {
  const property = await propertyService.deleteSellerImage(
    req.validated.params.id,
    req.user._id,
    req.validated.params.filename,
  )
  res.status(200).json({ success: true, data: { property } })
}

export async function updateAvailability(req, res) {
  const property = await propertyService.updateAvailability(
    req.validated.params.id,
    req.user._id,
    req.validated.body.availabilityStatus,
  )
  res.status(200).json({ success: true, data: { property } })
}

export async function archiveProperty(req, res) {
  const property = await propertyService.archiveProperty(
    req.validated.params.id,
    req.user._id,
  )
  res.status(200).json({ success: true, data: { property } })
}

export async function listPropertiesForModeration(req, res) {
  const result = await propertyService.listPropertiesForModeration(req.validated.query)
  res.status(200).json({ success: true, data: result })
}

export async function reviewProperty(req, res) {
  const property = await propertyService.reviewProperty(
    req.validated.params.id,
    req.user._id,
    req.validated.body,
  )
  res.status(200).json({ success: true, data: { property } })
}
