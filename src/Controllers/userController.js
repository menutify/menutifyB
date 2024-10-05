import { models } from '../Models/allModels.js'

const getUser = async (req, res) => {
  try {
    
    const { email,password } = req.query

    if (!email) return res.status(204).json({ msg: 'email no ingresado' })

    const user = await models.user.count({ where: { email,password } })

    if (!user) res.status(404).json({ msg: false })

    return res.status(200).json({ msg: true })
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error al obtener la lista de Usuarios',
      error
    })
  }
}

const postUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const user = await models.user.count({ where: { email } })
    if (user) return res.status(226).json({ msg: 'correo no disponible' })

    const { id } = await models.user.create({ name, email, password })

    return res.status(200).json({ msg: true, id })
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error al crear el Usuario',
      error
    })
  }
}

export const userControllerFunctions = {
  getUser,
  postUser
}
