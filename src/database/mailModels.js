export const changePasswordMail = (to, link) => {
  return {
    from: 'no-reply@menutify.com',
    to,
    subject: 'Restablecimiento de contraseña',
    html: `
    <p>Hola,</p>
    <p>Usa el siguiente enlace para reestablecer tu contraseña:</p>
    <button><a href="${link}" target="_blank">Reestablecer contraseña</a></button>
    <p>Si no solicitaste este correo, puedes ignorarlo.</p>
  `
  }
}

export const confirmAccountMail = (to, link) => {
  return {
    from: 'no-reply@menutify.com',
    to,
    subject: 'Confirmación de email',
    html: `
    <p>Hola,</p>
    <p>Usa el siguiente enlace para confirmar tu email:</p>
    <button><a href="${link}" target="_blank">Confirmar email</a></button>
    <p>Si no solicitaste este correo, puedes ignorarlo.</p>
  `
  }
}

export const webhookPaymentMP = (
  metadata,
  status_detail,
  idPayment,
  name,
  c_date,
  f_date
) => {
  return {
    from: 'no-reply@menutify.com',
    to: metadata.email,
    subject: 'Recibo de pago en Menutify',
    html: `
    <p>Hola,</p>
    <p>cliente: ${name}</p>
    <p>amountPaid: 1000$ ARS</p>
    <p>fecha de Pago: ${c_date}</p>
    <p>fecha de Vencimiento: ${f_date}</p>
    <p>estado: ${status_detail}</p>
    <p>paymentIntentId: ${idPayment}</p>
    
  `
  }
}

export const webhookInformation = (
  to,
  client,
  intent,
  amount,
  currency,
  date,
  invoiceId
) => {
  return {
    from: 'no-reply@menutify.com',
    to,
    subject: 'webhook informacion de pago',
    html: `
    <p>Hola,</p>
    <p>cliente: ${client}</p>
    <p>paymentIntentId: ${intent}</p>
    <p>amountPaid: ${amount}</p>
    <p>currency: ${currency}</p>
    <p>fecha: ${date}</p>
    <p>facturaId: ${invoiceId}</p>
  `
  }
}
