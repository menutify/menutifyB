import express, { Router } from 'express'
import { webhookInformation } from '../database/mailModels.js'
import { transporter } from '../helper/mailerConfig.js'
import Stripe from 'stripe'
import mercadoPago, {
  PreApprovalPlan,
  MercadoPagoConfig,
  PreApproval,
  Payment
} from 'mercadopago'
import dotenv from 'dotenv'
import axios from 'axios'
import { models } from '../Models/allModels.js'

const allATMP = {
  at_test1:
    'APP_USR-5494654379404206-112113-0733826a5aa3576034e50476a6814fde-2110474596',
  at_test2:
    'APP_USR-5480782471224719-112918-8f64e90e7db978deec87c39ef151f9fd-2110474596',
  at_test3:
    'TEST-8672666358200323-112919-988195dad0cda2612db66166a58a2260-1570773738'
}

dotenv.config()
const paymentRouter = Router()
//-----------------------------------------------------

//-------------------------------------------------------------------------------------

//  ! para que funcione debe estar la api en la nube
//uso localtunnel para hacerlo local
//lt --port 3000
//

//-------------------mp--------------------------
const clientMP = new MercadoPagoConfig({
  accessToken: allATMP.at_test1,
  options: {
    timeout: 5000
    // Establece un tiempo de espera en milisegundos
  }
})

const preApprovalPlan = new PreApproval(clientMP)

// PROBANDO OTRO PAGO
const client2 = new MercadoPagoConfig({ accessToken: allATMP.at_test3 })
const payment = new Payment(client2)

paymentRouter.post('/create-payment', async (req, res) => {
  try {
    console.log({ body: req.body })

    const { user, ...bodyData } = req.body

    /**
     * user:{
     * id: number 
  isNew: boolean 
  email: string 
  subActive: boolean 
  }
     * 
     *bodyData {
    action: 'payment.created',
    api_version: 'v1',
    data: { id: '1320438096' },
    date_created: '2024-11-30T04:09:24Z',
    id: 117407920347,
    live_mode: false,
    type: 'payment',
    user_id: '1570773738'
  }
     */

    const data = await payment.create({ body: { ...bodyData, metadata: user } })

    return res.status(200).json({ data })
  } catch (error) {
    console.log(error)
    return res.status(500)
  }
})

paymentRouter.post('/webhook-2', async (req, res) => {
  // Recibe la notificación desde Mercado Pago

  /**
 *   notification: {
    action: 'payment.created',
    api_version: 'v1',
    data: { id: '1320438096' },
    date_created: '2024-11-30T04:09:24Z',
    id: 117407612203,
    live_mode: false,
    type: 'payment',
    user_id: '1570773738'
  }

 */

  const queries = req.query
  const notification = req.body
  console.log({ queries, notification })
  // El código de estado de la transacción
  const paymentAction = notification.action
  try {
    // Responde correctamente a Mercado Pago para que se sepa que el webhook fue procesado

    // Realiza acciones según el estado de la transacción
    switch (paymentAction) {
      case 'payment.created':
        console.log('Pago creado')
        const data = await payment.get({ id: notification.data.id })
        // Aquí puedes realizar las acciones que necesites cuando el pago esté aprobado
        console.log({ data })
        break

      case 'pending':
        console.log('Pago pendiente')
        // Puedes notificar al usuario que el pago está pendiente o realizar alguna acción adicional
        break

      case 'rejected':
        console.log('Pago rechazado')
        // Aquí puedes manejar los pagos rechazados (por ejemplo, informar al usuario)
        break

      case 'in_process':
        console.log('Pago en proceso')
        // Esto ocurre cuando el pago está siendo procesado
        break

      case 'cancelled':
        console.log('Pago cancelado')
        // En este caso, debes manejar el pago cancelado (por ejemplo, notificar al comprador)
        break

      case 'charged_back':
        console.log('Pago revertido (cargo fraudulento)')
        // Si es un cargo fraudulento, deberías investigar más o tomar medidas
        break

      default:
        console.log('Estado no reconocido:', paymentStatus)
        break
    }

    return res.status(200).send('Received')
  } catch (error) {
    console.log({ error })
    res.status(500)
  }
})

//----------------routes------------------------
//

paymentRouter.post('/create-preapproval-plan', async (req, res) => {
  const { email, data } = req.body
  console.log(email)
  try {
    // Crear un plan de suscripción en MercadoPago
    const body = {
      back_url: 'https://838c-177-53-152-202.ngrok-free.app',

      reason: 'menutifysucbs',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'days',
        transaction_amount: 1000.0, // Precio de la suscripción
        currency_id: 'ARS'
      },
      // payment_methods_allowed: {
      //   payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }]
      // }
      payer_email: email,
      external_reference: data, // Email del usuario que se está suscribiendo
      metadata: {
        order_id: '12345', // Un identificador para el pedido o alguna referencia
        subscription_id: '67890', // Id de suscripción, si corresponde
        custom_info: 'Información adicional sobre el pago'
      }
    }

    const response = await preApprovalPlan.create({ body: body })
    console.log({ responseFromPreApprovalPlan: response })
    const { init_point } = response

    // Respondemos con el link de pago (init_point)

    res.status(200).json({ error: false, data: { init_point }, msg: 'ok' })
  } catch (error) {
    console.log(error)
    console.error('Error al crear el plan de suscripción:', error)
    res.status(500).json({
      error: true,
      data: {},
      msg: 'Verifique que el email de su cuenta de mercadopago'
    })
  }
})

// api/payment/webhook
paymentRouter.post('/webhook', async (req, res) => {
  try {
    // console.log(req.query)
    const { action, data, application_id, date, version } = req.body
    const headers = req.headers
    // console.log({ headers })
    switch (action) {
      case 'updated':
        // Lógica para cuando el estado de la suscripción se actualiza
        console.log('Suscripción actualizada:', data.id)
        if (version == 2) {
          const { external_reference } = await preApprovalPlan.get({
            id: data.id
          })
          console.log({ external_reference })

          const user = await models.user.findOne({
            where: { email: external_reference }
          })
          const fechaInicial = new Date(date)

          // Sumar 30 días a la fecha inicial
          const fechaFinal = new Date(fechaInicial)
          fechaFinal.setDate(fechaFinal.getDate() + 30)

          // Convertir ambas fechas a formato MySQL 'YYYY-MM-DD HH:MM:SS' (sin la 'Z' para MySQL)
          const fechaInicialParaMySQL = fechaInicial
            .toISOString()
            .split('T')
            .join(' ')
            .split('Z')[0]
          const fechaFinalParaMySQL = fechaFinal
            .toISOString()
            .split('T')
            .join(' ')
            .split('Z')[0]

          const objectSub = {
            c_date: fechaInicialParaMySQL,
            id_pay: data.id,
            f_date: fechaFinalParaMySQL,
            id_user: user.id,
            state: true
          }

          await models.subs.create(objectSub)

          await models.user.update(
            { subActive: true },
            { where: { id: user.id } }
          )
        }

        // Aquí puedes agregar la lógica para manejar lo que ocurre cuando se actualiza una suscripción
        // Por ejemplo, puedes hacer un update en tu base de datos para reflejar la actualización

        break

      case 'created':
        // Lógica para cuando se crea una nueva suscripción
        console.log('Nueva suscripción creada:', data.id)

        // Aquí puedes agregar la lógica para manejar lo que ocurre cuando se crea una suscripción
        // Por ejemplo, puedes hacer un insert en tu base de datos para almacenar la nueva suscripción

        break

      default:
        console.log('Acción no reconocida:', action)
        break
    }

    console.log({ action, data })
    res.status(200).send('hola')
  } catch (error) {
    console.log({ error })
    res
      .status(500)
      .json({ error: true, msg: 'Error e webhook con mp', data: error })
  }
})

// paymentRouter
//   .post('/sub-intent', async (req, res) => {
//     try {
//       const { tokenid } = req.body

//       const response = await axios.post(
//         'https://api.mercadopago.com/preapproval',
//         {
//           preapproval_plan_id: '2c938084934d1f17019354f117af02ef',
//           card_token_id: tokenid,
//           back_url: 'https://pandagif.vercel.app/#/gif/3o7btMCltyDvSgF92E',
//           payer_email: 'test@gmail.com',
//           status: 'authorized'
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${allATMP.at_test1}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       )

//       res.status(200).json(response.data)
//     } catch (error) {
//       console.log({ error })
//       res
//         .status(500)
//         .json({ error: true, msg: 'Error al pagar con mp', data: error })
//     }
//   })

// paymentRouter.post('/payment-intent', async (req, res) => {

//   try {
//     const {
//       token,
//       transaction_amount,
//       payer,
//       payment_method_id,
//       installments
//     } = req.body

//     // Validación de datos
//     if (!token || !transaction_amount || !payer || !payment_method_id) {
//       console.log('Faltan datos')
//       return res.status(400).json({
//         error: true,
//         msg: 'Faltan datos obligatorios para procesar el pago.'
//       })
//     }

//     console.log('lllegue')
//     // Crear el pago con Mercado Pago
//     const data = await payment.create({ body: req.body })
//     console.log({
//       token,
//       installments,
//       payer,
//       payment_method_id,
//       transaction_amount
//     })
//     // Validar si el pago fue aprobado
//     if (data.status === 'approved') {
//       console.log('aprove')
//       console.log(data)
//       return res.status(200).json({
//         error: false,
//         msg: 'Pago aprobado',
//         data: data
//       })
//     } else {
//       console.log('falle')
//       console.log(data)
//       if (data.errors) {
//         console.log('Errores adicionales:', data.errors)
//       }
//       return res.status(400).json({
//         error: true,
//         msg: 'Pago rechazado',
//         data: data
//       })
//     }
//   } catch (error) {
//     console.log({ error, cause: error.cause })
//     res.status(500).json({
//       error: true,
//       msg: 'Error al procesar el pago con Mercado Pago',
//       data: error
//     })
//   }
// })

// paymentRouter.post('/createReferenceMP', async (req, res) => {
//   try {
//     const resp = await preferenceMP.create({
//       body: {
//         items: [
//           {
//             id: '1234',
//             title: 'Suscripcion a menutify',
//             description: 'Suscripcion a menutify',
//             picture_url:
//               'https://i.pinimg.com/736x/48/38/9b/48389b5628e0040bc0d45cb588f5114e.jpg',
//             category_id: 'others',
//             quantity: 1,
//             currency_id: 'ARS',
//             unit_price: 20000
//           }
//         ],
//         payer: {
//           name: 'gianfranco',
//           surname: 'marquez',
//           email: 'gianco.marquez@example.com'
//         },
//         expires: false,
//         differential_pricing: {
//           id: 1
//         },
//         back_urls: {
//           success: 'https://test.com/success',
//           failure: 'https://test.com/failure',
//           pending: 'https://test.com/pending'
//         }
//       }
//     })

//     console.log({ resp })
//     res
//       .status(200)
//       .json({ error: false, msg: 'ok', data: { resp, id: resp.id } })
//   } catch (error) {
//     console.log(error)
//     res.status(400).json({ error: true, msg: error, data: {} })
//   }
// })

// paymentRouter.post(
//   '/webhook-menutify',
//   express.raw({ type: 'application/json' }),
//   async (req, res) => {
//     console.log('WEBHOOK ACTIVADA')
//     const sig = req.headers['stripe-signature']
//     let event

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         endpointSecretWebhook
//       )
//       console.log({ event: event.type })
//     } catch (err) {
//       console.log('Error al verificar el webhook', err)
//       return res
//         .status(400)
//         .json({ msg: `Webhook error: ${err.message}`, data: {}, error: true })
//     }

//     // Maneja el evento 'invoice.payment_succeeded'
//     if (event.type === 'payment_intent.succeeded') {
//       const { metadata, ...invoice } = event.data.object
//       console.log({ datosDelPago: invoice })
//       const customerId = invoice.customer // ID del cliente
//       const paymentIntentId = invoice.id // ID del PaymentIntent
//       const amountPaid = invoice.amount // Monto pagado
//       const currency = invoice.currency // Moneda en la que se pagó
//       const date = new Date(invoice.created * 1000)
//       //id ded la factura
//       const invoiceId = invoice.invoice
//       console.log('Pago exitoso')
//       console.log(`Customer ID: ${customerId}`)
//       console.log(`Payment Intent ID: ${paymentIntentId}`)
//       console.log(`Amount Paid: ${amountPaid}`)
//       console.log(`Currency: ${currency}`)

//       //!enviare un correo cada vez que un pago sea satisfactorio
//       const mailOptions = webhookInformation(
//         'gianco.marquez@gmail.com',
//         customerId,
//         paymentIntentId,
//         amountPaid,
//         currency,
//         date,
//         invoiceId
//       )

//       await transporter.sendMail(mailOptions)
//       // Aquí puedes hacer lo que necesites con los datos: actualizar la base de datos, activar suscripción, etc.
//       // Por ejemplo, actualizar la base de datos con el estado de la suscripción del cliente
//       console.log('pagado')
//     }

//     if (event.type === 'invoice.payment_failed') {
//       const invoice = event.data.object
//     }

//     res.status(200).send('Webhook recibido')
//   }
// )

// paymentRouter.get('/productData', async (req, res) => {
//   res.status(200).json({
//     error: false,
//     msg: 'datos de producto',
//     data: {
//       title: 'menutifySub',
//       price: 1000,
//       description: 'menutify suscripcion',
//       quantity: 1
//     }
//   })
// })

export default paymentRouter
