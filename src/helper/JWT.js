import jwt from 'jsonwebtoken'

export const createJWT = (data, time) => {
  return new Promise((resolve, reject) => {
    const payload = { data }
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: time
      },
      (err, token) => {
        if (err) {
          console.log(err)
          reject('No se pudo generar el token')
        } else {
          resolve(token)
        }
      }
    )
  })
}

export const verifyJWT = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, (error, data) => {
    if (error) {
      return false
    }
    return data
  })

  return decoded
}
