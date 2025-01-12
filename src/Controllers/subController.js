import { models } from '../Models/allModels.js'
import { addDaysToDate } from '../helper/calculationHelpers.js'

const getAllSubs = async (req, res) => {
  try {
    // return res.status(200).json({ subs: await models.subs.findAll() })
    res.status(200).json({
      subs: await models.subs.findAll({
        include: [
          {
            model: models.user,
            attributes: ['id', 'name', 'email'] // Ajusta los atributos necesarios
          }
        ]
      })
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: 'error al obtener todos los registros', error })
  }
}

const getOneSub = async (req, res) => {
  const { id } = req.user
  console.log('sub entry')
  console.log({ id })
  try {
    const { dataValues } = await models.subs.findOne({
      where: { id_user: id },
      include: [
        {
          model: models.user,
          attributes: ['name', 'email'] // Ajusta los atributos necesarios
        }
      ]
    })

    if (!dataValues ){
      return res
        .status(404)
        .json({ error: true, msg: 'No se encontro la sub con su ID' })}

    // cambiamos el state de restaurant si la sub esta vencida
      await models.restaurant.update({state:dataValues.state},{where:{id_user:id}})
    
    // console.log({ mysub })
    res.status(200).json({
      error: false,
      msg: 'ok',
      data: {
        state: dataValues.state,
        c_date: dataValues.c_date,
        f_date: dataValues.f_date
      }
    })
  } catch (error) {
    console.log({ error })
    res.status(500).json({ msg: 'error al obtener el registro', error })
  }
}

const deleteSub = async (req, res) => {
  const { id_user } = req.params

  try {
    const deletedCount = await models.subs.destroy({ where: { id_user } })

    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ msg: 'No se encontró la suscripción a eliminar' })
    }

    res.status(200).json({
      msg: 'eliminado'
    })
  } catch (error) {
    res.status(400).json({ msg: 'error al elimiinar la sub', error })
  }
}
// const postSub = async (req, res) => {
//   try {
//     //identificar el ID del usuario
//     const { id, payVerification } = req.body
//     //tenemos que verificar el pago
//     if (!payVerification)
//       return res.status(404).json({ msg: 'no se proceso el pago' })

//     await models.subs.create({
//       id_user: id,
//       c_date: Date.now(),
//       f_date: addDaysToDate(31, Date.now()),
//       state: true,
//       type: '1'
//     })

//     return res.status(200).json({ msg: true })
//   } catch (error) {
//     console.log(error)
//     return res.status(400).json({ msg: 'error al pagar la sub', error })
//   }
// }

// const putSub = async (req, res) => {
//   try {
//     //identificar el ID del usuario
//     const { id } = req.params
//     const { payVerification } = req.body
//     //tenemos que verificar el pago
//     if (!payVerification)
//       return res.status(404).json({ msg: 'no se proceso el pago' })

//     // obtenemos los datos de la sub del usuario
//     const { dataValues } = await models.subs.findOne({
//       where: { id_user: id }
//     })

//     //tenemos que verificar la fecha que tiene la sub dependiendo del estado que tenga, si esta activa o no

//     const finalDaySubcription = dataValues.state
//       ? dataValues.f_date
//       : Date.now()
//     console.log({ finalDaySubcription })
//     //aumentar los dias, dependiendo de la fecha

//     const newDateSubcription = addDaysToDate(31, finalDaySubcription)
//     console.log({ newDateSubcription })
//     //editar el modelo
//     await models.subs.update(
//       { f_date: newDateSubcription, c_date: Date.now(), state: true },
//       { where: { id_user: id } }
//     )

//     return res.status(200).json({ msg: true })
//     //respuesta
//   } catch (error) {
//     return res
//       .status(400)
//       .json({ msg: 'Error al actulizar subscripcion', error })
//   }
// }

export const subObject = {
  deleteSub,
  getAllSubs,
  getOneSub
}
