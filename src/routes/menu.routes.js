import { Router } from 'express'
import { menuController } from '../Controllers/menuController.js'

const menuRouter = Router()

menuRouter.get('/', menuController.getMenus)
menuRouter.get('/:id', menuController.getMenusById)
menuRouter.post('/', menuController.postMenus)
menuRouter.put('/:id', menuController.putMenus)
menuRouter.delete('/:id', menuController.deleteMenus)

export default menuRouter
