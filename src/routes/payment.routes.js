import express, { Router } from 'express'
import { webhookInformation } from '../database/mailModels.js'
import { transporter } from '../helper/mailerConfig.js'
import Stripe from 'stripe'
import mercadoPago, {
  MercadoPagoConfig,
  Preference,
  Payment
} from 'mercadopago'
import dotenv from 'dotenv'

const allATMP = {
  at_test1:
    'TEST-4397423146324711-112201-53eafddd88f9fc4776fdfa41eba1ca0c-1570773738',
  at_test2:
    'APP_USR-8950001460258740-112123-eaeb93c8a62ed10b2fce0e2a54899b1f-2112128028'
}

dotenv.config()
const paymentRouter = Router()
//-----------------------------------------------------
//stripe
const endpointSecretWebhook = 'whsec_HIYDuc04vJbs754qePeqb6Z3usOzoQY9'
const stripe = Stripe(process.env.SK_STRIPE)

//-------------------------------------------------------------------------------------

//  ! para que funcione debe estar la api en la nube
//uso localtunnel para hacerlo local
//lt --port 3000
paymentRouter.post(
  '/webhook-menutify',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('WEBHOOK ACTIVADA')
    const sig = req.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecretWebhook
      )
      console.log({ event: event.type })
    } catch (err) {
      console.log('Error al verificar el webhook', err)
      return res
        .status(400)
        .json({ msg: `Webhook error: ${err.message}`, data: {}, error: true })
    }

    // Maneja el evento 'invoice.payment_succeeded'
    if (event.type === 'payment_intent.succeeded') {
      const { metadata, ...invoice } = event.data.object
      console.log({ datosDelPago: invoice })
      const customerId = invoice.customer // ID del cliente
      const paymentIntentId = invoice.id // ID del PaymentIntent
      const amountPaid = invoice.amount // Monto pagado
      const currency = invoice.currency // Moneda en la que se pagó
      const date = new Date(invoice.created * 1000)
      //id ded la factura
      const invoiceId = invoice.invoice
      console.log('Pago exitoso')
      console.log(`Customer ID: ${customerId}`)
      console.log(`Payment Intent ID: ${paymentIntentId}`)
      console.log(`Amount Paid: ${amountPaid}`)
      console.log(`Currency: ${currency}`)

      //!enviare un correo cada vez que un pago sea satisfactorio
      const mailOptions = webhookInformation(
        'gianco.marquez@gmail.com',
        customerId,
        paymentIntentId,
        amountPaid,
        currency,
        date,
        invoiceId
      )

      await transporter.sendMail(mailOptions)
      // Aquí puedes hacer lo que necesites con los datos: actualizar la base de datos, activar suscripción, etc.
      // Por ejemplo, actualizar la base de datos con el estado de la suscripción del cliente
      console.log('pagado')
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object
    }

    res.status(200).send('Webhook recibido')
  }
)

paymentRouter.get('/productData', async (req, res) => {
  res.status(200).json({
    error: false,
    msg: 'datos de producto',
    data: {
      title: 'menutifySub',
      price: 1000,
      description: 'menutify suscripcion',
      quantity: 1
    }
  })
})
paymentRouter.post('/payment-intent', async (req, res) => {
  //mp
  const clientMP = new MercadoPagoConfig({
    accessToken: allATMP.at_test1,
    options: {
      timeout: 5000
      // Establece un tiempo de espera en milisegundos
    }
  })
  const payment = new Payment(clientMP)

  try {
    const {
      token,
      transaction_amount,
      payer,
      payment_method_id,
      installments
    } = req.body

    // Validación de datos
    if (!token || !transaction_amount || !payer || !payment_method_id) {
      console.log('Faltan datos')
      return res.status(400).json({
        error: true,
        msg: 'Faltan datos obligatorios para procesar el pago.'
      })
    }

    console.log('lllegue')
    // Crear el pago con Mercado Pago
    const data = await payment.create({ body: req.body })
    console.log({
      token,
      installments,
      payer,
      payment_method_id,
      transaction_amount
    })
    // Validar si el pago fue aprobado
    if (data.status === 'approved') {
      console.log('aprove')
      console.log(data)
      return res.status(200).json({
        error: false,
        msg: 'Pago aprobado',
        data: data
      })
    } else {
      console.log('falle')
      console.log(data)
      if (data.errors) {
        console.log('Errores adicionales:', data.errors)
      }
      return res.status(400).json({
        error: true,
        msg: 'Pago rechazado',
        data: data
      })
    }
  } catch (error) {
    console.log({ error, cause: error.cause })
    res.status(500).json({
      error: true,
      msg: 'Error al procesar el pago con Mercado Pago',
      data: error
    })
  }
})

paymentRouter.post('/payment-intent2', async (req, res) => {
  try {
    const {
      token,
      transaction_amount,
      payer,
      payment_method_id,
      installments,
      issuer_id
    } = req.body

    // Validar que todos los datos requeridos están presentes
    if (!token || !transaction_amount || !payer || !payment_method_id) {
      console.log('faltan datos')
      return res.status(400).json({
        error: true,
        msg: 'Faltan datos obligatorios para procesar el pago.'
      })
    }

    const data = await payment.create({ body: req.body })
    console.log({ data })
    // Validar el estado del pago
    if (data.status === 'approved') {
      return res.status(200).json({
        error: false,
        msg: 'Pago aprobado',
        data: data
      })
    } else {
      return res.status(400).json({
        error: true,
        msg: 'Pago rechazado',
        data: data
      })
    }
  } catch (error) {
    console.log({ error })
    res
      .status(500)
      .json({ error: true, msg: 'Error al pagar con mp', data: error })
  }
})

paymentRouter.post('/createReferenceMP', async (req, res) => {
  try {
    const resp = await preferenceMP.create({
      body: {
        items: [
          {
            id: '1234',
            title: 'Suscripcion a menutify',
            description: 'Suscripcion a menutify',
            picture_url:
              'https://i.pinimg.com/736x/48/38/9b/48389b5628e0040bc0d45cb588f5114e.jpg',
            category_id: 'others',
            quantity: 1,
            currency_id: 'ARS',
            unit_price: 20000
          }
        ],
        payer: {
          name: 'gianfranco',
          surname: 'marquez',
          email: 'gianco.marquez@example.com'
        },
        expires: false,
        differential_pricing: {
          id: 1
        },
        back_urls: {
          success: 'https://test.com/success',
          failure: 'https://test.com/failure',
          pending: 'https://test.com/pending'
        }
      }
    })

    console.log({ resp })
    res
      .status(200)
      .json({ error: false, msg: 'ok', data: { resp, id: resp.id } })
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: true, msg: error, data: {} })
  }
})

export default paymentRouter
