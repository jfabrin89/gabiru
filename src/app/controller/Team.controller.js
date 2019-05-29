const express = require('express')
const authMiddlewate = require('../middleware/auth')

const router = express.Router()

router.use(authMiddlewate)

router.get('/', (req, res) => {
  res.status(200).send({ ok: true })
})

module.exports = app => app.use('/team', router)