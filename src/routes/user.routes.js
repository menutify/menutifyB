import { Router } from 'express'
// import { check } from 'express-validator'
// import check from '../middleware/check.js'
import db from '../database/dbConexion.js'
const userRouter = Router()
import { userControllerFunctions } from '../Controllers/userController.js'
userRouter.get('/', userControllerFunctions.getUser)

export default userRouter
