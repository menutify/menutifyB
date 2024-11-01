import { models } from '../Models/allModels.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createJWT, verifyJWT } from '../helper/JWT.js'
import { transporter } from '../helper/mailerConfig.js'

const getUser = async (req, res) => {
  try {
    // const { email, password } = req.query

    // if (!email) return res.status(204).json({ msg: 'email no ingresado' })

    // const user = await models.user.count({ where: { email, password } })

    // if (!user) return res.status(404).json({ msg: false })

    // return res.status(200).json({ msg: true })

    const users = await models.user.findAll()
    return res.json(users)
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error al obtener la lista de Usuarios',
      error
    })
  }
}

const postUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // const user = await models.user.count({ where: { email } })
    // if (user) return res.status(400).json({ msg: 'Usuario ya registrado' })

    //enviar correo de verificacion
    const userToken = await createJWT({ name, email, password }, 200)

    const confirmAccountLink = `http://localhost:5173/confirm-account/${userToken}`

    const mailOptions = {
      from: 'gianco.marquez@gmail.com',
      to: user.email,
      subject: 'Confirmación de email',
      text: ` Usa el siguiente enlace para confirmar tu email: \n ${resetLink}`
    }

    await transporter.sendMail(mailOptions)

    return res
      .status(200)
      .json({ msg: 'Correo de confirmacion enviado', token: userToken })
    // const decoded = verifyJWT(userToken)
    /**
 * 
 {
  data: {
    name: 'elkake',
    email: 'gianco.marquez@gmail.com',
    password: 'elkake'
  },
  iat: 1730246881,
  exp: 1730247081
}
 */

    // res.status(200).json({ userToken })
  } catch (error) {
    console.log({ error })
    res.status(400).json({
      data: 'Se presento un error al crear el Usuario',
      error
    })
  }
}

const createNewUser = async (req, res) => {
  const tokenUser = req.body

  try {
    const dataTokenUser = verifyJWT(tokenUser)

    console.log({ dataTokenUser })

    if (!dataTokenUser)
      return res.status(400).json({ msg: 'token error', error: true })

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(dataTokenUser.password, 10)

    // // Crear un token
    const token = await createJWT(email, '4h')

    const { id } = await models.user.create({
      name: dataTokenUser.name,
      email: dataTokenUser.email,
      password: hashedPassword
    })

    return res.status(200).json({ msg: true, id, token })
  } catch (error) {}
}

const changeUserNewDetail = async (req, res) => {
  try {
    const token = req.headers.authorization

    const { data: email } = verifyJWT(token)

    await models.user.update(
      { new: false, subActive: true },
      { where: { email } }
    )

    return res.status(200).json({ msg: 'Usuario dejo de ser nuevo' })
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error renovar el Usuario',
      error
    })
  }
}

const putUser = async (req, res) => {
  try {
    const { id } = req.params

   
    const data = req.body

    await models.user.update(data, { where: { id } })

    return res.status(200).json({ msg: 'Usuario actualizado' })
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error renovar el Usuario',
      error
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    await models.user.destroy({ where: { id } })

    return res.status(200).json({ msg: 'Usuario eliminado correctamete' })
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error al eliminar el Usuario',
      error
    })
  }
}

export const userControllerFunctions = {
  getUser,
  postUser,
  deleteUser,
  changeUserNewDetail,
  createNewUser,
  putUser
}
