import { Router } from 'express'
// import { check } from 'express-validator'
// import check from '../middleware/check.js'

const userRouter = Router()
import { userControllerFunctions } from '../Controllers/userController.js'
import { emailCheck, nameCheck, passwordCheck } from '../middleware/cheks.js'
import checking from '../middleware/checkDataEntry.js'
import { userDontExistInBody } from '../middleware/checkDBEntry.js'
import {
  verifyExistJWT,
  verifyExistJWTinHeaders
} from '../middleware/checkJWT.js'
//!--------uso Postman
userRouter.get('/id', verifyExistJWT, userControllerFunctions.getUserById)

//!--------uso Postman
// userRouter.put('/', userControllerFunctions.changeUserNewDetail)
// //!--------uso Postman
// userRouter.put('/:id', userControllerFunctions.putUser)
// //!--------uso Postman
// userRouter.delete('/:id', userControllerFunctions.deleteUser)

export default userRouter
