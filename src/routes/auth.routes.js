import { Router } from 'express'
import { authController } from '../Controllers/authController.js'
import { verifyExistJWT, verifyDataFromJWT, verifyExistJWTinHeaders } from '../middleware/checkJWT.js'
import { emailCheck, passwordCheck } from '../middleware/cheks.js'
import checking, { passwordEqual } from '../middleware/checkDataEntry.js'
import { userExistInBody } from '../middleware/checkDBEntry.js'
const authRouter = Router()

//debe existir authToken en cookies
authRouter.get(
  '/me',
  [verifyExistJWT, verifyDataFromJWT, userExistInBody],
  authController.getMe
)
//enviar por body:{email}
authRouter.post(
  '/sendemail',
  [emailCheck('email'), checking, userExistInBody],
  authController.sendEmail
)
//enviar por body,password, repassword  + cookie authToken
authRouter.post(
  '/reset-password',
  [
      passwordCheck('password'),
      passwordCheck('repassword'),
      checking,
      passwordEqual,
      verifyExistJWTinHeaders,userExistInBody
  ],
  authController.resetPassword
)

export default authRouter
