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

// createAccountRouter.get('/create-payment-intent', async (req, res) => {
//   // Create a PaymentIntent with the amount, currency, and a payment method type.
//   //
//   // See the documentation [0] for the full list of supported parameters.
//   //
//   // [0] https://stripe.com/docs/api/payment_intents/create
//   // if (calculateTax) {
//   //   let taxCalculation = await calculate_tax(orderAmount, 'usd')

//   //   paymentIntent = await stripe.paymentIntents.create({
//   //     currency: 'usd',
//   //     amount: taxCalculation.amount_total,
//   //     automatic_payment_methods: { enabled: true },
//   //     metadata: { tax_calculation: taxCalculation.id }
//   //   })
//   // } else {
//   //   paymentIntent = await stripe.paymentIntents.create({
//   //     currency: 'usd',
//   //     amount: orderAmount,
//   //     automatic_payment_methods: { enabled: true }
//   //   })
//   // }
//   let orderAmount = 1400
//   let paymentIntent

//   try {
//     paymentIntent = await stripe.paymentIntents.create({
//       currency: 'usd',
//       amount: orderAmount,
//       automatic_payment_methods: { enabled: true }
//     })
//     // Send publishable key and PaymentIntent details to client
//     console.log('llamando a primer metodo de pago', {
//       data: paymentIntent.client_secret
//     })
//     res.send({
//       clientSecret: paymentIntent.client_secret
//     })
//   } catch (e) {
//     console.log({ e })
//     return res.status(400).send({
//       error: {
//         message: e.message
//       }
//     })
//   }
// })
