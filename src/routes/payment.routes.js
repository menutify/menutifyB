import { Router } from 'express'

import paymentMPController from '../Controllers/paymentMPController.js'
import { verifyExistJWT } from '../middleware/checkJWT.js'

const paymentRouter = Router()

paymentRouter.post('/create-payment',verifyExistJWT, paymentMPController.createPayment)

paymentRouter.post('/webhook-payment', paymentMPController.webhookPayment)

paymentRouter.post('/create-sub', paymentMPController.createSubscription)

paymentRouter.post('/webhook_sub', paymentMPController.webhookSub)


export default paymentRouter
