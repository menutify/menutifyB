import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const stripe = Stripe(process.env.SK_STRIPE)

//crea un clientId en stipe y lo retorna
const createCustomer = async (req, res) => {
  try {
    const { email } = req.body
    
    const customer = await stripe.customers.create({
      email: email
    })

    return res.status(200).json({
      data: { customer: customer.id },
      msg: 'customerId creado',
      error: false
    })
  } catch (error) {
    return res
      .status(500)
      .json({ msg: 'error al obtener el clienteID', error: true })
  }
}

const onePayWithStripe = async (req, res) => {
  const { customerId } = req.body

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
}

const subPayWithStripe = async (req, res) => {
  const { customerId } = req.body

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: process.env.PRICE_ID_STRIPE
        }
      ],
      payment_behavior: 'default_incomplete',
      //* se guarda el metodo de pago por defecto
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    })
    // Verifica que la suscripción fue creada correctamente
    if (!subscription || !subscription.latest_invoice) {
      return res
        .status(400)
        .json({ msg: 'Subscription creation failed', error: true })
    }
    res.status(200).send({
      msg: 'Suscribcion completada',
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      },
      error: false
    })
  } catch (error) {
    return res.status(500).json({ msg: 'No se pudo crear la sub', error: true })
  }
}

const stripeController = {
  createCustomer
}

export default stripeController
