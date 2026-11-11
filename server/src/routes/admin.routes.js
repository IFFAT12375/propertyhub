import { Router } from 'express'
import * as sellerApplicationController from '../controllers/sellerApplication.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import validate from '../middlewares/validate.js'
import {
  listSellerApplicationsQuerySchema,
  reviewSellerApplicationBodySchema,
  sellerApplicationIdParamsSchema,
} from '../validators/sellerApplication.validators.js'

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

export default router
