const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).send({
      message: 'Usuário não autenticado',
      data: [],
      success: false
    })
  }

  const parts = authHeader.split(' ')

  if (!parts.length === 2) {
    return res.status(401).send({
      message: 'Token inválido',
      data: [],
      success: false
    })
  }

  const [ scheme, token ] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({
      message: 'Token com formato inválido',
      data: [],
      success: false
    })
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err)  {
      return res.status(401).send({
        message: 'Token inválido',
        data: [],
        success: false
      })
    }

    req.userId = decoded.id
    return next()
  })
}