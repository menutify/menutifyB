import { models } from '../Models/allModels.js'
import { addDaysToDate } from '../helper/calculationHelpers.js'

const getSubs = async (req, res) => {
  try {
    return res.status(200).json(await models.subs.findAll())
  } catch (error) {
    console.log(error)
    return res
      .status(400)
      .json({ msg: 'error al obtener todos los registros', error })
  }
}

const postSub = async (req, res) => {
  try {
    //identificar el ID del usuario
    const { id, payVerification } = req.body
    //tenemos que verificar el pago
    if (!payVerification)
      return res.status(404).json({ msg: 'no se proceso el pago' })

    await models.subs.create({
      id_user: id,
      c_date: Date.now(),
      f_date: addDaysToDate(31, Date.now()),
      state: true,
      type: '1'
    })

    return res.status(200).json({ msg: true })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ msg: 'error al pagar la sub', error })
  }
}

const putSub = async (req, res) => {
  try {
    //identificar el ID del usuario
    const { id } = req.params
    const { payVerification } = req.body
    //tenemos que verificar el pago
    if (!payVerification)
      return res.status(404).json({ msg: 'no se proceso el pago' })
    console.log('probando .-1')
    // obtenemos los datos de la sub del usuario
    const { dataValues } = await models.subs.findOne({
      where: { id_user: id }
    })

    //tenemos que verificar la fecha que tiene la sub dependiendo del estado que tenga, si esta activa o no

    const finalDaySubcription = dataValues.state
      ? dataValues.f_date
      : Date.now()
    console.log({ finalDaySubcription })
    //aumentar los dias, dependiendo de la fecha

    const newDateSubcription = addDaysToDate(31, finalDaySubcription)
    console.log({ newDateSubcription })
    //editar el modelo
    await models.subs.update(
      { f_date: newDateSubcription, c_date: Date.now(), state: true },
      { where: { id_user: id } }
    )

    return res.status(200).json({ msg: true })
    //respuesta
  } catch (error) {
    return res
      .status(400)
      .json({ msg: 'Error al actulizar subscripcion', error })
  }
}

export const subObject = {
  postSub,
  putSub,
  getSubs
}
