import jwt from 'jsonwebtoken'

export const createJWT = (data, req, time = '24h') => {
  const ip = req.ip
  const userAgent = req.headers['user-agent']
  const payload = { ...data, ip, userAgent }

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: time
    }
    //, si le agrego el callback (err,token)=>{} esto se vuevle asincrono
  )

  if (!token)
    return { error: true, msg: 'error al crear el token', token: null }

  return { error: false, token, msg: 'token creado correctamente' }
}

export const verifyJWT = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, (error, data) => {
    if (error) {
      console.log({ error })
      return {
        error: true,
        data: null,
        msg: 'Token inválido o expirado'
      }
    }
    return { error: false, data, msg: 'Datos obtenidos correctamente' }
  })

  return decoded
}
