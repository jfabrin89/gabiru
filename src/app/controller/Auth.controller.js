const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const mailer = require('../../modules/mailer')

const authConfig = require('../../config/auth')

const User = require('../models/user.model')
const router = express.Router()

function generateToken (params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  })
}

router.post('/', async (req, res) => {
  const { email } = req.body
  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({
        message: 'E-mail já cadastrado!',
        data: [],
        success: false
      })
    }

    const user = await User.create(req.body)

    user.password = undefined

    return res.status(200).send({
      message: 'Usuário cadastrado com sucesso!',
      data: user,
      token: generateToken({ id: user.id }),
      success: true
    })
  } catch (err) {
    return res.status(400).send({
      message: 'Erro ao cadastrar usuário!',
      data: err,
      success: false
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const user = await User.find()
    res.status(200).send({
      message: 'Usuários listados com sucesso!',
      data: user,
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar buscar usuários, tente novamente',
      data: err,
      success: false
    })
  }
})

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    res.status(200).send({
      message: 'Usuário listado com sucesso!',
      data: user,
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar buscar usuário, tente novamente',
      data: err,
      success: false
    })
  }
})

router.put('/:userId', async (req, res) => {
  try {
    const { name, email } = req.body

    const user = await User.findByIdAndUpdate(req.params.userId, {
      name,
      email
    })

    await user.save()

    return res.status(200).send({
      message: 'Usuário alterado com sucesso!',
      data: user,
      success: true
    })
  } catch (err) {
    console.log(err)
    return res.status(400).send({
      message: 'Erro ao alterar usuário!',
      data: err,
      success: false
    })
  }
})

router.delete('/:userId', async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.userId)
    res.status(200).send({
      message: 'Usuário removido com sucesso!',
      data: [],
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar remover usuário, tente novamente',
      data: err,
      success: false
    })
  }
})

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return res.status(400).send({
      message: 'Usuário não encontrado!',
      data: [],
      success: false
    })
  }

  if (!await bcrypt.compare(password, user.password)) {
    return res.status(400).send({
      message: 'Senha informada é inválida!',
      data: [],
      success: false
    })
  }

  user.password = undefined

  res.status(200).send({ 
    message: 'Acesso permitido com sucesso!',
    data: user,
    token: generateToken({ id: user.id }),
    success: true
  })
})

router.post('/forgot_password', async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).send({
        message: 'Usuário não encontrado!',
        data: [],
        success: false
      })
    }

    const token = crypto.randomBytes(20).toString('hex')
    const now = new Date()
    now.setHours(now.getHours() + 1)

    await User.findByIdAndUpdate(user.id, {
      '$set': {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    })

    mailer.sendMail({
      to: email,
      from: 'johny.fabrin@totvs.com.br',
      template: 'auth/forgot_password',
      context: { token }
    }, (err) => {
      if (err) {
        res.status(400).send({
          message: 'Erro ao tentar enviar e-mail de recuperação, entre em contato com o suporte!',
          data: err,
          success: false
        })
      }

      res.status(200).send()
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar recuperar senha, tente novamente',
      data: err,
      success: false
    })
  }
})

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body

  try {
    const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires')

    if (!user) {
      return res.status(400).send({
        message: 'Usuário não encontrado!',
        data: [],
        success: false
      })
    }

    if (token !== user.passwordResetToken) {
      return res.status(400).send({
        message: 'Token inválido!',
        data: [],
        success: false
      })
    }

    const now = new Date()

    if (now > user.passwordResetExpires) {
      return res.status(400).send({
        message: 'Token expirado, solicite um novo!',
        data: [],
        success: false
      })
    }

    user.password = password
    user.passwordResetExpires = undefined
    user.passwordResetToken = undefined
    await user.save()

    res.status(200).send({
      message: 'Senha alterada com sucesso!',
      data: user,
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar resetar a sua senha, tente novamente',
      data: err,
      success: false
    })
  }
})

module.exports = server => server.use('/auth', router)