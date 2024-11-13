import Stripe from 'stripe'
import dotenv, { config } from 'dotenv'

dotenv, config()
const stripe = Stripe(process.env.SK_STRIPE)

//!logica con PAYMENTELEMENT
export const subFromStripe = async (customerId) => {
  console.log({ customerId })
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: process.env.PRICE_ID_STRIPE
        }
      ],
      // allow-incomplete o  null -> se hace el pago o no entras a la aplicacion
      // default_incomplete -> entras a la aplicacion y luego se te activa el vip cuandose complete el pago
      payment_behavior: 'default_incomplete',
      //evita que el usuario tenga que ingresar su tarjeta cada vez que se actulice la suscripcion, porque guarda el metodo de pago
      payment_settings: { save_default_payment_method: 'on_subscription' },
      //expande la respuesta, muestra datos del payment intent
      expand: ['latest_invoice.payment_intent']
    })

    // console.log({ subscription })
    if (
      !subscription ||
      !subscription.latest_invoice
      // ||
      // subscription.status !== 'active' || 'open'
    ) {
      return { error: true, msg: 'Subscription no creada' }
    }

    const customData = await stripe.customers.retrieve(customerId)
    console.log(customData)
    return { error: false, data: { subscription }, msg: 'Subscripcion creada' }
  } catch (error) {
    console.log({ error })
    return { error: true, msg: 'Error Stripe Subscription', data: { error } }
  }
}

export const subFromStripeOther = async (customId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1500,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true
      },
      customer: customId
    })

    if (!paymentIntent) return { error: true, msg: 'Pago no creado' }

    console.log({
      pk: process.env.PK_STRIPE,
      price: process.env.PRICE_ID_STRIPE,
      clientSecret: paymentIntent.client_secret,
      customId
    })

    const subscription = await stripe.subscriptions.create({
      customer: paymentIntent.client_secret,
      currency: 'usd',
      items: [
        {
          price: process.env.PRICE_ID_STRIPE
        }
      ],
      // allow-incomplete o  null -> se hace el pago o no entras a la aplicacion
      // default_incomplete -> entras a la aplicacion y luego se te activa el vip cuandose complete el pago
      // payment_behavior: 'default_incomplete',
      //evita que el usuario tenga que ingresar su tarjeta cada vez que se actulice la suscripcion, porque guarda el metodo de pago
      payment_settings: { save_default_payment_method: 'on_subscription' },
      //expande la respuesta, muestra datos del payment intent
      expand: ['latest_invoice.payment_intent']
    })
    if (
      !subscription ||
      !subscription.latest_invoice ||
      subscription.status !== 'active'
    ) {
      return { error: true, msg: 'Subscription no creada' }
    }

    return { error: false, data: { subscription }, msg: 'Subscripcion creada' }
  } catch (error) {
    return { error: true, msg: 'Error Stripe Subscription', data: { error } }
  }
}
