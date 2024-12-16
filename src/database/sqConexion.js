import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const database = process.env.BD_DATABASE
const username = process.env.BD_USERNAME
const password = process.env.DB_PASSWORD
const host = process.env.DB_HOST
const port = process.env.DB_PORT

const sqConexion = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: 'mysql',
  //permite que las tablas creadas tengan el mismmo nombre del modelo
  define: {
    freezeTableName: true
  },
  logging: false
})

export default sqConexion
