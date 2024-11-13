import Stripe from 'stripe'
import { createJWT } from '../helper/JWT.js'
import { confirmAccountMail } from '../database/mailModels.js'
import { transporter } from '../helper/mailerConfig.js'
import bcrypt from 'bcryptjs'
import { models } from '../Models/allModels.js'
import { setTokenToCookies } from '../helper/cookieManipulation.js'
import { subFromStripe, subFromStripeOther } from '../helper/payMethods.js'
// const stripe = Stripe(process.env.PK_STRIPE)
const sendEmailUser = async (req, res) => {
  const { email, password } = req.body

  try {
    //enviar correo de verificacion
    const userToken = createJWT({ email, password }, req, '600')

    const link = `${process.env.FRONT_PATH}/create-account/ready-account/${userToken}`

    const mailOptions = confirmAccountMail(email, link)

    await transporter.sendMail(mailOptions)

    return res
      .status(200)
      .json({ msg: 'Correo de confirmacion enviado', error: false })
  } catch (error) {
    res.status(400).json({
      msg: 'Se presento un error al enviar correo para crear usuario',
      error: true,
      data: { error }
    })
  }
}

const directCreateNewUser = async (req, res) => {
  const { email, password } = req.body

  const hashedPassword = await bcrypt.hash(password, 10)

  const { id } = await models.user.create({
    email: email,
    password: hashedPassword
  })

  return res.status(200).json({
    msg: 'Usuario creado correctamente',
    error: false,
    data: { id, email, new: true }
  })
}

const createNewUser = async (req, res) => {
  {
  }
  const { email, password } = req.user

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // // Crear un token

    const { id } = await models.user.create({
      // name: dataTokenUser.name,
      email: dataTokenUser.email,
      password: hashedPassword
    })

    //enviamos token a cookies
    const { error, msg, token } = createJWT({ email, id }, req)

    if (error) return res.status(400).json({ error, msg })

    setTokenToCookies(res, token)

    return res.status(200).json({
      msg: 'Usuario creado correctamente',
      error: false,
      data: { id, email, new: true }
    })
  } catch (error) {
    res.status(400).json({
      msg: 'Se presento un error al crear la cuenta',
      error: true,
      data: { error }
    })
  }
}

const createPaymentWithStripe = async (req, res) => {
  const { customerId, id, code, name, phone, country = '' } = req.body

  console.log({ customerId, id, code, name, phone, country })

  try {
    //primera fase, realizar el pago
    const { error, data, msg } = await subFromStripe(customerId)

    if (error) return res.status(400).json({ msg, error })

    const {
      id: id_sub,
      latest_invoice,
      created,
      current_period_end,
      status
    } = data.subscription
    //una vez realizado el pago, creamos la suscripcion
    console.log({ all: data.subscription })
    await models.subs.create({
      id_user: id,
      id_pay: id_sub,
      c_date: created,
      f_date: current_period_end,
      id_client_stripe: customerId,
      state: true,
      type: '1',
      platform: 'st'
    })

    //una vez realizado el pago, guardamos los datos en el usuario
    await models.user.update(
      { code, name, phone, country, new: false, subActive: true },
      { where: { id } }
    )

    res.status(200).json({
      msg: 'Suscripcion creada correctamente',
      error: false,
      data: {
        subscriptionId: id_sub,
        latest_invoice: latest_invoice,
        clientSecret: latest_invoice.payment_intent.client_secret,
        start: created,
        end: current_period_end,
        status: status
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg: 'No se creo la suscripcion, error global',
      error: true,
      data: { error }
    })
  }
}

const createPaymentWithStripeOther = async (req, res) => {
  // const { customerId, id, code, name, phone, country = '' } = req.body
  // const { customerId } = req.body
  // try {
  //   //primera fase, realizar el pago
  //   const { error, data, msg } = await subFromStripeOther(customerId)
  //   if (error) return res.status(400).json({ msg, error })
  //   const {
  //     id: id_sub,
  //     latest_invoice,
  //     created,
  //     current_period_end,
  //     status
  //   } = data.subscription
  //   console.log({ dataOnOtherSub: data.subscription })
  //   //una vez realizado el pago, creamos la suscripcion
  //   // await models.subs.create({
  //   //   id_user: id,
  //   //   id_pay: id_pay,
  //   //   c_date: created,
  //   //   f_date: current_period_end,
  //   //   state: status,
  //   //   type: '1',
  //   //   platform: 'st'
  //   // })
  //   // //una vez realizado el pago, guardamos los datos en el usuario
  //   // await models.user.update(
  //   //   { code, name, phone, country, new: false, subActive: true },
  //   //   { where: { id } }
  //   // )
  //   res.status(200).json({
  //     msg: 'Suscripcion creada correctamente',
  //     error: false,
  //     data: {
  //       subscriptionId: id_sub,
  //       latest_invoice: latest_invoice,
  //       clientSecret: latest_invoice.payment_intent.client_secret,
  //       start: created,
  //       end: current_period_end,
  //       status: status
  //     }
  //   })
  // } catch (error) {
  //   res.status(500).json({
  //     msg: 'No se creo la suscripcion, error global',
  //     error: true,
  //     data: { error }
  //   })
  // }
}

const createAccountController = {
  createPaymentWithStripe,
  createPaymentWithStripeOther,
  sendEmailUser,
  createNewUser,
  directCreateNewUser
}

export default createAccountController
