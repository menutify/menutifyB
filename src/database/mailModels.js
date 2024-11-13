export const changePasswordMail = (to, link) => {
  return {
    from: 'no-reply@menutify.com',
    to,
    subject: 'Restablecimiento de contraseña',
    text: `Has solicitado un restablecimiento de contraseña. Usa el siguiente enlace para restablecerla: ${link}`
  }
}

export const confirmAccountMail = (to, link) => {
  return {
    from: 'no-reply@menutify.com',
    to,
    subject: 'Confirmación de email',
    text: ` Usa el siguiente enlace para confirmar tu email: \n ${link}`
  }
}
