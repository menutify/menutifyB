import { Router } from 'express'
// import { check } from 'express-validator'
// import check from '../middleware/check.js'

const userRouter = Router()
import { userControllerFunctions } from '../Controllers/userController.js'

userRouter.get('/', userControllerFunctions.getUser)
userRouter.post('/', userControllerFunctions.postUser)

export default userRouter
