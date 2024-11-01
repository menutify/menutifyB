import bcryptjs from 'bcryptjs'
import { models } from '../Models/allModels.js'
import { createJWT } from '../helper/JWT.js'
import verify from '../helper/verifyIdToken.js'

const normalLogin = async (req = request, res = response) => {
  const { email, password } = req.body

  try {
    const user = await models.user.findOne({
      where: { email }
    })
    if (!user) {
      return res.status(404).json({
        msg: 'usuario no existe'
      })
    }

    const passwordCompare = bcryptjs.compareSync(password, user.password)

    if (!passwordCompare) {
      return res.status(401).json({
        msg: 'contraseña incorrecta'
      })
    }

    const token = await createJWT(email, '4h')

    res.status(200).json({ resp: true, token, new: user.new })
  } catch (e) {
    console.log({ e })
    return res.status(500).json({
      msg: 'Error de logueo'
    })
  }
}

const createUserWithFacebookAndGoogle = async (data) => {
  const { email, name, password, session } = await data

  // Encriptar la contraseña
  const hashedPassword = await bcryptjs.hash(password, 10)

  const { id } = await models.user.create({
    name,
    email,
    password: hashedPassword,
    session
  })

  return id
}

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body

    const { payload } = await verify(credential)
    const { email, name, sub: password } = payload

    const user = await models.user.findOne({ where: { email } })

    const newToken = await createJWT(email, '4h')

    if (user)
      return res.status(203).json({
        msg: 'Usuario ya existe',
        token: newToken,
        new: user.new,
        email
      })

    const id = await createUserWithFacebookAndGoogle({
      email,
      name,
      password,
      session: 'facebook'
    })

    return res
      .status(200)
      .json({ msg: 'ok', email, token: newToken, id, new: true })
  } catch (error) {
    console.log('paso algo', { error })
  }
}

const facebookLogin = async (req, res) => {
  const { email, name, id: password } = req.body

  try {
   

    const user = await models.user.findOne({ where: { email } })

    const newToken = await createJWT(email, '4h')

    if (user)
      return res.status(203).json({
        msg: 'Usuario ya existe',
        token: newToken,
        new: user.new,
        email
      })

    const id = await createUserWithFacebookAndGoogle({
      email,
      name,
      password,
      session: 'google'
    })

    return res
      .status(200)
      .json({ msg: 'ok', email, token: newToken, id, new: true })
  } catch (error) {
    console.log('paso algo', { error })
  }
}


export const loginController = {
  googleLogin,
  facebookLogin,
  normalLogin
}
