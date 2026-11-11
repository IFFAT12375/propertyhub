import { Router } from 'express'
import adminRoutes from './admin.routes.js'
import authRoutes from './auth.routes.js'
import favoriteRoutes from './favorite.routes.js'
import inquiryRoutes from './inquiry.routes.js'
import sellerApplicationRoutes from './sellerApplication.routes.js'
import propertyRoutes from './property.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/favorites', favoriteRoutes)
router.use('/inquiries', inquiryRoutes)
router.use('/seller-applications', sellerApplicationRoutes)
router.use('/properties', propertyRoutes)
router.use('/admin', adminRoutes)

export default router
