import { Router } from 'express'
import {catController } from '../Controllers/catController.js'

const catRouter = Router()

catRouter.get('/', catController.getCat)
catRouter.post('/', catController.postCat)
catRouter.put('/:id', catController.putCat)
catRouter.delete(':id', catController.delCat)

export default catRouter
