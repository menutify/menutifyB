import { Router } from 'express'
// import { check } from 'express-validator'
// import check from '../middleware/check.js'

const userRouter = Router()
import { userControllerFunctions } from '../Controllers/userController.js'

userRouter.get('/', userControllerFunctions.getUser)
userRouter.post('/', userControllerFunctions.postUser)
userRouter.post('/create', userControllerFunctions.createNewUser)
userRouter.put('/', userControllerFunctions.changeUserNewDetail)
userRouter.put('/:id', userControllerFunctions.putUser)
userRouter.delete('/:id', userControllerFunctions.deleteUser)

export default userRouter
