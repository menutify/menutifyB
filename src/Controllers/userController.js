import { models } from '../Models/allModels.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createJWT, verifyJWT } from '../helper/JWT.js'
import { transporter } from '../helper/mailerConfig.js'
import { confirmAccountMail } from '../database/mailModels.js'
import { setTokenToCookies } from '../helper/cookieManipulation.js'

const getUser = async (req, res) => {
  try {
    const users = await models.user.findAll()
    return res.json(users)
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error al obtener la lista de Usuarios',
      error:true,
      data: { error }
    })
  }
}


//!-----------------uso postman
const changeUserNewDetail = async (req, res) => {
  try {
    const { id, state = true, sub = false } = req.body

    const user = await models.user.update(
      { new: state, subActive: sub },
      { where: { id } }
    )

    return res.status(200).json({ msg: 'Usuario actualizado', user: user })
  } catch (error) {
    console.log({ error })
    res.status(400).json({
      data: 'error, new,sub cambio'
    })
  }
}

//!-----------------uso postman
const putUser = async (req, res) => {
  try {
    const { id } = req.params

    const data = req.body

    console.log({ data })
    let newPassword
    if (data?.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    await models.user.update(data, { where: { id } })

    return res.status(200).json({ msg: 'Usuario actualizado' })
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error renovar el Usuario',
      error
    })
  }
}

//!-----------------uso postman
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    await models.user.destroy({ where: { id } })

    return res.status(200).json({ msg: 'Usuario eliminado correctamete' })
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error al eliminar el Usuario',
      error
    })
  }
}

export const userControllerFunctions = {
  getUser,
  
  deleteUser,
  changeUserNewDetail,
 
  putUser
}
