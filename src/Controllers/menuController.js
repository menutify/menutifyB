import { models } from '../Models/allModels.js'

const getMenus = async (req, res) => {
  //todo obtner todos los menus existentes del usuario
  try {
    const { id_user } = req.query

    // console.log({ id_user })
    const allMenus = await models.user.findAll({
      where: { id: id_user },
      include: [
        {
          model: models.menus
        }
      ]
    })

    if (!allMenus)
      return res.status(400).json({ msg: 'problema al encontrar los menus' })

    return res.status(200).json({ response: allMenus[0], msg: 'ok' })
  } catch (error) {
    return res
      .status(400)
      .json({ msg: 'error al obtener el menu por id', error })
  }
}

const getMenusById = async (req, res) => {
  //todo obtener el menu por id independientemente del usuario
  try {
    const { id } = req.params

    // console.log({ id })
    const menuData = await models.menus.findByPk(id)

    if (!menuData)
      return res.status(400).json({ msg: 'problema al obtener el menu' })

    return res.status(200).json(menuData)
  } catch (error) {
    return res
      .status(400)
      .json({ msg: 'error al obtener el menu por id', error })
  }
}

const postMenus = async (req, res) => {
  //todo crear menu, verificando el pago
  try {
    // 1- obtener datos de creacion de menu
    // const {id_user,name,bg_color,description=''}=req.body
    const {id_user} = req.query
    const data = req.body

    // 3- registrarlo en la base de datos
    const response = await models.menus.create({
      ...data,
      id_user,
      state: true
    })
    if (!response)
      return res.status(400).json({ msg: 'error al crear el modelo' })
    // 4- retornar respuesta
    return res.status(200).json({ msg: 'ok', user: data.id_user })
  } catch (error) {
    return res.status(400).json({ msg: 'error al crear el menu', error })
  }
}

const putMenus = async (req, res) => {}

const deleteMenus = async (req, res) => {}

export const menuController = {
  getMenus,
  getMenusById,
  postMenus,
  putMenus,
  deleteMenus
}
