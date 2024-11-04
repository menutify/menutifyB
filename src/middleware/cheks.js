import { check } from 'express-validator'

export const emailCheck = (name) => {
  return check(name)
    .isEmail()
    .withMessage('Debe ser un correo válido')
    .notEmpty()
    .withMessage('El correo es obligatorio')
}

export const passwordCheck = (name) => {
  return check(name)
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
}
