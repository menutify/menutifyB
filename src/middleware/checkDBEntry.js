import bcryptjs from 'bcryptjs'
import { createJWT } from '../helper/JWT.js'
import { setTokenToCookies } from '../helper/cookieManipulation.js'
import { models } from '../Models/allModels.js'

export const userExistInBody = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await models.user.findOne({
      where: { email }
    })
    // console.log({ user })
    if (!user) {
      return res.status(404).json({
        msg: 'usuario no existe',
        error: true
      })
    }

    req.user = {
      id: user.id,
      email,
      password: user.password,
      isNew: user.new,
      subActive: user.subActive
    }

    next()
  } catch (error) {
    res.status(500).json({
      msg: 'Error verificacion de existencia de usuario',
      error: true,
      data: { error }
    })
  }
}
export const verifyPassword = async (req, res, next) => {
  const { password: pasEntry } = req.body
  const { password } = req.user

  const passwordCompare = bcryptjs.compareSync(pasEntry, password)

  if (!passwordCompare) {
    return res.status(401).json({
      msg: 'contraseña incorrecta',
      error: true
    })
  }

  delete req.user['password']

  next()
}

export const userExistWGoogle = async (req, res, next) => {
  const { credential } = req.body

  try {
    const { payload } = await verify(credential)
    const { email, name, sub: password } = payload

    const user = await models.user.findOne({ where: { email } })

    if (user) {
      const token = createJWT({ email, id: user.id })

      setTokenToCookies(res, token)

      return res.status(203).json({
        msg: 'Usuario ya existe',
        error: false,
        data: { new: user.new, email }
      })
    }

    req.user = { email, name, password, session: 'google' }
    next()
  } catch (error) {
    res.status(500).json({
      msg: 'Error user exist with google',
      error: true,
      data: { error }
    })
  }
}

export const userExistWFacebook = async (req, res, next) => {
  try {
    const { email, name, id: password } = req.body

    const user = await models.user.findOne({ where: { email } })

    if (user) {
      const token = createJWT({ email, id: user.id })

      setTokenToCookies(res, token)

      return res.status(203).json({
        msg: 'Usuario ya existe',
        error: false,
        data: { new: user.new, email }
      })
    }

    req.user = { email, name, password, session: 'facebook' }
    next()
  } catch (error) {
    res.status(500).json({
      msg: 'Error user exist with facebook',
      error: true,
      data: { error }
    })
  }
}
export const userDontExistInBody = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await models.user.count({ where: { email } })
    if (user) {
      return res.status(409).json({ msg: 'Correo no disponible', error: true })
    }
    next()
  } catch (error) {
    res.status(400).json({
      msg: 'Error al verificar el email en la BD',
      error: true,
      data: { error }
    })
  }
}

export const auserExist = async (req, res, next) => {}
