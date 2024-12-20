import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { Server as SocketIO } from 'socket.io'
//models and bd conexion
import { models } from '../Models/allModels.js'
//routes
import userRoute from '../routes/user.routes.js'
import subRouter from '../routes/sub.routes.js'
import paymentRouter from '../routes/payment.routes.js'
import loginRouter from '../routes/login.routes.js'
import authRouter from '../routes/auth.routes.js'
import createAccountRouter from '../routes/createAccount.routes.js'
import restaurantRouter from '../routes/restaurant.routes.js'
import menuRouter from '../routes/menu.routes.js'
import catRouter from '../routes/cat.routes.js'
import dragRouter from '../routes/drag.routes.js'
class Server {
  constructor() {
    const whitelist = [
      'http://localhost:5173',
      'https://menutify-f-fuuu.vercel.app',
      'https://front-q-rmenutify.vercel.app/'
    ]
    // iniciamos express en una variable
    this.app = express()
    this.server = http.createServer(this.app)

    this.io = new SocketIO(this.server, {
      cors: {
        origin: whitelist,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
      }
    })
    this.app.set('io', this.io)
    // definimos los puertos
    this.port = process.env.PORT || '3000'
    //iniciamos los metodos
    this.initMiddlewares(whitelist)
    this.initRoutes()
    this.initWebSocket()
    this.initDB()
  }

  //--------------------------------------------------------------------------
  initMiddlewares(whitelist) {
    // Middlewares
    this.app.use(express.static('src/public'))
    this.app.use(morgan('dev'))
    this.app.use(cookieParser(process.env.SECRET_KEY_COOKIES)) //clave secreta dentro de parser
    this.app.use((req, res, next) => {
      if (req.path === '/api/payment/webhook-stripe') {
        // Para la ruta de webhook, usa express.raw para mantener el body en Buffer
        express.raw({ type: 'application/json' })(req, res, next)
      } else {
        express.json()(req, res, next)
      }
    })

    const corsOptions = {
      origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }
    }

    this.app.use(
      cors({
        origin: corsOptions.origin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
      })
    )
  }

  //--------------------------------------------------------------------------
  initRoutes() {
    // Define las rutas de tu aplicación
    this.app.use('/api/auth', authRouter)
    this.app.use('/api/login', loginRouter)
    this.app.use('/api/create-account', createAccountRouter)
    this.app.use('/api/payment', paymentRouter)
    this.app.use('/api/sub', subRouter)
    this.app.use('/api/user', userRoute)
    this.app.use('/api/restaurant', restaurantRouter)
    this.app.use('/api/menu', menuRouter)
    this.app.use('/api/cat', catRouter)
    this.app.use('/api/drag', dragRouter)
  }

  //--------------------------------------------------------------------------
  //metodo asincrono de coneccion con BD
  initWebSocket() {
    this.io.on('connection', (socket) => {
      const userId = socket.handshake.query.user_id
      try {
        // console.log('Usuario conectado: ' + userId + ' -> socketId:', socket.id)
        // crea una sala con el id del usuario
        socket.join(userId)
      } catch (error) {
        console.error('Error en la conexión de socket:', error)
      }
      // Manejo de eventos
      socket.on('disconnect', () => {
        // console.log('Usuario desconectado: ', socket.id)
      })
    })
  }

  //--------------------------------------------------------------------------
  async initDB() {
    try {
      //autenticando conexion
      await models.sqConexion.authenticate()
      //creando modelos
      // const { user, subs, restaurant, menus, categories, categoriesDetails, food } = models;

      // sincronizando modelos, evitando la sustitucion
      await models.sqConexion.sync({ force: false, alter: false })
    } catch (e) {
      console.log(e)
    }
  }

  // Iniciar API
  listen() {
    this.server.listen(this.port, () => {
      console.log('servidor levantado en el puerto: ', this.port)
    })
  }
}

export default Server
