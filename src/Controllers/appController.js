import { models } from '../Models/allModels.js'

export const getMenu = async (req, res) => {
  const { domain } = req.params
  try {
    const data = await models.menus.findOne({
      where: { domain },
      include: {
        model: models.categories,
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
      }
    })

    const dataValues = data.dataValues
    res.status(200).json({ error: false, msg: 'ok', data: dataValues })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, msg: 'error al obtener los datos' })
  }
}
