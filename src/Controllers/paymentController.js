import Stripe from 'stripe'

// const stripe = Stripe(process.env.PK_STRIPE)

const createPayment = async (req, res) => {
  console.log({ PK: process.env.PK_STRIPE })
  const { amount, currency, paymentMethodId } = req.body

  console.log({ amount, currency, paymentMethodId })
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirm: true
    })

    console.log({ paymentIntent })
    res.json({ success: true, paymentIntent })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const paymentController = {
  createPayment
}

export default paymentController
