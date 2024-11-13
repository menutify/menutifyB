// // import fs from 'fs/promises'
// import sharp from 'sharp'
// import { models } from '../Models/allModels.js'

// const getLogos = async (req, res) => {
//   try {
//     // todo obtener todos los logos, con findall
//     const { id } = req.params

//     const allLogos = await models.logo.findAll({ where: { id } })

//     if (!allLogos)
//       return res.status(400).json({ msg: 'problema al encontrar los menus' })

//     return res.status(200).json({ response: allLogos, msg: 'ok' })
//   } catch (error) {
//     return res.status(400).json({ msg: 'error al obtener los logos', error })
//   }
// }

// const postLogos = async (req, res) => {
//   try {
//     const { id } = req.params
//     const logo = req.files

//     if (!logo) return res.send('No se pudo obtener el logo')

//     await sharp(req.files['logo'][0].buffer)
//       .resize(500, 500)
//       .toFormat('webp')
//       .toFile(`src/upload/logoUser${id}_` + Date.now() + '.webp')
//     // await deleteFile(req.file.path)
//     // setTimeout(() => deleteFile(req.file.path), 2000)
//     /**
//      * todo
//      * *si existe el logo, subirlo al servidor
//      * *obtener url del servidor y mandarlo a la bd
//      * *
//      */

//     return res.status(200).json({
//       msg: 'ok',
//       response: { id, logo: logo.path }
//     })
//   } catch (error) {
//     return res.status(400).json({ msg: 'error al enviar el logo', error })
//   }
// }

// const putLogo = async (req, res) => {}
// const delLogo = async (req, res) => {}

// export const logoController = {
//   getLogos,
//   postLogos
// }
