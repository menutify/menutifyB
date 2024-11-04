import { Router } from 'express'
import { loginController } from '../Controllers/loginController.js'
import { emailCheck, passwordCheck } from '../middleware/cheks.js'
import checking from '../middleware/checkDataEntry.js'

const loginRouter = Router()

loginRouter.post(
  '/',
  [emailCheck('email'), passwordCheck('password'), checking],
  loginController.normalLogin
)
loginRouter.post('/google', loginController.googleLogin)
loginRouter.post('/facebook', loginController.facebookLogin)

export default loginRouter
