import { models } from '../Models/allModels.js'
import { verifyJWT } from '../helper/JWT.js'
import {
  deleteTokenFromCookies,
  getTokenFromCookies
} from '../helper/cookieManipulation.js'

export const verifyExistJWT = async (req, res, next) => {
  let authToken = getTokenFromCookies(req) || req.query.token
  // console.log('reqquery: ', { quee: req.query.token })
  // console.log({ authToken, cookies: req.signedCookies })
  
  if (
    !authToken ||
    authToken == undefined ||
    authToken == 'null' ||
    authToken == ''
  ) {
    return res
      .status(404)
      .json({ msg: 'error al obtener el token', error: true })
  }
  // console.log('autoken local: ', { authToken })

  const { error, data, msg } = verifyJWT(authToken)

  if (error) {
    console.log('error 401')
    deleteTokenFromCookies(res)
    res.status(401).json({ msg, error })
    return
  }
  const tokenPatial = authToken.slice(-25)

  // console.log({ tokenPatial })
  //indicar que el token sea igual al de la bd
  const existToken = await models.user.findOne({
    where: { id: data.id }
  })

  // console.log({ existToken: existToken?.dataValues.token })
  if (!existToken || existToken?.dataValues.token != tokenPatial) {
    console.log('existoken no existe o no es igual al de la base de datos')
    res.status(226).json({
      msg: 'Se detecto que la cuenta esta siendo usada en otro dispositivo',
      error: true
    })
    return
  }

  console.log('jwt correcto - next')
  req.user = data

  next()
}

//en caso se haga un logueo desde otra computadora o dispositivo, este se desloguea
export const verifyDataFromJWT = (req, res, next) => {
  const { ip, userAgent, email } = req.user
  // console.log({
  //   ip,
  //   rip: req.ip,
  //   userAgent,
  //   rheader: req.headers['user-agent']
  // })
  // if (ip != req.ip || userAgent != req.headers['user-agent']) {
  //   console.log('401 error')
  //   res
  //     .status(401)
  //     .json({ msg: 'Se detecto que la cuenta esta siendo usada en otro dispositivo', error: true })
  //   return
  // }

  req.body.email = email

  next()
}

export const verifyExistJWTinHeaders = (req, res, next) => {
  const { authorization: authToken } = req.headers
  // console.log({ authToken })
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
  req.body.id = data.id
  next()
}
