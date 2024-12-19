import dotenv from 'dotenv'

dotenv.config()

export const setTokenToCookies = (res, content, name = 'authToken') => {
  // enviar el token por res
  res.cookie(name, content, {
    httpOnly: process.env.NODE_ENV === 'production' ? true : false,
    secure: process.env.NODE_ENV === 'production', // Asegúrate de que se use HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Necesario para cookies entre dominios
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    // Asegúrate de que el dominio esté correcto
    signed: true
  })

  // res.cookie(name, content, {
  //   httpOnly: true,
  //   secure: false, // Cambia a true si estás usando HTTPS
  //   maxAge: 24 * 60 * 60 * 1000, // 4 horas en milisegundos
  //   signed: true
  // })
}

export const getTokenFromCookies = (req, name = 'authToken') => {
  return req.signedCookies[name]
}

export const deleteTokenFromCookies = (res, name = 'authToken') => {
  res.clearCookie(name, {
    httpOnly: process.env.NODE_ENV === 'production' ? true : false, // Asegura que la cookie no sea accesible desde el frontend con JavaScript
    secure: process.env.NODE_ENV === 'production' ? true : false, // Coincide con la configuración al crearla (no usar HTTPS)
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    signed: true // Coincide con la firma de la cookie
  })
}
