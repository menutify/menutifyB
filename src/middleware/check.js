import { validationResult } from 'express-validator'

const checking = (req, res, next) => {
  const errors= validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ data: errors })
  }
  next()
}

export default checking
