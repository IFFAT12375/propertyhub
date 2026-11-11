import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { env } from '../config/env.js'
import * as authController from '../controllers/auth.controller.js'
import validate from '../middlewares/validate.js'
import AppError from '../utils/AppError.js'
import {
  loginBodySchema,
  registerBodySchema,
} from '../validators/auth.validators.js'

const router = Router()
const authRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(_req, _res, next) {
    next(new AppError(
      429,
      'AUTH_RATE_LIMIT_EXCEEDED',
      'Too many authentication attempts. Please try again later.',
    ))
  },
})

router.post('/register', authRateLimit, validate({ body: registerBodySchema }), authController.register)
router.post('/login', authRateLimit, validate({ body: loginBodySchema }), authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)

export default router
