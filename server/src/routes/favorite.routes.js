import { Router } from 'express'
import * as favoriteController from '../controllers/favorite.controller.js'
import authenticate from '../middlewares/authenticate.js'
import validate from '../middlewares/validate.js'
import {
  favoriteBodySchema,
  favoriteIdParamsSchema,
  favoriteListQuerySchema,
} from '../validators/favorite.validators.js'

const router = Router()

router.use(authenticate)
router.post('/', validate({ body: favoriteBodySchema }), favoriteController.addFavorite)
router.get('/', validate({ query: favoriteListQuerySchema }), favoriteController.listFavorites)
router.delete(
  '/:propertyId',
  validate({ params: favoriteIdParamsSchema }),
  favoriteController.removeFavorite,
)

export default router
