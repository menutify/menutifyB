import { Sequelize } from 'sequelize'
import { uploadImageToS3 } from '../helper/imageToS3.js'
import { models } from '../Models/allModels.js'

const getMenus= async(req,res)=>{
 try {
  const allMenus=await models.menus.findAll()

  res.status(200).json(allMenus)
 } catch (error) {
  res.status(500).send('error al obtener menus')
 }
}

const updateMenu = async (req, res) => {
  const contentBody = req.body
  const { image, id } = req.user
  console.log(contentBody)
  try {
    const {
      changed,
      state,
      id: idmenu,
      id_restaurant,
      ...allDataEntry
    } = contentBody
    //definimos le nombre de la imagen

    //definimos el path final de la url
    const path = id_restaurant + '/' + idmenu + '/' + `menu_${id}_${Date.now()}.webp`

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

    console.log('a ver si actualizamos')
    await models.menus.update(
      {
        ...allDataEntry,
        header_url: imageURL == '' ? Sequelize.literal('header_url') : imageURL
      },
      { where: { id: idmenu } }
    )

    console.log('llegamos')
    res.status(200).json({
      data: { myUrl: imageURL },

      error: false,
      msg: 'Se actualizo correctamente'
    })
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
  updateMenu
  ,getMenus
}
