import { body } from 'express-validator'
import multer from 'multer'
import sharp from 'sharp'
// definimos los tipos permitidos con expresion regular
const allowedMimeTypes = /^(image\/jpeg|image\/png|image\/webp|image\/jpg)$/

// opciones que tendran las imagenes subidas
const options = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.test(file.mimetype))
      cb(new Error('Solo se permiten imagenes con formato jpeg,png,jpg y webp'))
    cb(null, true)
  }
}

const upload = multer(options).fields([
  { name: 'singleImage', maxCount: 1 },
  { name: 'arrayImage', maxCount: 3 }
])

// ?-------------------------------
export const multerMiddleware = async (req, res, next) => {
  const { size } = req.query

  upload(req, res, async (err) => {
    //! manejo de errores de tamaño
    if (err instanceof multer.MulterError) {
      // Si el error es de Multer (por ejemplo, tamaño excedido)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'La imagen es demasiado grande. El límite es de 5MB.'
        })
      }
    } else if (err) {
      // Cualquier otro tipo de error
      return res.status(500).json({
        message: 'Error en la subida de la imagen.'
      })
    }
    if (!req.files['singleImage']) {
      console.log('no hay imagen')

      next()
    } else {
      console.log('si hay imagen')

      const imageDetails = req.files['singleImage'][0]

      // !manejo de error de subidaP
      if (!imageDetails) {
        return res.status(400).json({
          message: 'No se ha subido ningún archivo.'
        })
      }
      let newBuffer

      if (size === 'header') {
        newBuffer = await sharp(imageDetails.buffer)
          .resize({ fit: 'cover', width: 960, height: 540 })
          .toBuffer()
      } else {
        //tranformar dimensiones de la imagen
        newBuffer = await sharp(imageDetails.buffer)
          .resize({ fit: 'cover', width: 500, height: 500 })
          .toBuffer()
      }

      imageDetails.buffer = newBuffer
      req.user = { ...req.user, image: imageDetails }

      next()
    }
  })
}
