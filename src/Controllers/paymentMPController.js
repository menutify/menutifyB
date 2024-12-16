import { confirmAccountMail, webhookPaymentMP } from '../database/mailModels.js'
import { payment, subscription } from '../helper/connectMP.js'
import { datesStringForBD } from '../helper/datesForBD.js'
import { transporter } from '../helper/mailerConfig.js'
import { models } from '../Models/allModels.js'

const createPayment = async (req, res) => {
  //user : metadata  tipo User
  //bodyData: datos de pago
  const { user, ...bodyData } = req.body
  console.log({ user, bodyData })
  try {

    
    const { id, ...values } = await payment.create({
      body: { ...bodyData, metadata: user }
    })

    console.log({ datapayment: id })

    return res.status(200).json({
      error: false,

      msg: 'Pago procesado',
      data: { status: values.status, status_detail: values.status_detail }
    })
  } catch (error) {
    console.log({ error })
    return res
      .status(500)
      .json({
        error: true,
        data: {},
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
    // Responde correctamente a Mercado Pago para que se sepa que el webhook fue procesado
    const queries = req.query
    const notification = req.body

    console.log({ queries })
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
    // El código de estado de la transacción
    const paymentAction = notification.action

    // Realiza acciones según el estado de la transacción
    switch (paymentAction) {
      case 'payment.created':
        console.log('Pago creado')

        const data = await payment.get({ id: notification.data.id })

        const {
          metadata,
          date_created,
          status,
          status_detail,
          id: idpayment,
          transaction_amount
        } = data

        console.log({ status, status_detail, date_created, transaction_amount })
        //no verifico el email o id que pertenezca a un usuario, porque en este punto ya deberia estar conectado

        // // //manejo interno de la fecha , ya que es un pago unico
        if (status_detail === 'accredited') {
          const { id, email } = metadata
          const [c_date, f_date] = datesStringForBD(date_created)
          const id_pay = notification.data.id

          const objectSub = {
            id_user: id,
            id_pay,
            c_date,
            f_date,
            state: true
          }

          await models.subs.create(objectSub)

          await models.user.update(
            { new: false, subActive: true },
            { where: { id, email } }
          )
          const nameUser = await models.user.findOne({
            where: { id },
            attributes: ['name'] // Selecciona solo la columna que necesitas
          })
          // envio de correo con factura del pago

          const mailOptions = webhookPaymentMP(
            metadata,
            status_detail,
            idpayment,
            nameUser,
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
