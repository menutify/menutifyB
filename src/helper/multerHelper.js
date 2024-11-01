import multer from 'multer'

// definimos los tipos permitidos con expresion regular
const allowedMimeTypes = /^(image\/jpeg|image\/png|image\/webp|image\/jpg)$/

// opciones que tendran las imagenes subidas
const options = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.test(file.mimetype))
      cb(new Error('Solo se permiten imagenes con formato jpeg,png,jpg y webp'))
    cb(null, true)
  }
}

//definimos la subida
export const upload = multer(options).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'galleryLogo', maxCount: 3 }
])

// ?-------------------------------
export const multerMiddleware = (req, res, next) => {
  upload(req, res, async (err) => {
    //! manejo de errores de tamaño
    if (err instanceof multer.MulterError) {
      // Si el error es de Multer (por ejemplo, tamaño excedido)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'La imagen es demasiado grande. El límite es de 3MB.'
        })
      }
    } else if (err) {
      // Cualquier otro tipo de error
      return res.status(500).json({
        message: 'Error en la subida de la imagen.'
      })
    }

    // !manejo de error de subida
    if (!req.files['logo'][0]) {
      return res.status(400).json({
        message: 'No se ha subido ningún archivo.'
      })
    }

    next()
  })
}
