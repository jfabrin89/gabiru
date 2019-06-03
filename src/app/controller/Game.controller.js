const express = require('express')
const router = express.Router()

const Game = require('../models/game.model')
const Team = require('../models/team.model')

const campeonatoBrasileiro = require('campeonato-brasileiro')

router.post('/import', async (req, res) => {
  const { round, division, year } = req.body
  try {
    await campeonatoBrasileiro.jogos(parseInt(year), division.toLowerCase()).then(results => {
      const lastRegister = results.length - 1
      const lastRound = results[lastRegister].rodada

      for (var game = round; game <= parseInt(lastRound); game++) {
        var gamesRound = results.filter(val => parseInt(val.rodada) === parseInt(game))
        gamesRound.forEach(async val =>{
          var principal = await Team.find({ 'name': val.mandante })
          var visitor = await Team.find({ 'name': val.visitante })

          if (principal.length === 1 && visitor.length === 1) {
            await Game.create({
              visitor: visitor[0],
              principal: principal[0],
              result_visitor: val.visitantePlacar,
              result_principal: val.mandantePlacar,
              round: val.rodada,
              postponed: false
            })
          }
        })
      }

      return res.status(200).send({
        message: `Rodada ${round} cadastrada com sucesso!`,
        data: game,
        success: true
      })
    })
  } catch (err) {
    return res.status(400).send({
      message: 'Erro ao cadastrar rodada!',
      data: err,
      success: false
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const game = await Game.find().populate('visitor').populate('principal')
    res.status(200).send({
      message: 'Jogos listados com sucesso!',
      data: game,
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar buscar Jogos, tente novamente',
      data: err,
      success: false
    })
  }
})

router.get('/:round', async (req, res) => {
  try {
    const game = await Game.find({ round: req.params.round }).populate('team').populate('team')
    res.status(200).send({
      message: `Rodada ${req.params.round} listada com sucesso!`,
      data: game,
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar buscar rodada, tente novamente',
      data: err,
      success: false
    })
  }
})

router.delete('/:round', async (req, res) => {
  try {
    await Lottery.deleteMany({ round: req.params.round })
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

module.exports = server => server.use('/game', router)