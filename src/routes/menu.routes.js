import { Router } from 'express'
import { menuController } from '../Controllers/menuController.js'
import { verifyExistJWT } from '../middleware/checkJWT.js'
import { multerMiddleware } from '../helper/multerHelper.js'

const menuRouter = Router()

menuRouter.patch(
  '/',
  [verifyExistJWT, multerMiddleware],
  menuController.updateMenu
)
menuRouter.get('/', menuController.getMenus)
// menuRouter.post('/', menuController.postMenus)
// menuRouter.put('/:id', menuController.putMenus)
// menuRouter.delete('/:id', menuController.deleteMenus)

export default menuRouter
