import { verifyJWT } from '../helper/JWT.js'
import {
  deleteTokenFromCookies,
  getTokenFromCookies
} from '../helper/cookieManipulation.js'

export const verifyExistJWT = (req, res, next) => {
  const authToken = getTokenFromCookies(req)

  if (!authToken || authToken == undefined) {
    res.status(404).json({ msg: 'Token no existe', error: true })
    return
  }
  console.log('verificando datos jwt')
  const { error, data, msg } = verifyJWT(authToken)

  if (error) {
    deleteTokenFromCookies(res)
    res.status(401).json({ msg, error })
    return
  }

  console.log('datos verificados de jwt')
  req.user = data

  next()
}

export const verifyDataFromJWT = (req, res, next) => {
  const { ip, userAgent, email } = req.user

  if (ip != req.ip || userAgent != req.headers['user-agent']) {
    res
      .status(401)
      .json({ msg: 'token invalido, datos no coinciden 1', error: true })
    return
  }

  req.body.email = email

  next()
}

export const verifyExistJWTinHeaders = (req, res, next) => {
  const { authorization: authToken } = req.headers
  console.log({ authToken })
  if (!authToken || authToken == undefined) {
    res.status(404).json({ msg: 'Token no existe', error: true })
    return
  }

  const { error, data, msg } = verifyJWT(authToken)
  if (error) {
    res.status(401).json({ msg, error })
    return
  }

  //{email,id,ip,userAgent}
  //in create user: {email,password}
  req.user = data
  req.body.email = data.email
  req.body.id=data.id
  next()
}
