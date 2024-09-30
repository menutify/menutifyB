import { Router } from 'express'
// import { check } from 'express-validator'
// import check from '../middleware/check.js'
import db from '../database/dbConexion.js'
const userRouter = Router()

userRouter.get('/', async (req, res) => {
  try {
    // Enviar la respuesta usando res.json()
    // const connection = await db() // Espera a que la conexión se establezca
    // const [results] = await connection.query('SHOW DATABASES') // Desestructura el resultado

    // console.log({ results }) // Imprime los resultados en la consola
    // res.send(results)
    res.send('hola')
  } catch (error) {
    console.log(error)
    // Enviar el error al cliente también, si es necesario
    res.status(500).json({
      error: 'Internal Server Error'
    })
  }
})

export default userRouter
