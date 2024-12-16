import { models } from '../Models/allModels.js'
import { Op, Sequelize, literal } from 'sequelize'

const dragChildToParent = async (req, res) => {
  const { active_id } = req.params
  const { lengthFoodsOfNewCat, activeIndex, activeCatId, overCatId } = req.body

  try {
    const allTask = await models.sqConexion.transaction(async () => {
      //reodernas las pos del contener actual
      await models.food.update(
        { pos: literal('pos - 1') },
        {
          where: {
            pos: {
              [Op.gt]: activeIndex
            },
            id_cat: activeCatId
          }
        }
      )

      //cambiar el id_cat de la food a cambiar
      await models.food.update(
        { id_cat: overCatId, pos: lengthFoodsOfNewCat },
        { where: { id: parseInt(active_id) } }
      )

      //elobjeto se pone ultimo en el array del nuevo contenedor
      return true
    })

    if (!allTask) {
      return res
        .status(400)
        .json({ msg: 'Error al hacer la transaccion de datos', error: true })
    }

    res
      .status(200)
      .json({ msg: 'cambio realizado', error: false, data: { resp: 'ok' } })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, msg: 'Error global Hijo Padre' })
  }
}

const dragChildToChildGlobal = async (req, res) => {
  const { active_id } = req.params
  const { activeIndex, overIndex, activeCatId, overCatId } = req.body
  
  try {
    const allTask = await models.sqConexion.transaction(async () => {
      //reodernas las pos del contener actual >
      await models.food.update(
        { pos: literal('pos - 1') },
        {
          where: {
            pos: {
              [Op.gt]: activeIndex
            },
            id_cat: activeCatId
          }
        }
      )

      //aumentar la posicion de los nuevos hermanos >=
      await models.food.update(
        { pos: literal('pos + 1') },
        {
          where: {
            pos: {
              [Op.gte]: overIndex
            },
            id_cat: overCatId
          }
        }
      )

      //cambiar el id_cat de la food a cambiar
      await models.food.update(
        { id_cat: overCatId, pos: overIndex },
        { where: { id: parseInt(active_id) } }
      )

      //elobjeto se pone ultimo en el array del nuevo contenedor
      return true
    })

    if (!allTask) {
      return res
        .status(400)
        .json({ msg: 'Error al hacer la transaccion de datos', error: true })
    }

    res
      .status(200)
      .json({ msg: 'cambio realizado', error: false, data: { resp: 'ok' } })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, msg: 'Error global [Hijo] [Hijo]' })
  }
}

const dragChildToChild = async (req, res) => {
  const { active_id } = req.params
  const { direction } = req.query
  const { activeIndex, overIndex, activeCatId } = req.body

  console.log({
    activeCatId: typeof activeCatId,
    overIndex: typeof overIndex,
    activeIndex: typeof activeIndex,
    active_id: typeof active_id,
    direction
  })

  try {
    const allTask = await models.sqConexion.transaction(async (t) => {
      if (direction === 'asc') {
        //reodernas las pos del contener actual > <=
        await models.food.update(
          { pos: literal('pos - 1') },
          {
            where: {
              pos: {
                [Op.gt]: activeIndex,
                [Op.lte]: overIndex
              },
              id_cat: activeCatId
            },
            transaction: t
          }
        )
      } else if (direction === 'desc') {
        //reodernas las pos del contener actual >= <
        await models.food.update(
          { pos: literal('pos + 1') },
          {
            where: {
              pos: {
                [Op.gte]: overIndex,
                [Op.lt]: activeIndex
              },
              id_cat: activeCatId
            },
            transaction: t
          }
        )
      }

      //cambiar el id_cat de la food a cambiar
      await models.food.update(
        { pos: overIndex },
        { where: { id: parseInt(active_id) }, transaction: t }
      )

      //elobjeto se pone ultimo en el array del nuevo contenedor
      return true
    })
    if (!allTask) {
      return res
        .status(400)
        .json({ msg: 'Error al hacer la transaccion de datos', error: true })
    }

    res
      .status(200)
      .json({ msg: 'cambio realizado', error: false, data: { resp: 'ok' } })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, msg: 'Error global Hijo Hijo' })
  }
}

const dragParentToParent = async (req, res) => {
  const { active_id } = req.params
  const { direction } = req.query
  const { activeIndex, overIndex, idMenu } = req.body

  try {
    const allTask = await models.sqConexion.transaction(async () => {
      if (direction === 'asc') {
        //reodernas las pos del contener actual > <=
        await models.categories.update(
          { pos: literal('pos - 1') },
          {
            where: {
              pos: {
                [Op.gt]: activeIndex,
                [Op.lte]: overIndex
              },
              id_menu: idMenu
            }
          }
        )
      } else if (direction === 'desc') {
        //reodernas las pos del contener actual >= <
        await models.categories.update(
          { pos: literal('pos + 1') },
          {
            where: {
              pos: {
                [Op.gte]: overIndex,

                [Op.lt]: activeIndex
              },
              id_menu: idMenu
            }
          }
        )
      }

      //cambiar el id de la categories a cambiar
      await models.categories.update(
        { pos: overIndex },
        { where: { id: parseInt(active_id) } }
      )

      //elobjeto se pone ultimo en el array del nuevo contenedor
      return true
    })

    if (!allTask) {
      return res
        .status(400)
        .json({ msg: 'Error al hacer la transaccion de datos', error: true })
    }

    res
      .status(200)
      .json({ msg: 'cambio realizado', error: false, data: { resp: 'ok' } })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, msg: 'Error global Padre Padre' })
  }
}

const dragController = {
  dragChildToChild,
  dragChildToChildGlobal,
  dragChildToParent,
  dragParentToParent
}

export default dragController
