import { Router } from 'express'
import { catController } from '../Controllers/catController.js'
import { multerMiddleware } from '../helper/multerHelper.js'
import { verifyExistJWT } from '../middleware/checkJWT.js'
const catRouter = Router()

catRouter.post('/', catController.createCategory)
catRouter.post(
  '/food',
  [verifyExistJWT, multerMiddleware],
  catController.createFood
)
catRouter.get('/:id', catController.getAllCategoriesForIdMenu)
catRouter.get('/food/:id', catController.getAllFoodsForIdMenu)
catRouter.get(
  '/cascade_categories/:id',
  
  catController.getCategoriesWithCascadeData
)
catRouter.patch('/:id', verifyExistJWT, catController.editCategory)
catRouter.patch(
  '/food/:id',
  [verifyExistJWT, multerMiddleware],
  catController.editFood
)
catRouter.patch(
  '/food/state/:id_food',
  verifyExistJWT,
  catController.handleStateFromFood
)

catRouter.delete('/food/:id', verifyExistJWT, catController.deleteFood)
catRouter.delete('/:id', verifyExistJWT, catController.deleteCategory)

export default catRouter
