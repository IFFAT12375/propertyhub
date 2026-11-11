import { Router } from 'express'
import * as propertyController from '../controllers/property.controller.js'
import * as sellerApplicationController from '../controllers/sellerApplication.controller.js'
import * as adminUserController from '../controllers/adminUser.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import validate from '../middlewares/validate.js'
import {
  listSellerApplicationsQuerySchema,
  reviewSellerApplicationBodySchema,
  sellerApplicationIdParamsSchema,
} from '../validators/sellerApplication.validators.js'
import {
  listPropertyModerationQuerySchema,
  propertyIdParamsSchema,
  reviewPropertyBodySchema,
} from '../validators/property.validators.js'
import {
  adminUserIdParamsSchema,
  listUsersQuerySchema,
  updateUserStatusBodySchema,
} from '../validators/admin.validators.js'

const router = Router()

router.use(authenticate, authorize('admin'))
router.get(
  '/seller-applications',
  validate({ query: listSellerApplicationsQuerySchema }),
  sellerApplicationController.listApplications,
)
router.patch(
  '/seller-applications/:id/review',
  validate({
    params: sellerApplicationIdParamsSchema,
    body: reviewSellerApplicationBodySchema,
  }),
  sellerApplicationController.reviewApplication,
)
router.get(
  '/properties',
  validate({ query: listPropertyModerationQuerySchema }),
  propertyController.listPropertiesForModeration,
)
router.patch(
  '/properties/:id/review',
  validate({ params: propertyIdParamsSchema, body: reviewPropertyBodySchema }),
  propertyController.reviewProperty,
)
router.get(
  '/users',
  validate({ query: listUsersQuerySchema }),
  adminUserController.listUsers,
)
router.patch(
  '/users/:id/status',
  validate({ params: adminUserIdParamsSchema, body: updateUserStatusBodySchema }),
  adminUserController.updateSellerAccountStatus,
)

export default router
