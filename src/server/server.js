import express from 'express'
import cors from 'cors'
//routes
import userRoute from '../routes/user.routes.js'
import subRouter from '../routes/sub.routes.js'
import menuRouter from '../routes/menu.routes.js'
import logoRouter from '../routes/logo.routes.js'
import catRouter from '../routes/cat.routes.js'
//models and bd conexion
import { models } from '../Models/allModels.js'
import loginRouter from '../routes/login.routes.js'
import authRouter from '../routes/auth.routes.js'

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
    this.app.use('/api/sub', subRouter)
    this.app.use('/api/menus', menuRouter)
    this.app.use('/api/logos', logoRouter)
    this.app.use('/api/cat', catRouter)
    this.app.use('/api/login', loginRouter)
    this.app.use('/api/auth', authRouter)
  }

  //metodo asincrono de coneccion con BD

  async initDB() {
    try {
      //autenticando conexion
      await models.sqConexion.authenticate()
      //creando modelos
      models.categories
      models.favs
      models.user
      models.food
      models.invitedCode
      models.logo
      models.menus
      models.subs
      models.url
      // sincronizando modelos, evitando la sustitucion
      await models.sqConexion.sync({ force: false, alter: false })
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
