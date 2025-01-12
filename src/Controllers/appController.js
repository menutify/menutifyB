import { models } from '../Models/allModels.js'

export const getMenu = async (req, res) => {
  const { domain } = req.params
  try {
    const {dataValues} = await models.menus.findOne({
      where: { domain },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
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
        },
        { model: models.restaurant }
      ]
    })

    const {id_restaurant}=dataValues

    const getStateOfRest=await models.restaurant.findOne({where:{id:id_restaurant}})

    //si la respuesta existe y el estado es falso, retornamnada
    if(getStateOfRest && !getStateOfRest.dataValues.state){
      return res.status(200).json({ error: false, msg: 'ok', data: {} })
    }

    res.status(200).json({ error: false, msg: 'ok', data: dataValues })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: true, msg: 'error al obtener los datos' })
  }
}
