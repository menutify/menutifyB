import { Sequelize } from 'sequelize'
import { deleteImageFromS3, uploadImageToS3 } from '../helper/imageToS3.js'
import { models } from '../Models/allModels.js'

const getRestaurant = async (req, res) => {
  const user = req.user

  try {
    const respRest = await models.restaurant.findOne({
      where: { id_user: user.id }
    })

    if (respRest?.dataValues?.id) {
      const { updatedAt, createdAt, id_user, ...allRest } = respRest.dataValues
      const respMenu = await models.menus.findOne({
        where: { id_restaurant: respRest.dataValues.id }
      })
      const { updatedAt: uM, createdAt: cM, ...allMenu } = respMenu.dataValues

      return res.status(200).json({
        data: { respRest: allRest, respMenu: allMenu },
        error: false,
        msg: 'restaurant obtenido'
      })
    }

    const respCreate = await models.restaurant.create({ id_user: user.id })
    const menuCreate = await models.menus.create({
      id_restaurant: respCreate.dataValues.id
    })

    await models.menus.update(
      { domain: menuCreate.dataValues.id },
      { where: { id: menuCreate.dataValues.id } }
    )

    const {
      updatedAt: uC,
      createdAt: cC,
      id_user,
      ...allRest
    } = respCreate.dataValues
    const { updatedAt: uM, createdAt: cM, ...allMenu } = menuCreate.dataValues

    res.status(201).json({
      data: { respRest: allRest, respMenu: allMenu },
      msg: 'Se creo el restaurante',
      error: false
    })
  } catch (error) {
    console.log({ error })
    res.status(500).json({
      data: {},
      error: true,
      msg: 'Error al obtener / crear restaurant'
    })
  }
}

const updateRestaurant = async (req, res) => {
  const contentBody = req.body
  const { image, id } = req.user

  try {
    const { changed, id: idrest, ...allDataEntry } = contentBody
    //definimos le nombre de la imagen

    //definimos el path final de la url
    const path = idrest + '/' + `logo_${id}_${Date.now()}.webp`

    let imageURL = ''
    
    if (image) {
      console.log('entramos a la imagen renovacion')
      const { dataValues } = await models.restaurant.findOne({
        where: { id: idrest },
        attributes: ['logo_url']
      })

      if (dataValues.logo_url) {
        await deleteImageFromS3(dataValues.logo_url.split('.com/')[1])
      }

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
    await models.restaurant.update(
      {
        ...allDataEntry,
        logo_url: imageURL == '' ? Sequelize.literal('logo_url') : imageURL,
        state:
          allDataEntry.name != '' && allDataEntry.address != '' ? true : false
      },
      { where: { id: idrest } }
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

const uploadLogoRestaurant = async (req, res) => {
  try {
    const { type } = req.body
    const { image, id } = req.user
    console.log({ type, id })
    if (type == 'logo') {
      image.fieldname = `${type}_${id}.webp`
    } else if (type == 'header') {
      image.fieldname = `${type}_${id}.webp`
    }
    const path = id + '/' + image.fieldname
    //subir a s3
    const { urlImagen } = await uploadImageToS3(image, path)
    //actualizar bd

    if (type == 'logo') {
      await models.restaurant.update(
        { logo_url: urlImagen },
        { where: { id_user: id } }
      )
    } else if (type == 'header') {
      await models.restaurant.update(
        { header_url: urlImagen },
        { where: { id_user: id } }
      )
    }

    //retornar el link

    res.status(200).json({ data: { urlImagen }, error: false, msg: 'ok' })
  } catch (error) {
    console.log({ error })
    res.status(500).json({
      data: {},
      error: true,
      msg: 'Error al subir el logo'
    })
  }
}

const deleteImage = async (req, res) => {
  console.log('entre')
  try {
    const { name } = req.params
    console.log({ name })
    const resp = await deleteImageFromS3(name)
    //retornar el link

    res.status(200).json({ data: { resp }, error: false, msg: 'ok' })
  } catch (error) {
    console.log({ error })
    res.status(500).json({
      data: {},
      error: true,
      msg: 'Error al eliminar el logo'
    })
  }
}

const restaurantController = {
  updateRestaurant,
  getRestaurant,
  deleteImage,
  uploadLogoRestaurant
}

export default restaurantController
