import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com', // Servidor SMTP de privateemail.com
  port: 587, // Puerto para conexiones TLS
  secure: false, // Usamos `false` para TLS
  auth: {
    user: 'no-reply@menutify.com', // Cambia a tu email de privateemail.com
    pass: 'Tecnicos88', // Cambia a tu contraseña de privateemail.com
  },
})