import { Router } from 'express'
import { loginController } from '../Controllers/loginController.js'
import { emailCheck, passwordCheck } from '../middleware/cheks.js'
import checking from '../middleware/checkDataEntry.js'
import {
  userExistInBody,
  userExistWFacebook,
  userExistWGoogle,
  verifyPassword
} from '../middleware/checkDBEntry.js'
import { deleteTokenFromCookies } from '../helper/cookieManipulation.js'

const loginRouter = Router()

//enviar por body: email, password
loginRouter.post(
  '/',
  [
    emailCheck('email'),
    passwordCheck('password'),
    checking,
    userExistInBody,
    verifyPassword
  ],
  loginController.normalLogin
)

loginRouter.post('/google', userExistWGoogle, loginController.networkLogin)

loginRouter.post('/facebook', userExistWFacebook, loginController.networkLogin)

loginRouter.get('/logout', (req, res) => {
  const cookies = req.signedCookies.authToken
  // Si la cookie existe, la eliminamos
  if (cookies) {
    deleteTokenFromCookies(res)

    // Respuesta correcta de logout
    return res.json({ msg: 'Logout exitoso' })
  } else {
    // Si no hay cookie, significa que no estaba logueado
    return res.json({ msg: 'No se encuentra autenticado' })
  }
})

export default loginRouter
