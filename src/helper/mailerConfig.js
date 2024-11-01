import nodemailer from 'nodemailer'

// Configura el transporte de nodemailer con tu cuenta de Gmail
export const transporter = nodemailer.createTransport({
  service: 'gmail',

  auth: {
    user: 'gianco.marquez@gmail.com',
    pass: 'vpps fgpy bzrv aixb' // Es mejor usar variables de entorno para seguridad
  }
})
