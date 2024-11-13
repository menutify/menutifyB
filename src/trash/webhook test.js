createAccountRouter.post(
    '/webhook-intent',
  
    (req, res) => {
      console.log({ path: req.path })
      const endpointSecret = 'whsec_.................6Z3usOzoQY9'
      const cliendpointSECRET =
        'whsec_569ce9943.........................................7b86eb6'
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