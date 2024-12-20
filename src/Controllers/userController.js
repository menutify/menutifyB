import { models } from '../Models/allModels.js'
import bcrypt from 'bcryptjs'

const getUserById = async (req, res) => {
  try {
    const { email, id } = req.user
    const user = await models.user.findByPk(id)
    if (!user)
      return res
        .status(404)
        .json({ error: true, msg: 'no se encontro los datos del usuario' })
    console.log(user)

    return res.status(200).json({ error: false, data: user, msg: 'ok' })
  } catch (error) {
    console.log({ error })
    res.status(400).json({
      data: 'Se presento un error al obtener el usuario',
      error: true,
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
  getUserById,

  deleteUser,
  changeUserNewDetail,

  putUser
}
