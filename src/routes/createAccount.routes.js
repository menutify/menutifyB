import { Router } from 'express'

import createAccountController from '../Controllers/createAccountController.js'
import { emailCheck, passwordCheck } from '../middleware/cheks.js'
import checking from '../middleware/checkDataEntry.js'
import { userDontExistInBody } from '../middleware/checkDBEntry.js'
import { verifyExistJWTinHeaders } from '../middleware/checkJWT.js'

const createAccountRouter = Router()

createAccountRouter.post(
  '/verify',
  [
    emailCheck('email'),
    passwordCheck('password'),
    passwordCheck('repassword'),
    checking,
    userDontExistInBody
  ],
  createAccountController.sendEmailUser
)

createAccountRouter.post(
  '/test-create',
  createAccountController.directCreateNewUser
)

// header: Authorization:authToken
createAccountRouter.post(
  '/create',
  [verifyExistJWTinHeaders],
  createAccountController.createNewUser
)

createAccountRouter.post(
  '/complete',

  createAccountController.caComplete
)

export default createAccountRouter
