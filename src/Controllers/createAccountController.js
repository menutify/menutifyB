import { createJWT } from '../helper/JWT.js'
import { confirmAccountMail } from '../database/mailModels.js'
import { transporter } from '../helper/mailerConfig.js'
import bcrypt from 'bcryptjs'
import { models } from '../Models/allModels.js'
import { setTokenToCookies } from '../helper/cookieManipulation.js'
import { subFromStripe, subFromStripeOther } from '../helper/payMethods.js'
import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config()
const stripe = Stripe(process.env.SK_STRIPE)

const sendEmailUser = async (req, res) => {
  const { email, password } = req.body

  try {
    //enviar correo de verificacion
    const userToken = createJWT({ email, password }, req, '1h')

    //aqui envia el token, pero no se envia el email
    const pathLink = `${process.env.FRONT_PATH}/create-account/ready-account/${userToken.token}`

    console.log({ token: userToken.token })

    const mailOptions = confirmAccountMail(email, pathLink)

    await transporter.sendMail(mailOptions)

    return res.status(200).json({
      msg: 'Correo de confirmacion enviado',
      error: false,
      data: { resp: true }
    })
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

  // req.user={
  //   email: 'gianco.marquez@gmail.com',
  //   password: 'elkake',
  //   ip: '::1',
  //   userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTM
  // L, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  //   iat: 1732049728,
  //   exp: 1732053328
  // }

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // // Crear un token

    const { id } = await models.user.create({
      email,
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
  const { email, id, code, name, phone, country = '' } = req.body
  // generamos el customer id
  const customer = await stripe.customers.create({
    email: email
  })

  const customerId = customer.id
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

    console.log({ suscriptionOption: data.subscription })

    // Agregar metadatos al PaymentIntent
    await stripe.paymentIntents.update(latest_invoice.payment_intent.id, {
      metadata: {
        mensaje: 'en español todo es mas facil'
      }
    })

    //una vez realizado el pago, creamos la suscripcion
    // console.log({ all: data.subscription })
    // await models.subs.create({
    //   id_user: id,
    //   id_pay: id_sub,
    //   c_date: created,
    //   f_date: current_period_end,
    //   id_client_stripe: customerId,
    //   state: true,
    //   type: '1',
    //   platform: 'st'
    // })

    // //una vez realizado el pago, guardamos los datos en el usuario
    // await models.user.update(
    //   { code, name, phone, country, new: false, subActive: true },
    //   { where: { id } }
    // )

    // res.status(200).json({
    //   msg: 'Suscripcion creada correctamente',
    //   error: false,
    //   data: {
    //     subscriptionId: id_sub,
    //     latest_invoice: latest_invoice,
    //     clientSecret: latest_invoice.payment_intent.client_secret,
    //     start: created,
    //     end: current_period_end,
    //     status: status
    //   }
    // })

    res.status(200).json({
      msg: 'ok',
      data: { clientSecret: latest_invoice.payment_intent.client_secret },
      error: false
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
