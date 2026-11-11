import { Router } from 'express'
import * as propertyController from '../controllers/property.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import uploadPropertyImages from '../middlewares/uploadPropertyImages.js'
import validate from '../middlewares/validate.js'
import {
  createPropertyBodySchema,
  deleteImageParamsSchema,
  propertyIdParamsSchema,
  publicPropertyListQuerySchema,
  sellerPropertyListQuerySchema,
  updateAvailabilityBodySchema,
  updatePropertyBodySchema,
} from '../validators/property.validators.js'

const router = Router()
const sellerAccess = [authenticate, authorize('seller')]

router.get(
  '/',
  validate({ query: publicPropertyListQuerySchema }),
  propertyController.listPublicProperties,
)
router.get(
  '/mine',
  ...sellerAccess,
  validate({ query: sellerPropertyListQuerySchema }),
  propertyController.listSellerProperties,
)
router.get(
  '/mine/:id',
  ...sellerAccess,
  validate({ params: propertyIdParamsSchema }),
  propertyController.getSellerProperty,
)
router.post(
  '/',
  ...sellerAccess,
  uploadPropertyImages,
  validate({ body: createPropertyBodySchema }),
  propertyController.createProperty,
)
router.patch(
  '/:id/availability',
  ...sellerAccess,
  validate({ params: propertyIdParamsSchema, body: updateAvailabilityBodySchema }),
  propertyController.updateAvailability,
)
router.delete(
  '/:id/images/:filename',
  ...sellerAccess,
  validate({ params: deleteImageParamsSchema }),
  propertyController.deleteSellerImage,
)
router.patch(
  '/:id',
  ...sellerAccess,
  uploadPropertyImages,
  validate({ params: propertyIdParamsSchema, body: updatePropertyBodySchema }),
  propertyController.updateSellerProperty,
)
router.delete(
  '/:id',
  ...sellerAccess,
  validate({ params: propertyIdParamsSchema }),
  propertyController.archiveProperty,
)
router.get(
  '/:id',
  validate({ params: propertyIdParamsSchema }),
  propertyController.getPublicProperty,
)

export default router
