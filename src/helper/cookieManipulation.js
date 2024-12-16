import dotenv from 'dotenv'

dotenv.config()

export const setTokenToCookies = (res, content, name = 'authToken') => {
  // enviar el token por res
  res.cookie(name, content, {
    httpOnly: true,
    secure: true, // Cambia a true si estás usando HTTPS,
    sameSite: 'None', // Es necesario para permitir cookies en sitios cruzados
    maxAge: 24 * 60 * 60 * 1000, // 4 horas en milisegundos
    domain: process.env.FRONT_PATH,
    signed: true
  })

  // res.cookie(name, content, {
  //   httpOnly: true,
  //   secure: false, // Cambia a true si estás usando HTTPS
  //   maxAge: 24 * 60 * 60 * 1000, // 4 horas en milisegundos
  //   signed: true
  // })
}

export const getTokenFromCookies = (req) => {
  return req.signedCookies.authToken
}

export const deleteTokenFromCookies = (res) => {
  res.clearCookie('authToken', {
    httpOnly: true, // Asegura que la cookie no sea accesible desde el frontend con JavaScript
    secure: false, // Coincide con la configuración al crearla (no usar HTTPS)
    signed: true // Coincide con la firma de la cookie
  })
}
