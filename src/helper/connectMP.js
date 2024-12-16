import dotenv from 'dotenv'
import { Payment, MercadoPagoConfig, PreApproval } from 'mercadopago'

dotenv.config()

const mp_pk = process.env.MERCADOPAGO_PRIVATE_CREDENTIAL
console.log({ mp_pk })
const client = new MercadoPagoConfig({ accessToken: mp_pk })
export const payment = new Payment(client)
export const subscription = new PreApproval(client)
