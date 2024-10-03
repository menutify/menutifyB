import sqConexion from '../database/sqConexion.js'

export const getUser = async (req, res) => {
  try {
    const { email } = req.query

    if (!email) return res.status(204).json({ msg: 'email no ingresado' })

    const user = await sqConexion.define().findOne({ where: { email } })

    if (!user) res.status(404).json({ msg: false })

    return res.status(200).json({ msg: true })
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error al obtener la lista de Usuarios',
      error
    })
  }
}

export const postUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const user = await sqConexion.define().findOne({ where: { email } })

    if (user) res.status(226).json({msg:'correo no disponible'})

    
  } catch (error) {
    res.status(400).json({
      data: 'Se presento un error al crear la lista de Usuarios',
      error
    })
  }
}

export const userControllerFunctions = {
  getUser
}
