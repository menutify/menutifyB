import { verifyJWT } from '../helper/JWT.js'

export const existJWT = (req, res, next) => {
  console.log(1)
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ msg: 'Token no proporcionado' })
  }
  req.user = { token }
  next()
}

export const vefiryExistJWT = async (req, res, next) => {
  console.log(2)
  const token = req.headers.authorization
  try {
    const decoded = await verifyJWT(token)
    console.log({ decoded })
    if (!decoded)
      return res.status(401).json({ msg: 'Token inválido o expirado' })

    req.user['decoded'] = decoded
    next()
  } catch (e) {
    return res.status(401).json({ msg: 'Token inválido o expirado' })
  }
}
