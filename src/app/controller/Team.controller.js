const express = require('express')
const authMiddlewate = require('../middleware/auth')

const router = express.Router()

const Team = require('../models/team.model')
const campeonatoBrasileiro = require('campeonato-brasileiro')

router.use(authMiddlewate)

router.post('/', async (req, res) => {
  const { name } = req.body
  try {
    if (await Team.findOne({ name })) {
      return res.status(400).send({
        message: 'Tima com o mesmo nome já cadastrado!',
        data: [],
        success: false
      })
    }

    const team = await Team.create(req.body)

    return res.status(200).send({
      message: 'Time cadastrado com sucesso!',
      data: team,
      success: true
    })
  } catch (err) {
    console.log(err)
    return res.status(400).send({
      message: 'Erro ao cadastrar time!',
      data: err,
      success: false
    })
  }
})

router.post('/import', async (req, res) => {
  const { division, year } = req.body
  const listTeams = await campeonatoBrasileiro.jogos(parseInt(year), division.toLowerCase()).then(results => {
    var teamRound1 = results.filter(val => parseInt(val.rodada) === 1)
    var list = []
    teamRound1.forEach(element => {
      list.push(element.visitante)
      list.push(element.mandante)
    })
    return list
  }, function (err) {
    return err
  })

  try {
    if (!listTeams) {
      return res.status(400).send({
        message: 'Erro ao buscar lista de times!',
        data: [],
        success: false
      })
    }

    await listTeams.forEach(element => {
      Team.create({name: element})
    })

    return res.status(200).send({
      message: 'Times importados com sucesso!',
      data: team,
      success: true
    })
  } catch (err) {
    return res.status(400).send({
      message: 'Erro ao cadastrar time!',
      data: err,
      success: false
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const team = await Team.find()
    res.status(200).send({
      message: 'Times listados com sucesso!',
      data: team,
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar buscar times, tente novamente',
      data: err,
      success: false
    })
  }
})

router.get('/:teamId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
    res.status(200).send({
      message: 'Time listado com sucesso!',
      data: team,
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar buscar time, tente novamente',
      data: err,
      success: false
    })
  }
})

router.put('/:teamId', async (req, res) => {
  try {
    const { name } = req.body

    await Team.findByIdAndUpdate(req.params.teamId, { name })

    return res.status(200).send({
      message: 'Time alterado com sucesso!',
      data: [],
      success: true
    })
  } catch (err) {
    return res.status(400).send({
      message: 'Erro ao alterar time!',
      data: err,
      success: false
    })
  }
})

router.delete('/:teamId', async (req, res) => {
  try {
    await Team.findByIdAndRemove(req.params.teamId)
    res.status(200).send({
      message: 'Time removido com sucesso!',
      data: [],
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar remover time, tente novamente',
      data: err,
      success: false
    })
  }
})

module.exports = app => app.use('/team', router)