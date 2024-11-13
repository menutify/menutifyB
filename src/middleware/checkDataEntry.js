import { validationResult } from 'express-validator'

const checking = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(401).json({
      msg: validationResult(req).errors[1]?.msg || 'datos enviados erroneos',
      error: true,
      data: { errors }
    })
  }
  next()
}

export default checking

export const passwordEqual = (req, res, next) => {
  const { password, repassword } = req.body

  if (password != repassword) {
    return res
      .status(500)
      .json({ msg: 'Contraseñas no coinciden', error: true, data: null })
  }
  next()
}
