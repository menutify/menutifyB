import { createJWT } from '../helper/JWT.js'
import { confirmAccountMail } from '../database/mailModels.js'
import { transporter } from '../helper/mailerConfig.js'
import { models } from '../Models/allModels.js'
import { setTokenToCookies } from '../helper/cookieManipulation.js'
import dotenv from 'dotenv'

dotenv.config()

const sendEmailUser = async (req, res) => {
  const { email, password, repassword, name, phone, country } = req.body

  try {
    if (password.toLowerCase() != repassword.toLowerCase()) {
      res.status(400).json({
        msg: 'Las contraseñas no coinciden',
        error: true,
        data: { resp: false }
      })
    }

    //enviar correo de verificacion
    const userToken = createJWT(
      { email, password, name, phone, country },
      req,
      '1h'
    )

    //aqui envia el token, pero no se envia el email
    const pathLink = `${process.env.FRONT_PATH}/create-account/ready-account/${userToken.token}`

    // console.log({ token: userToken.token })

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



  const { id } = await models.user.create({
    email: email,
    password
  })

  return res.status(200).json({
    msg: 'Usuario creado correctamente',
    error: false,
    data: { id, email, new: true }
  })
}

const createNewUser = async (req, res) => {
  const { email, password, phone, name, country } = req.user

  console.log({ email, password, phone, name, country })
  try {
    // Encriptar la contraseña
  

    // // Crear un token

    const { id } = await models.user.create({
      email,
      password,
      name,
      phone,
      country
    })
    console.log({ id })
    //enviamos token a cookies
    const { error, msg, token } = createJWT({ email, id }, req)

    if (error) return res.status(400).json({ error, msg })

    setTokenToCookies(res, token)

    const partialToken=token.slice(-25)
    await models.user.update({ token:partialToken }, { where: { id } })
    console.log('pasamos')
    return res.status(200).json({
      msg: 'Usuario creado correctamente',
      error: false,
      data: { id, email, new: true, subActive: false,token }
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      msg: 'Se presento un error al crear la cuenta',
      error: true,
      data: { error }
    })
  }
}

const caComplete = async (req, res) => {
  const { id } = req.body
  try {
    const user = await models.user.findByPk(id)

    if (!user) {
      res
        .status(404)
        .json({ error: true, data: {}, msg: 'No existe el usuario' })
      return
    }

    res.status(200).json({
      error: false,
      msg: 'ok',
      data: { isNew: user.new, subActive: user.subActive }
    })
  } catch (error) {
    res.status(500).json({
      msg: 'Se presento un error al obtener datos completos',
      error: true,
      data: { error }
    })
  }
}

const createAccountController = {
  sendEmailUser,
  createNewUser,
  directCreateNewUser,
  caComplete
}

export default createAccountController
