import { Router } from 'express'
import { loginController } from '../Controllers/loginController.js'
const loginRouter = Router()

loginRouter.post('/', loginController.normalLogin)
loginRouter.post('/google', loginController.googleLogin)
loginRouter.post('/facebook', loginController.facebookLogin)

export default loginRouter
