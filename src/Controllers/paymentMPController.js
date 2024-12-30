import { webhookPaymentMP } from '../database/mailModels.js'
import { subscription } from '../helper/connectMP.js'
import { datesStringForBD } from '../helper/datesForBD.js'
import { transporter } from '../helper/mailerConfig.js'
import { models } from '../Models/allModels.js'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import dotenv from 'dotenv'

dotenv.config()

const cliente = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_PRIVATE_CREDENTIAL
})

const payment = new Payment(cliente)

const createPayment = async (req, res) => {
  // console.log('mycliente: ', { payment })
  const { id: id_user, email } = req.user
  // console.log({ id_user, email })
  // console.log(req.body)
  const {
    token,
    issuer_id,
    payment_method_id,
    transaction_amount,
    installments,
    payer
  } = req.body

  const body = {
    token,
    issuer_id: parseInt(issuer_id),
    payment_method_id,
    transaction_amount,
    installments,
    payer,
    metadata: { id: id_user, email }
  }

  console.log(body)

  try {
    const paymentData = await payment.create({
      body
    })

    console.log({ paymentData })
    if (!paymentData) return res.status(404)
    const { id, ...values } = paymentData
    console.log({ id, values })
    if (!id) {
      return res.status(400).json({
        error: true,
        msg: 'No se pudo realizar el pago, vuelva a intentar o pruebe con otra tarjeta'
      })
    }

    console.log({ status: values.status, details: values.status_detail })
    // obtengo io de express
    const io = req.app.get('io')

    // Emitir evento al frontend
    io.to(id_user).emit('paymentCreated', { paymentId: id })

    return res.status(200).json({
      error: false,

      msg: 'Pago procesandose',
      data: { status: values.status, status_detail: values.status_detail }
    })
  } catch (error) {
    console.log('error al crear el pago')
    console.log({ error })
    console.log('Full error:', JSON.stringify(error, null, 2))

    console.log('cause: ', error.cause[0])
    return res.status(500).json({
      error: true,
      msg: 'Verifique que los datos del medio de pago'
    })
  }
}

const createSubscription = async (req, res) => {
  // email: email ingresado en el input perteneciente a mercadoPago
  // data: email que pertenece al usuario logueado en nuestra pagina
  const { email, data } = req.body

  try {
    const body = {
      back_url: 'https://www.youtube.com', //url https , retorno del usuario despues del pago
      reason: 'menutifysubs',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'days', // days | months | weeks
        transaction_amount: 1000.0, // Precio de la suscripción
        currency_id: 'ARS' // moneda
      },
      // payment_methods_allowed: {
      //   payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }]
      // }
      payer_email: email,
      external_reference: data // Email del usuario que se está suscribiendo :string
    }

    //creamos la suscriccion
    const response = await subscription.create({ body: body })

    //init_point contiene el link donde el usuario debe hacer el pago
    const { init_point } = response

    res.status(200).json({ error: false, data: { init_point }, msg: 'ok' })
  } catch (error) {
    console.log({ error })

    res.status(500).json({
      error: true,
      data: {},
      msg: 'Verifique que el email usado pertenezca a mercadopago'
    })
  }
}

const webhookPayment = async (req, res) => {
  try {
    // const queries = req.query // { 'data.id': '1320644758', type: 'payment' }
    const notification = req.body

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
    //websocket
    const io = req.app.get('io')

    // El código de estado de la transacción
    const paymentAction = notification.action // 'payment.created'

    console.log({ paymentAction })
    // Realiza acciones según el estado de la transacción
    switch (paymentAction) {
      case 'payment.created':
        console.log('payment creater')
        const data = await payment.get({ id: notification.data.id })

        if (!data.id) {
          io.to(id).emit('paymentStatus', {
            status: 'rejected',
            status_detail: 'obtain payment id failed'
          })
          return res.status(500)
        }

        const {
          status,
          status_detail,
          date_created,
          transaction_amount,
          metadata,
          id: idpayment
        } = data

        /*
        {
        status: 'approved',
        status_detail: 'accredited',
        date_created: '2024-12-18T23:15:30.113-04:00',
        transaction_amount: 1000,
        metadata: {
        id: '2c22bbe3-079c-41c6-b525-f5240fad0f21',
        email: 'gianco3108@gmail.com'
        }
        }
        */
        //no verifico el email o id que pertenezca a un usuario, porque en este punto ya deberia estar conectado
        console.log({ status_detail, status })
        //manejo interno de la fecha , ya que es un pago unico
        if (status_detail === 'accredited') {
          const { id, email } = metadata
          const [c_date, f_date] = datesStringForBD(date_created)

          const objectSub = {
            id_user: id,
            id_pay: idpayment,
            c_date,
            f_date,
            state: true
          }

          /**
            {
              id_user: '2c22bbe3-079c-41c6-b525-f5240fad0f21',
              id_pay: '1320644758',
              c_date: '2024-12-19',
              f_date: '2025-01-19',
              state: true
            }

          */

          //creamos la nueva sub
          await models.subs.create(objectSub)

          //actualizamos los datos del usuario
          await models.user.update(
            { new: false, subActive: true },
            { where: { id, email } }
          )

          //obtnemos el nombre del usuario
          const nameUser = await models.user.findOne({
            where: { id },
            attributes: ['name'] // Selecciona solo la columna que necesitas
          })
          // envio de correo con factura del pago

          // Notifica al cliente conectado por WebSocket
          io.to(id).emit('paymentStatus', {
            status,
            status_detail
          })

          const mailOptions = webhookPaymentMP(
            metadata,
            status_detail,
            idpayment,
            nameUser.dataValues.name,
            c_date,
            f_date
          )

          await transporter.sendMail(mailOptions)
        }

        break

      case 'payment.pending':
        console.log('Pago pendiente')
        // Puedes notificar al usuario que el pago está pendiente o realizar alguna acción adicional
        break

      case 'payment.rejected':
        console.log('Pago rechazado')
        // Aquí puedes manejar los pagos rechazados (por ejemplo, informar al usuario)
        break

      case 'payment.in_process':
        console.log('Pago en proceso')
        // Esto ocurre cuando el pago está siendo procesado
        break

      case 'payment.cancelled':
        console.log('Pago cancelado')
        // En este caso, debes manejar el pago cancelado (por ejemplo, notificar al comprador)
        break

      case 'payment.charged_back':
        console.log('Pago revertido (cargo fraudulento)')
        // Si es un cargo fraudulento, deberías investigar más o tomar medidas
        break

      default:
        console.log('Estado no reconocido:', paymentAction)
        break
    }

    res.status(200).send('OK')
  } catch (error) {
    console.log('error en el webhook')
    console.log({ error })
    return res.status(500)
  }
}

const webhookSub = async (req, res) => {
  try {
    // req.query:entrega tambien la data y el id
    const { action, data, application_id, date, version } = req.body

    //definimos la etapa de la suscripcion
    switch (action) {
      case 'updated':
        // Lógica para cuando el estado de la suscripción se actualiza
        console.log('Suscripción actualizada:', data.id)

        // if (version == 2) {
        //   const { external_reference } = await preApprovalPlan.get({
        //     id: data.id
        //   })
        //   console.log({ external_reference })

        //   const user = await models.user.findOne({
        //     where: { email: external_reference }
        //   })
        //   const fechaInicial = new Date(date)

        //   // Sumar 30 días a la fecha inicial
        //   const fechaFinal = new Date(fechaInicial)
        //   fechaFinal.setDate(fechaFinal.getDate() + 30)

        //   // Convertir ambas fechas a formato MySQL 'YYYY-MM-DD HH:MM:SS' (sin la 'Z' para MySQL)
        //   const fechaInicialParaMySQL = fechaInicial
        //     .toISOString()
        //     .split('T')
        //     .join(' ')
        //     .split('Z')[0]
        //   const fechaFinalParaMySQL = fechaFinal
        //     .toISOString()
        //     .split('T')
        //     .join(' ')
        //     .split('Z')[0]

        //   const objectSub = {
        //     c_date: fechaInicialParaMySQL,
        //     id_pay: data.id,
        //     f_date: fechaFinalParaMySQL,
        //     id_user: user.id,
        //     state: true
        //   }

        //   await models.subs.create(objectSub)

        //   await models.user.update(
        //     { subActive: true },
        //     { where: { id: user.id } }
        //   )
        // }

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
    res.status(204)
  } catch (error) {
    console.log({ error })
    res
      .status(500)
      .json({ error: true, msg: 'Error e webhook con mp', data: error })
  }
}

const paymentMPController = {
  createPayment,
  createSubscription,
  webhookPayment,
  webhookSub
}

export default paymentMPController
