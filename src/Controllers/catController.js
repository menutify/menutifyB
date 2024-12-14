import { Sequelize } from 'sequelize'
import { deleteImageFromS3, uploadImageToS3 } from '../helper/imageToS3.js'

import { models } from '../Models/allModels.js'

const getAllCategoriesForIdMenu = async (req, res) => {
  try {
    const { id } = req.params

    const allCategories = await models.categories.findAll({
      where: { id_menu: id },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      include: { model: models.categoriesDetails, attributes: ['name', 'desc'] }
    })

    // console.log(allCategories)

    res.status(200).json(allCategories)
  } catch (error) {
    res.status(500).send('No se encontro la categoria')
  }
}

const createCategory = async (req, res) => {
  const data = req.body
  // console.log({ datacat: data })
  try {
    if (!data.id_menu)
      return res
        .status(404)
        .json({ error: true, msg: 'no se envio el id del menu' })

    const searchMenu = await models.menus.findOne({ id: data.id_menu })

    // console.log({ searchMenu })

    if (!searchMenu?.dataValues) {
      return res
        .status(404)
        .json({ error: true, msg: 'El menu seleccionada no existe' })
    }

    const position = await models.categories.count({
      where: { id_menu: data.id_menu }
    })

    console.log({ position })

    const createCategory = await models.categories.create({
      id_menu: data.id_menu,
      pos: position
    })

    if (!createCategory.dataValues.id) {
      return res
        .status(400)
        .json({ error: true, msg: 'no se pudo crear la categoria' })
    }
    const catValues = createCategory.dataValues

    const { dataValues } = await models.categoriesDetails.create({
      name: data.name,
      desc: data.desc,
      id_cat: catValues.id
    })

    res.status(200).json({
      error: false,
      data: { resp: { ...catValues, details: { ...dataValues } } },
      msg: 'Categoria creada correctamente'
    })
  } catch (error) {
    console.log('Error al crear category', { error })
    res.status(500).json({ error: true, msg: 'problema al crear la categoria' })
  }
}

const editCategory = async (req, res) => {
  const data = req.body
  const { id } = req.params

  try {
    const cambio = await models.categoriesDetails.update(data, {
      where: { id_cat: id }
    })

    if (!cambio) {
      return res
        .status(400)
        .json({ error: true, msg: 'Algo fallo al actualizar losc ambios' })
    }

    res.status(200).json({
      error: false,
      data: { resp: true },
      msg: 'Categoria editada correctamente'
    })
  } catch (error) {
    console.log('Error al editar category', { error })
    res.status(500).json({ error: true, msg: 'Error al editar category' })
  }
}

const deleteCategory = async (req, res) => {
  const { id } = req.params
  try {
    const { dataValues } = await models.categories.findOne({
      where: { id },
      attributes: ['pos', 'id_menu']
    })

    const respDelete = await models.categories.destroy({ where: { id } })
    if (respDelete != 1) {
      return res
        .status(400)
        .json({ error: true, msg: 'Problema al borrar la categoria' })
    }

    //logica para reordenar los datos por pos
    await models.categories.update(
      { pos: Sequelize.literal('pos - 1') }, // Actualiza 'pos' restando 1
      {
        where: {
          pos: { [Sequelize.Op.gt]: dataValues.pos }, // Solo las filas con pos > posToDelete
          id_menu: dataValues.id_menu // Y que pertenezcan a la categoría específica
        }
      }
    )

    res
      .status(200)
      .json({ error: false, msg: 'correcto', data: { resp: 'ok' } })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, msg: 'Error global al eliminar plato' })
  }
}
//----------------COMIDA_-----------------------
//----------------COMIDA_-----------------------
//----------------COMIDA_-----------------------

const getAllFoodsForIdMenu = async (req, res) => {
  try {
    const { id } = req.params

    const allFoods = await models.food.findAll({
      where: { id_cat: id },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: {
        model: models.foodDetails,
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }
    })

    res.status(200).json(allFoods)
  } catch (error) {
    res.status(500).send('No se encontro la comida')
  }
}

const createFood = async (req, res) => {
  const data = req.body
  const { image, id } = req.user

  try {
    if (!data.id_cat)
      return res
        .status(404)
        .json({ error: true, msg: 'no se envio el id de la categoria' })

    data.id_cat = parseInt(data.id_cat)
    data.price = parseFloat(data.price)
    data.star = data.star === 'false' ? false : true

    const searchCat = await models.categories.findByPk(data.id_cat, {
      include: { model: models.menus, attributes: ['id_restaurant'] }
    })

    if (!searchCat?.dataValues) {
      return res
        .status(404)
        .json({ error: true, msg: 'La categoria seleccionada no existe' })
    }

    const id_restaurant = searchCat.dataValues.menu.dataValues.id_restaurant
    console.log({
      id_restaurant
    })

    const position = await models.food.count({
      where: { id_cat: data.id_cat }
    })

    console.log({ position })

    //----------transaction
    const resultTransaction = await models.sqConexion.transaction(async () => {
      const createFood = await models.food.create({
        id_cat: data.id_cat,
        pos: position,
        state: true
      })

      if (!createFood.dataValues.id) {
        return res
          .status(400)
          .json({ error: true, msg: 'no se pudo crear la comida' })
      }
      const { id: id_food } = createFood.dataValues

      //subida de imagenes
      console.log({ id_food })
      const pathImage =
        id_restaurant +
        '/' +
        searchCat.dataValues.id_menu +
        '/foods/' +
        `food_${id_food}.webp`

      let imageURL = ''
      if (image) {
        const { urlImagen } = await uploadImageToS3(image, pathImage)

        if (!urlImagen)
          return res.status(500).json({
            data: {},
            error: true,
            msg: 'Error al procesar la imagen'
          })

        imageURL = urlImagen
      }

      console.log({ imageURL })

      const foodDETAIL = await models.foodDetails.create({
        id_food: id_food,
        img: imageURL,
        price: data.price,
        name: data.name,
        star: data.star,
        desc: data.desc
      })

      return [foodDETAIL, createFood]
    })
    //proceso de creacion

    if (!resultTransaction[0]?.dataValues) {
      return res.status(400).json({
        data: {},
        error: true,
        msg: 'Error al crear los detalles de la comida'
      })
    }

    res.status(200).json({
      error: false,
      data: {
        resp: {
          ...resultTransaction[1].dataValues,
          foodDetail: { ...resultTransaction[0].dataValues }
        }
      },
      msg: 'Platillo creado correctamente'
    })
  } catch (error) {
    console.log('Error al crear category', { error })
    res
      .status(500)
      .json({ error: true, msg: 'problema al crear toda la  comida' })
  }
}

const editFood = async (req, res) => {
  const { name, desc, star, price, id_menu, id_rest } = req.body
  const { id: id_food } = req.params
  const { image, id: id_user } = req.user

  console.log(req.body)
  //el precio y star vienen como un str lo cual es incompatible
  try {
    if (image) {
      const pathImage =
        id_rest +
        '/' +
        id_menu +
        '/foods/' +
        `food_${id_food}_${Date.now()}.webp`

      const { dataValues } = await models.foodDetails.findOne({
        where: { id_food },
        attributes: ['img']
      })

      if (dataValues.img) {
        await deleteImageFromS3(dataValues.img.split('.com/')[1])
      }

      const { urlImagen } = await uploadImageToS3(image, pathImage)

      if (!urlImagen)
        return res.status(500).json({
          data: {},
          error: true,
          msg: 'Error al procesar la imagen'
        })

      const cambio = await models.foodDetails.update(
        {
          name,
          img: urlImagen,
          desc,
          star: star === 'false' ? false : true,
          price: parseFloat(price)
        },
        {
          where: { id_food: parseInt(id_food) }
        }
      )

      console.log('llegamos al cambio')

      if (!cambio) {
        return res
          .status(400)
          .json({ error: true, msg: 'Algo fallo al actualizar los cambios' })
      }
    }
    const cambio = await models.foodDetails.update(
      {
        name,
        desc,
        star: star === 'false' ? false : true,
        price: parseFloat(price)
      },
      {
        where: { id_food: parseInt(id_food) }
      }
    )

    console.log('llegamos al cambio')

    if (!cambio) {
      return res
        .status(400)
        .json({ error: true, msg: 'Algo fallo al actualizar los cambios' })
    }

    res.status(200).json({
      error: false,
      data: { resp: true },
      msg: 'Categoria editada correctamente'
    })
  } catch (error) {
    console.log('Error al editar category', { error })
    res.status(500).json({ error: true, msg: 'Error al editar comida' })
  }
}

const deleteFood = async (req, res) => {
  const { id } = req.params
  try {
    const { dataValues } = await models.food.findOne({
      where: { id },
      attributes: ['pos', 'id_cat'],
      include: { model: models.foodDetails, attributes: ['img'] }
    })

    const imgPath = dataValues.foodDetail.dataValues.img

    if (imgPath) {
      await deleteImageFromS3(imgPath.split('.com/')[1])
    }

    const respDelete = await models.food.destroy({ where: { id } })
    if (respDelete != 1) {
      return res
        .status(400)
        .json({ error: true, msg: 'Problema al borrar la comida 1' })
    }

    //logica para reordenar los datos por pos
    await models.food.update(
      { pos: Sequelize.literal('pos - 1') }, // Actualiza 'pos' restando 1
      {
        where: {
          pos: { [Sequelize.Op.gt]: dataValues.pos }, // Solo las filas con pos > posToDelete
          id_cat: dataValues.id_cat // Y que pertenezcan a la categoría específica
        }
      }
    )

    res
      .status(200)
      .json({ error: false, msg: 'correcto', data: { resp: 'ok' } })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, msg: 'Error global al eliminar plato' })
  }
}
//-----------------cascada---------------------------------
//-----------------cascada---------------------------------
//-----------------cascada---------------------------------
const getCategoriesWithCascadeData = async (req, res) => {
  //this is for all information
  try {
    const { id } = req.params

    const allCategories = await models.categories.findAll({
      where: { id_menu: id },
      order: [['pos', 'ASC']],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      include: [
        {
          model: models.categoriesDetails,
          attributes: ['name', 'desc']
        },
        {
          model: models.food,
          separate: true,
          order: [['pos', 'ASC']],
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: {
            model: models.foodDetails,
            attributes: { exclude: ['createdAt', 'updatedAt'] }
          }
        }
      ]
    })

    // console.log(allCategories)

    res.status(200).json({
      error: false,
      data: { allCategories },
      msg: 'obtenido cascade correcto'
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, msg: 'No se encontro la categoria' })
  }
}

export const catController = {
  deleteFood,
  createCategory,
  createFood,
  editCategory,
  getAllCategoriesForIdMenu,
  getAllFoodsForIdMenu,
  getCategoriesWithCascadeData,
  editFood,
  deleteCategory
}

/*
- eliminar
- al eliminar configurar de nuevo el index
- eliminar un hijo
- al eliminar un hijo ordenar los pos de los hjijio
- sortear

*/
