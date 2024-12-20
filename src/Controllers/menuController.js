import { Sequelize } from 'sequelize'
import { uploadImageToS3 } from '../helper/imageToS3.js'
import { models } from '../Models/allModels.js'

const getMenus = async (req, res) => {
  try {
    const allMenus = await models.menus.findAll()

    res.status(200).json(allMenus)
  } catch (error) {
    res.status(500).send('error al obtener menus')
  }
}

const updateMenu = async (req, res) => {
  const contentBody = req.body
  const { image, id } = req.user
  
  try {
    const {
      changed,
      state,
      id: idmenu,
      id_restaurant,
      domain,
      ...allDataEntry
    } = contentBody
    //definimos le nombre de la imagen

    //definimos el path final de la url
    const path =
      id_restaurant + '/' + idmenu + '/' + `menu_${id}_${Date.now()}.webp`

    let imageURL = ''
    if (image) {
      const { urlImagen } = await uploadImageToS3(image, path)

      if (!urlImagen)
        return res.status(500).json({
          data: {},
          error: true,
          msg: 'Error al procesar la imagen'
        })

      imageURL = urlImagen
    }
    const newid = parseInt(idmenu)
    if (domain) {
      const findDomain = await models.menus.findOne({ where: { domain } })

      if (!findDomain?.dataValues?.id) {
        console.log('Buena eleccion de dominio')
        await models.menus.update(
          {
            ...allDataEntry,
            domain,
            header_url:
              imageURL == '' ? Sequelize.literal('header_url') : imageURL
          },
          { where: { id: newid } }
        )

        return res.status(200).json({
          error: false,
          msg: 'ok',
          data: { myUrl: imageURL, status: 200 }
        })
      } else if (
        findDomain.dataValues.id &&
        findDomain.dataValues.id != newid
      ) {
        console.log('domain siendo usado')
        await models.menus.update(
          {
            ...allDataEntry,
            header_url:
              imageURL == '' ? Sequelize.literal('header_url') : imageURL
          },
          { where: { id: newid } }
        )

        return res.status(201).json({
          error: false,
          msg: 'ok',
          data: {
            myUrl: imageURL,
            status: 204
          }
        })
      } else if (
        findDomain.dataValues.id &&
        findDomain.dataValues.id === newid
      ) {
        console.log('tu tienes este domain')

        await models.menus.update(
          {
            ...allDataEntry,
            header_url:
              imageURL == '' ? Sequelize.literal('header_url') : imageURL
          },
          { where: { id: newid } }
        )

        return res.status(200).json({
          error: false,
          msg: 'ok',
          data: { myUrl: imageURL, status: 200 }
        })
      }
    }
  } catch (error) {
    console.log({ error })
    res.status(500).json({
      data: {},
      error: true,
      msg: 'Error al actualizar restaurant'
    })
  }
}

export const menuController = {
  updateMenu,
  getMenus
}
