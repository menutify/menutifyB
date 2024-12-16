import { Router } from 'express'
import { verifyExistJWT } from '../middleware/checkJWT.js'
import restaurantController from '../Controllers/restaurantController.js'
import { multerMiddleware } from '../helper/multerHelper.js'
const restaurantRouter = Router()

restaurantRouter.get('/', verifyExistJWT, restaurantController.getRestaurant)

restaurantRouter.patch(
  '/',
  [verifyExistJWT, multerMiddleware],
  restaurantController.updateRestaurant
)

restaurantRouter.post(
  '/resturant-logo',
  [verifyExistJWT, multerMiddleware],
  restaurantController.uploadLogoRestaurant
)

restaurantRouter.delete(
  '/delete/:name',
  verifyExistJWT,
  restaurantController.deleteImage
)

// restaurantRouter.post(
//   '/restaurant-header',
//   [verifyExistJWT, multerMiddleware],
//   restaurantController.uploadHeaderRestaurant
// )

export default restaurantRouter
