// import { where } from 'sequelize'
// import { models } from '../Models/allModels.js'

// const getCat = async (req, res) => {
//   try {
//     const { id_menu } = req.query

//     // console.log({ id_user })
//     const allCats = await models.categories.findAll()

//     if (!allCats)
//       return res.status(400).json({ msg: 'problema al encontrar los menus' })

//     return res.status(200).json({ response: allCats, msg: 'ok' })
//   } catch (error) {
//     return res
//       .status(400)
//       .json({ msg: 'error al obtener las categorias ', error })
//   }
// }

// const postCat = async (req, res) => {
//   try {
//     const { id_menu } = req.query
//     const { name } = req.body

//     const menu = models.menus.count({ where: { id: id_menu } })

//     if (!menu) return res.status(400).json({ msg: 'el menu no existe' })

//     console.log({ id_menu, name })
//     const response = await models.categories.create({
//       name,
//       id_menu
//     })

//     if (!response)
//       return res.status(400).json({ msg: 'error al crear el modelo' })
//     // 4- retornar respuesta
//     return res.status(200).json({ msg: 'ok', menu: response.id_menu })
//   } catch (error) {
//     return res.status(400).json({ msg: 'error al enviar la categoria ', error })
//   }
// }

// const putCat = async (req, res) => {
//   try {
//     const { id } = req.params
//     const { newName } = req.body

//     const data = await models.categories.update(
//       { name: newName },
//       { where: { id } }
//     )

//     if (data) return res.status(200).json({ msg: 'ok' })
//   } catch (error) {
//     return res.status(400).json({ msg: 'error al editar la categoria ', error })
//   }
// }
// const delCat = async (req, res) => {
//   try {
//     const { id } = req.params

//     await models.categories.destroy({ where: { id } })

//     return res.status(200).json({ msg: 'ok' })
//   } catch (error) {
//     return res.status(400).json({ msg: 'error al enviar el ', error })
//   }
// }

// export const catController = {
//   getCat,
//   postCat,
//   putCat,
//   delCat
// }
