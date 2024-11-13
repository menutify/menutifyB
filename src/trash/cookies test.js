createAccountRouter.post('/login', algomas, async (req, res) => {
    // Obtenemos la IP del cliente
    const ip = req.ip // O req.connection.remoteAddress si no funciona correctamente
    // Obtenemos el User-Agent del navegador
    const userAgent = req.headers['user-agent']
  
    // Información que queremos almacenar en el token
    const payload = {
      id: '12345', // Este sería el ID del usuario real
      ip,
      userAgent
    }
  
    // Generamos el token
    const { error, token } = createJWT(payload)
    console.log({ token })
  
    try {
      if (error) return res.status(400).json({ message: error })
      // Guardamos el token en una cookie HttpOnly
      setTokenToCookies(res, token)
  
      res.status(200).json({ message: 'Login exitoso' })
    } catch (error) {
      console.log({ error })
      return
    }
  })
  
  // Middleware de autenticación
  const authenticateToken = (req, res, next) => {
    console.log('hola')
    // const token = req.cookies.authToken
    const { authToken } = getTokenFromCookies(req)
  
    console.log({ authToken })
    return
    if (!token) return res.status(401).json({ message: 'Token no encontrado' })
    console.log({ token })
    try {
      jwt.verify(token, 'm2n5t3fy', (err, decoded) => {
        if (err)
          return res.status(403).json({ message: 'Token inválido o expirado' })
  
        const currentUserAgent = req.headers['user-agent']
        const currentIp = req.ip
  
        // Verificamos si el User-Agent y la IP del token coinciden con los de la solicitud actual
        if (decoded.userAgent !== currentUserAgent || decoded.ip !== currentIp) {
          return res.status(403).json({ message: 'Autenticación inválida' })
        }
  
        req.user = decoded
        next()
      })
    } catch (error) {
      console.log({ error })
      return
    }
  }
  
  // Ruta protegida
  createAccountRouter.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Acceso permitido', user: req.user })
  })