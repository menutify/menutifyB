import { Sequelize } from 'sequelize'

const database = 'menu'
const username = 'root'
const password = 'enig12ma34'
const host = 'localhost'
const port = 3306

const sqConexion = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: 'mysql'
})

export default sqConexion
