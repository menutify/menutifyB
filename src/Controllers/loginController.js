import { models } from '../Models/allModels.js'
import { createJWT } from '../helper/JWT.js'
import { setTokenToCookies } from '../helper/cookieManipulation.js'

const normalLogin = async (req = request, res = response) => {
  const { email, id, isNew, subActive } = req.user

  try {
    const { error, token, msg } = createJWT({ email, id }, req)

    if (error) return res.status(400).json({ error, msg })

    setTokenToCookies(res, token)
    //guardo el token en la bd
    const partialToken = token.slice(-25)
    await models.user.update({ token: partialToken }, { where: { id: id } })

    res
      .status(200)
      .json({ msg, error, data: { email, id, isNew, subActive, token } })
  } catch (error) {
    return res.status(500).json({
      msg: 'Error de logueo',
      error: true,
      data: { error }
    })
  }
}

const networkLogin = async (req, res) => {
  const { email, name, password, session } = req.user
  try {
    

    const user = await models.user.create({
      name,
      email,
      password:'GF'+password.slice(-10)+'.',
      session
    })

    console.log(`usuario creado con ${session} `)

    const token = createJWT({ email, id: user.dataValues.id }, req)

    if (!token.token) {
      return res.status(400).json({ error: token.error, msg: token.msg })
    }

    setTokenToCookies(res, token.token)
    //guardo el token en la bd
    const partialToken = token.token.slice(-25)
    await models.user.update(
      { token: partialToken },
      { where: { id: user.dataValues.id } }
    )

    res.status(200).json({
      msg: 'Usuario creado',
      error: false,
      data: {
        isNew: true,
        email,
        token: token.token,
        subActive: false,
        id: user.id
      }
    })
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
