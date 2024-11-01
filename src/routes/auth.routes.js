import { Router } from 'express'
import { authController } from '../Controllers/authController.js'
const authRouter = Router()

authRouter.get('/me', authController.getMe)
authRouter.post('/sendemail', authController.sendEmail)
authRouter.post('/reset-password', authController.resetPassword)

export default authRouter
