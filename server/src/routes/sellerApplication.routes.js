import { Router } from 'express'
import * as sellerApplicationController from '../controllers/sellerApplication.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import validate from '../middlewares/validate.js'
import {
  createSellerApplicationBodySchema,
  listSellerApplicationsQuerySchema,
} from '../validators/sellerApplication.validators.js'

const router = Router()

router.use(authenticate)
router.post(
  '/',
  validate({ body: createSellerApplicationBodySchema }),
  sellerApplicationController.createApplication,
)
router.get(
  '/mine',
  validate({ query: listSellerApplicationsQuerySchema }),
  sellerApplicationController.listMyApplications,
)

export default router
