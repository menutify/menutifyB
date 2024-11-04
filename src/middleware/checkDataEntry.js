import { validationResult } from 'express-validator'

const checking = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(401).json({ msg: 'verifique los datos', errors })
  }
  next()
}

export default checking
