import bcryptjs from 'bcryptjs'
import { models } from '../Models/allModels.js'
import { createJWT } from '../helper/JWT.js'
import { setTokenToCookies } from '../helper/cookieManipulation.js'

const normalLogin = async (req = request, res = response) => {
  const { email, id, isNew } = req.user
  
  try {
    const { error, token, msg } = createJWT({ email, id }, req)

    if (error) return res.status(400).json({ error, msg })

    setTokenToCookies(res, token)
    
    res.status(200).json({ msg, error, data: { email, id, isNew } })
  } catch (error) {
    
    return res.status(500).json({
      msg: 'Error de logueo',
      error: true,
      data: { error }
    })
  }
}


const networkLogin = async (req, res) => {
  try {
    const { email, name, password, session } = req.user

    const hashedPassword = await bcryptjs.hash(password, 10)

    const user = await models.user.create({
      name,
      email,
      password: hashedPassword,
      session
    })

    console.log(`usuario creado con ${session}: `, { user })

    const token = createJWT({ email, id: user.id })
    setTokenToCookies(res, token)

    res
      .status(200)
      .json({ msg: 'Usuario creado', error: false, data: { new: true, email } })
  } catch (error) {
    res.status(500).json({
      msg: `Error with ${session} create account`,
      error: true,
      data: { error }
    })
  }
}

export const loginController = {
  networkLogin,
  normalLogin
}
