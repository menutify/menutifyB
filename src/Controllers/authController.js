import { createJWT } from '../helper/JWT.js'
import { models } from '../Models/allModels.js'
import { transporter } from '../helper/mailerConfig.js'
import bcryptjs from 'bcryptjs'
import { changePasswordMail } from '../database/mailModels.js'
import { setTokenToCookies } from '../helper/cookieManipulation.js'

//* verifica que el token sea valido y el usuario de ese token exista
export const getMe = async (req, res) => {
  const { id, isNew, email, subActive } = req.user // Usa tu clave secreta

  try {
    //si existe un token valido, creo otro de 24h y lo reemplazo
    const { token } = createJWT({ id, email }, req)

    setTokenToCookies(res, token)
    const partialToken=token.slice(-25)
    await models.user.update({ token:partialToken }, { where: { id } })

    res.status(200).json({
      msg: 'Ingreso autorizado',
      error: false,
      data: { id, isNew, email, subActive }
    })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({
      msg: 'Problemas en el acceso automatico',
      data: { error },
      error: true
    })
  }
}

const sendEmail = async (req, res) => {
  const { id, isNew, email } = req.user
  try {
    // console.log({id,isNew,email})
    //duracion del token 10minutos
    const { error, token, msg } = createJWT({ email, id }, req, '1h')

    if (error) {
      res.status(400).json(error, msg)
    }

    const resetLink = `${process.env.FRONT_PATH}/change-password/${token}` // La URL de tu frontend para resetear la contraseña

    const mailModel = changePasswordMail(email, resetLink)

    await transporter.sendMail(mailModel)

    return res.status(200).json({
      msg: 'Correo de restablecimiento enviado',
      error: false,
      data: { token, link: resetLink }
    })
  } catch (error) {
    console.log({ error })
    res.status(500).json({
      msg: 'Hubo un problema al enviar el correo',
      error: true,
      data: { error }
    })
  }
}

const resetPassword = async (req, res) => {
  const { password, id } = req.body

  try {
    const newPassword = await bcryptjs.hash(password, 10)

    await models.user.update({ password: newPassword }, { where: { id } })

    return res
      .status(200)
      .json({
        msg: 'contraseña cambiada correctamente',
        error: false,
        data: { resp: true }
      })
  } catch (error) {
    console.log({ error })
    res.status(500).json({
      msg: 'Hubo un problema al enviar el correo',
      error: true,
      data: { error }
    })
  }
  // Verificar y decodificar el token
}

export const authController = {
  getMe,
  sendEmail,
  resetPassword
}
