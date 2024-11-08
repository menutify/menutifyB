import { Router } from 'express'
import paymentController from '../Controllers/paymentController.js'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import express from 'express'
dotenv.config()

const stripe = Stripe(process.env.SK_STRIPE)
// console.log({ PK: process.env.PK_STRIPE })
const payRouter = Router()
const app = express()
// payRouter.post('/create-payment', paymentController.createPayment)

payRouter.get('/config', (req, res) => {
  res.send({
    publishableKey: process.env.PK_STRIPE
  })
})

// fetch("http://localhost:3000/api/create-payment-intent")
const calculate_tax = async (orderAmount, currency) => {
  const taxCalculation = await stripe.tax.calculations.create({
    currency,
    customer_details: {
      address: {
        line1: '10709 Cleary Blvd',
        city: 'Plantation',
        state: 'FL',
        postal_code: '33322',
        country: 'US'
      },
      address_source: 'shipping'
    },
    line_items: [
      {
        amount: orderAmount,
        reference: 'ProductRef',
        tax_behavior: 'exclusive',
        tax_code: 'txcd_30011000'
      }
    ]
  })
  return taxCalculation
}

payRouter.get('/create-payment-intent', async (req, res) => {
  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  // if (calculateTax) {
  //   let taxCalculation = await calculate_tax(orderAmount, 'usd')

  //   paymentIntent = await stripe.paymentIntents.create({
  //     currency: 'usd',
  //     amount: taxCalculation.amount_total,
  //     automatic_payment_methods: { enabled: true },
  //     metadata: { tax_calculation: taxCalculation.id }
  //   })
  // } else {
  //   paymentIntent = await stripe.paymentIntents.create({
  //     currency: 'usd',
  //     amount: orderAmount,
  //     automatic_payment_methods: { enabled: true }
  //   })
  // }
  let orderAmount = 1400
  let paymentIntent

  try {
    paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: orderAmount,
      automatic_payment_methods: { enabled: true }
    })
    // Send publishable key and PaymentIntent details to client
    console.log('llamando a primer metodo de pago', {
      data: paymentIntent.client_secret
    })
    res.send({
      clientSecret: paymentIntent.client_secret
    })
  } catch (e) {
    console.log({ e })
    return res.status(400).send({
      error: {
        message: e.message
      }
    })
  }
})

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
payRouter.post('/webhook', async (req, res) => {
  let data, eventType

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event
    let signature = req.headers['stripe-signature']
    console.log({ signature })
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`)
      return res
        .sendStatus(400)
        .json({ msg: '⚠️  Webhook signature verification failed.' })
    }

    data = event.data
    eventType = event.type
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data
    eventType = req.body.type
  }

  if (eventType === 'payment_intent.succeeded') {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log('💰 Payment captured!', { data, eventType })
  } else if (eventType === 'payment_intent.payment_failed') {
    console.log('❌ Payment failed.')
  }
  res.sendStatus(200)
})

// payRouter.post('/create-subscription', async (req, res) => {
//   const id_price = 'price_1QIZ05LwPyf2SXpsNCe0l6AJ'
//   const { customerId } = req.body;

//   try {
//     // Crea el Setup Intent
//     const setupIntent = await stripe.setupIntents.create({
//       customer: customerId, // El ID del cliente existente
//       payment_method_types: ['card'],
//     });

//     res.send({ clientSecret: setupIntent.client_secret });
//   } catch (error) {
//     res.status(400).send({ error: error.message });
//   }
// })

// Backend: Crear Suscripción
payRouter.post('/create-subscription', async (req, res) => {
  const { customerId, paymentMethodId } = req.body

  try {
    // Asociar el método de pago con el cliente
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    })

    // Establecer el método de pago como predeterminado
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    })

    // Crear la suscripción
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: 'price_1QIdZSLwPyf2SXpsU7iLbc1z' }], // Reemplaza 'price_xxxx' con el ID de tu plan
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      currency: 'usd'
    })
    console.log({ item: subscription.items.data[0].plan })
    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionCreated: subscription.created
    })
  } catch (error) {
    res.status(400).send({ error: { message: error.message } })
  }
})

//creamos un cliente para la sub
payRouter.post('/create-customer1', async (req, res) => {
  const { email } = req.body // el email del cliente

  try {
    // Crear cliente en Stripe
    const customer = await stripe.customers.create({
      email: email
    })

    // Regresar el ID del cliente al frontend
    res.send({ customerId: customer.id })
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

payRouter.post('/create-customer', async (req, res) => {
  try {
    const { email } = req.body
    const customer = await stripe.customers.create({
      email: email
    })

    return res.status(200).json({ customer: customer.id })
  } catch (error) {
    console.log({ errorInCustom: error })
    return res.status(500).json({ msg: 'error al obtener el clienteID', error })
  }
})

payRouter.post('/create-intent', async (req, res) => {
  const { customerId } = req.body

  console.log({ customerId })
  try {
    const intent = await stripe.paymentIntents.create({
      // To allow saving and retrieving payment methods, provide the Customer ID.
      customer: customerId,
      amount: 2000,
      currency: 'usd',
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: { enabled: true }
    })
    res.json({ client_secret: intent.client_secret })
  } catch (error) {
    console.log({ errorInCreateIntent: error })
  }
})

payRouter.post('/sub-intent', async (req, res) => {
  const { customerId } = req.body

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: 'price_1QIdZSLwPyf2SXpsU7iLbc1z'
        }
      ],
      payment_behavior: 'default_incomplete',
      //* se guarda el metodo de pago por defecto
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    })
    // Verifica que la suscripción fue creada correctamente
    if (!subscription || !subscription.latest_invoice) {
      return res.status(400).json({ msg: 'Subscription creation failed' })
    }
    res.status(200).send({
      msg: 'hola',
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    })
  } catch (error) {
    console.log({ errorInSub: error })
    return res.status(500).json({ msg: 'No se pudo obtaener la sub', error })
  }
})

payRouter.post(
  '/webhook-intent',

  (req, res) => {
    console.log({ path: req.path })
    const endpointSecret = 'whsec_HIYDuc04vJbs754qePeqb6Z3usOzoQY9'
    const cliendpointSECRET =
      'whsec_569ce994359e443b77c0e54790fe229bb5c344b06a1a1e5460398c02c7b86eb6'
    const sig = req.headers['stripe-signature']
    let event
    console.log('entramos al wb')
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, cliendpointSECRET)
      console.log('evento conseguido')
    } catch (error) {
      console.log({ error_event: error })
      return
    }

    // Handle the event
    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceded = event.data.object
        // Then define and call a function to handle the event payment_intent.amount_capturable_updated
        console.log(0)
        break
      case 'payment_intent.amount_capturable_updated':
        const paymentIntentAmountCapturableUpdated = event.data.object
        // Then define and call a function to handle the event payment_intent.amount_capturable_updated
        console.log(1)
        break
      case 'payment_intent.canceled':
        const paymentIntentCanceled = event.data.object
        // Then define and call a function to handle the event payment_intent.canceled
        console.log(2)
        break
      case 'payment_intent.created':
        const paymentIntentCreated = event.data.object
        // Then define and call a function to handle the event payment_intent.created
        console.log(3)
        break
      case 'payment_intent.partially_funded':
        const paymentIntentPartiallyFunded = event.data.object
        // Then define and call a function to handle the event payment_intent.partially_funded
        console.log(4)
        break
      case 'payment_intent.payment_failed':
        const paymentIntentPaymentFailed = event.data.object
        // Then define and call a function to handle the event payment_intent.payment_failed
        console.log(5)
        break
      case 'payment_intent.processing':
        const paymentIntentProcessing = event.data.object
        // Then define and call a function to handle the event payment_intent.processing
        console.log(6)
        break
      case 'payment_intent.requires_action':
        const paymentIntentRequiresAction = event.data.object
        // Then define and call a function to handle the event payment_intent.requires_action
        console.log(7)
        break
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object
        // Then define and call a function to handle the event payment_intent.succeeded
        console.log(8)
        break
      case 'payout.canceled':
        const payoutCanceled = event.data.object
        // Then define and call a function to handle the event payout.canceled
        console.log(9)
        break
      case 'payout.created':
        const payoutCreated = event.data.object
        // Then define and call a function to handle the event payout.created
        console.log(10)
        break
      case 'payout.failed':
        const payoutFailed = event.data.object
        // Then define and call a function to handle the event payout.failed
        console.log(11)
        break
      case 'payout.paid':
        const payoutPaid = event.data.object
        // Then define and call a function to handle the event payout.paid
        console.log(12)
        break
      case 'payout.reconciliation_completed':
        const payoutReconciliationCompleted = event.data.object
        // Then define and call a function to handle the event payout.reconciliation_completed
        console.log(13)
        break
      case 'payout.updated':
        const payoutUpdated = event.data.object
        // Then define and call a function to handle the event payout.updated
        console.log(14)
        break

      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true })
  }
)

export default payRouter
