import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { env } from '../config/env.js'
import * as inquiryController from '../controllers/inquiry.controller.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import optionalAuthenticate from '../middlewares/optionalAuthenticate.js'
import validate from '../middlewares/validate.js'
import AppError from '../utils/AppError.js'
import {
  createInquiryBodySchema,
  inquiryIdParamsSchema,
  listInquiriesQuerySchema,
  listMyInquiriesQuerySchema,
  updateInquiryFollowUpBodySchema,
  verifyInquiryQuerySchema,
} from '../validators/inquiry.validators.js'

const router = Router()
const inquiryRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.INQUIRY_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(_req, _res, next) {
    next(new AppError(
      429,
      'INQUIRY_RATE_LIMIT_EXCEEDED',
      'Too many inquiry attempts. Please try again later.',
    ))
  },
})

router.get(
  '/verify',
  validate({ query: verifyInquiryQuerySchema }),
  inquiryController.verifyInquiry,
)
router.post(
  '/',
  inquiryRateLimit,
  optionalAuthenticate,
  validate({ body: createInquiryBodySchema }),
  inquiryController.createInquiry,
)
router.get(
  '/mine',
  authenticate,
  validate({ query: listMyInquiriesQuerySchema }),
  inquiryController.listMyInquiries,
)
router.get(
  '/',
  authenticate,
  authorize('seller'),
  validate({ query: listInquiriesQuerySchema }),
  inquiryController.listSellerInquiries,
)
router.patch(
  '/:id/follow-up',
  authenticate,
  authorize('seller'),
  validate({ params: inquiryIdParamsSchema, body: updateInquiryFollowUpBodySchema }),
  inquiryController.updateFollowUpStatus,
)

export default router
