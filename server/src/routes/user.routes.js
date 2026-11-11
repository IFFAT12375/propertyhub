import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import authenticate from '../middlewares/authenticate.js'
import validate from '../middlewares/validate.js'
import { updateProfileBodySchema } from '../validators/user.validators.js'

const router = Router()

router.use(authenticate)
router.get('/me', userController.getCurrentUser)
router.patch('/me', validate({ body: updateProfileBodySchema }), userController.updateCurrentUser)

export default router
