import { multerMiddleware } from '../helper/multerHelper.js'
import { Router } from 'express'
import { logoController } from '../Controllers/logoController.js'
const logoRouter = Router()

logoRouter.get('/:id', logoController.getLogos)

logoRouter.post('/:id', multerMiddleware, logoController.postLogos)

export default logoRouter
