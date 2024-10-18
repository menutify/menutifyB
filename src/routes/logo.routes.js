import { multerErrorHandlerMiddleware } from '../helper/multerHelper.js'
import { Router } from 'express'
import { logoController } from '../Controllers/logoController.js'
const logoRouter = Router()

logoRouter.get('/:id', logoController.getLogos)

logoRouter.post('/:id', multerErrorHandlerMiddleware, logoController.postLogos)

export default logoRouter
