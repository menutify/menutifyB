import express from 'express'
import cors from 'cors'
//routes
import userRoute from '../routes/user.routes.js'
//bd
import conexionDB from '../database/dbConexion.js'
import sqConexion from '../database/sqConexion.js'
//models
import { createModels } from '../Models/allModels.js'

class Server {
  constructor() {
    // iniciamos express en una variable
    this.app = express()
    // definimos los puertos
    this.port = process.env.PORT || '3000'
    //Conectar base de datos
    // conexionDB()
    this.initDB()
    // Middlewares
    this.app.use(express.static('src/public'))
    this.app.use(express.json())
    this.app.use(cors())
    // Rutas de la aplicacion
    this.app.use('/api/user', userRoute)
  }

  //metodo asincrono de coneccion con BD

  async initDB() {
    try {
      //autenticando conexion
      await sqConexion.authenticate()
      //creando modelos
      createModels(sqConexion)
      // sincronizando modelos, evitando la sustitucion
      await sqConexion.sync({ force: false })
    } catch (e) {
      console.log(e)
    }
  }

  // Iniciar API
  listen() {
    this.app.listen(this.port, () => {
      console.log('servidor levantado en el puerto: ', this.port)
    })
  }
}

export default Server
