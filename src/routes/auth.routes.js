import { Router } from 'express'
import { authController } from '../Controllers/authController.js'
import { existJWT, vefiryExistJWT } from '../middleware/checkJWT.js'
import { emailCheck } from '../middleware/cheks.js'
import checking from '../middleware/checkDataEntry.js'
const authRouter = Router()

authRouter.get('/me', [existJWT, vefiryExistJWT], authController.getMe)
authRouter.post('/sendemail',[emailCheck('email'),checking], authController.sendEmail)
authRouter.post('/reset-password', authController.resetPassword)

export default authRouter
