import { verifyJWT } from '../helper/JWT.js'

export const existJWT = (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ msg: 'Token no proporcionado' })
  }
  req.user = { token }
  next()
}

export const vefiryExistJWT = (req, res, next) => {
  const token = req.headers.authorization
  try {
    const decoded = verifyJWT(token)
    if (!decoded)
      return res.status(401).json({ msg: 'Token inválido o expirado' })

    req.user['decoded'] = decoded
    next()
  } catch (e) {
    return res.status(401).json({ msg: 'Token inválido o expirado' })
  }
}
