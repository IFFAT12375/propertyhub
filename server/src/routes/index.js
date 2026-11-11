import { Router } from 'express'
import adminRoutes from './admin.routes.js'
import authRoutes from './auth.routes.js'
import sellerApplicationRoutes from './sellerApplication.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/seller-applications', sellerApplicationRoutes)
router.use('/admin', adminRoutes)

export default router
