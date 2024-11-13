import { Router } from 'express'

import dotenv from 'dotenv'
import createAccountController from '../Controllers/createAccountController.js'
import stripeController from '../Controllers/stripeController.js'
import { emailCheck, passwordCheck } from '../middleware/cheks.js'
import checking from '../middleware/checkDataEntry.js'
import { userDontExistInBody } from '../middleware/checkDBEntry.js'
import { verifyExistJWTinHeaders } from '../middleware/checkJWT.js'

dotenv.config()
const createAccountRouter = Router()

//necesario para iniciar elements en postman
createAccountRouter.get('/config', (req, res) => {
  res.status(200).json({
    publicKey: process.env.PK_STRIPE
  })
})

// body: { name,email,password}
createAccountRouter.post(
  '/',
  [
    emailCheck('email'),
    passwordCheck('password'),
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

// body: { email }
createAccountRouter.post(
  '/create-customer',
  [emailCheck('email'), checking],
  stripeController.createCustomer
)

createAccountRouter.post(
  '/create-payment-stripe',
  [emailCheck('email'), checking],
  createAccountController.createPaymentWithStripe
)

createAccountRouter.post(
  '/create-payment-stripe-2',
  createAccountController.createPaymentWithStripe
)

export default createAccountRouter
