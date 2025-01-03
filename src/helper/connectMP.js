import dotenv from 'dotenv'
import { Payment, MercadoPagoConfig, PreApproval } from 'mercadopago'

dotenv.config()

const mp_pk = process.env.MERCADOPAGO_PRIVATE_CREDENTIAL
// console.log({ mp_pk })
const client = new MercadoPagoConfig({ accessToken: mp_pk, options: { timeout: 5000 } })
// console.log({ client })
export const payment = new Payment(client)
// console.log({ payment })
export const subscription = new PreApproval(client)
