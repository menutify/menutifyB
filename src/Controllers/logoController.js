import { models } from '../Models/allModels.js'

const getLogos = async (req, res) => {
  try {
    // todo obtener todos los logos, con findall
    const { id } = req.params

    const allLogos = await models.logo.findAll({ where: { id } })

    if (!allLogos)
      return res.status(400).json({ msg: 'problema al encontrar los menus' })

    return res.status(200).json({ response: allLogos, msg: 'ok' })
  } catch (error) {
    return res.status(400).json({ msg: 'error al obtener los logos', error })
  }
}

const postLogos = async (req, res) => {
  try {
    const { id } = req.params
    const logo = req.file

    if (!logo) return res.send('No se pudo obtener el logo')

    return res.status(200).json({
      msg: 'ok',
      response: { id, logo: logo.path }
    })
  } catch (error) {
    return res.status(400).json({ msg: 'error al enviar el logo', error })
  }
}
export const logoController = {
  getLogos,
  postLogos
}
