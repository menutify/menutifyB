import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.webp')
  }
})

export const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true) // Acepta el archivo
    } else {
      cb(new Error('Solo se permiten archivos .png o .jpg')) // Rechaza el archivo
    }
  }
}).single('logo')

export const multerErrorHandlerMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Si el error es de Multer (por ejemplo, tamaño excedido)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'La imagen es demasiado grande. El límite es de 1MB.'
        })
      }
    } else if (err) {
      // Cualquier otro tipo de error
      return res.status(500).json({
        message: 'Error en la subida de la imagen.'
      })
    }
    next()
  })
}
