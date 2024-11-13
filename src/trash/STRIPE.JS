createAccountRouter.post('/create-intent', async (req, res) => {
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
  
  // createAccountRouter.post('/sub-intent', async (req, res) => {
  //   const { customerId } = req.body
  
  //   try {
  //     const subscription = await stripe.subscriptions.create({
  //       customer: customerId,
  //       items: [
  //         {
  //           price: 'price_1QIdZSLwPyf2SXpsU7iLbc1z'
  //         }
  //       ],
  //       payment_behavior: 'default_incomplete',
  //       //* se guarda el metodo de pago por defecto
  //       payment_settings: { save_default_payment_method: 'on_subscription' },
  //       expand: ['latest_invoice.payment_intent']
  //     })
  //     // Verifica que la suscripción fue creada correctamente
  //     if (!subscription || !subscription.latest_invoice) {
  //       return res.status(400).json({ msg: 'Subscription creation failed' })
  //     }
  //     res.status(200).send({
  //       subscriptionId: subscription.id,
  //       latest_invoice: subscription.latest_invoice,
  //       clientSecret: subscription.latest_invoice.payment_intent.client_secret,
  //       start: subscription.created,
  //       end: subscription.current_period_end,
  //       status: subscription.status
  //     })
  //   } catch (error) {
  //     console.log({ errorInSub: error })
  //     return res.status(500).json({ msg: 'No se pudo obtaener la sub', error })
  //   }
  // })