import { createJWT, verifyJWT } from '../helper/JWT.js'
import { models } from '../Models/allModels.js'
import { transporter } from '../helper/mailerConfig.js'
import bcryptjs from 'bcryptjs'

export const getMe = async (req, res) => {
  try {
    // Verificar y decodificar el token
    const { decoded } = req.user // Usa tu clave secreta

    // Buscar al usuario en la base de datos utilizando el ID del token
    const user = await models.user.findOne({ where: { email: decoded.data } }) // No devolver la contraseña

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' })
    }

    // Devolver la información del usuario
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      new: user.new
      // Puedes agregar más campos que necesites
    })
  } catch (error) {
    console.log({ error })
    return res.status(400).json({ msg: 'Token inválido o expirado' })
  }
}

const sendEmail = async (req, res) => {
  const { email } = req.body

  try {
    // Verificar si el usuario existe
    const user = await models.user.findOne({ where: { email } })

    if (!user) {
      return res
        .status(404)
        .json({ msg: 'No se encontró ningún usuario con ese correo.' })
    }

    // Generar el token de restablecimiento (valido por 1 hora)
    const resetToken = await createJWT(user.id, 600)

    // Enviar el correo
    const resetLink = `http://localhost:5173/change-password/${resetToken}` // La URL de tu frontend para resetear la contraseña

    const mailOptions = {
      from: 'no-reply@menutify.com',
      to: user.email,
      subject: 'Restablecimiento de contraseña',
      text: `Has solicitado un restablecimiento de contraseña. Usa el siguiente enlace para restablecerla: ${resetLink}`
    }

    await transporter.sendMail(mailOptions)

    return res
      .status(200)
      .json({ msg: 'Correo de restablecimiento enviado', token: resetToken })
  } catch (error) {
    console.log({ error })
    res.status(500).json({ msg: 'Hubo un problema al enviar el correo' })
  }
}

const resetPassword = async (req, res) => {
  const { password, repassword } = req.body

  const token = req.headers.authorization // "TOKEN"

  try {
    if (password !== repassword)
      return res.status(400).json({ msg: 'Las contraseñas no coinciden' })

    if (!token) return res.status(400).json({ msg: 'Error al obtener token' })
    const decoded = verifyJWT(token) // Usa tu clave secreta
    // Buscar al usuario en la base de datos utilizando el ID del token

    // console.log({ decoded })
    if (!decoded)
      return res.status(400).json({ msg: 'Link expirado', error: true })

    const user = await models.user.findOne({ where: { id: decoded.data } })

    if (!user) {
      return res
        .status(404)
        .json({ msg: 'No se encontró ningún usuario con ese correo.' })
    }

    const newPassword = await bcryptjs.hash(password, 10)

    await models.user.update(
      { password: newPassword },
      { where: { id: user.id } }
    )

    return res
      .status(200)
      .json({ msg: 'contraseña cambiada correctamente', id: user.id })
  } catch (error) {
    console.log({ error })
    res.status(500).json({ msg: 'Hubo un problema al enviar el correo' })
  }
  // Verificar y decodificar el token
}

export const authController = {
  getMe,
  sendEmail,
  resetPassword
}
