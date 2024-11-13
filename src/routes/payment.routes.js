import express,{ Router } from 'express'

const paymentRouter = Router()

paymentRouter.post(
  '/webhook-menutify',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('WEBHOOK ACTIVADA')
    const sig = req.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err) {
      console.log('Error al verificar el webhook', err)
      return res.status(400).send(`Webhook error: ${err.message}`)
    }

    // Maneja el evento 'invoice.payment_succeeded'
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object
      const customerId = invoice.customer // ID del cliente
      const paymentIntentId = invoice.payment_intent // ID del PaymentIntent
      const amountPaid = invoice.amount_paid // Monto pagado
      const currency = invoice.currency // Moneda en la que se pagó

      console.log('Pago exitoso')
      console.log(`Customer ID: ${customerId}`)
      console.log(`Payment Intent ID: ${paymentIntentId}`)
      console.log(`Amount Paid: ${amountPaid}`)
      console.log(`Currency: ${currency}`)

      // Aquí puedes hacer lo que necesites con los datos: actualizar la base de datos, activar suscripción, etc.
      // Por ejemplo, actualizar la base de datos con el estado de la suscripción del cliente
    }

    res.status(200).send('Webhook recibido')
  }
)

export default paymentRouter
