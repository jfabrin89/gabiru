const express = require('express')

const mailer = require('../../modules/mailer')

const Lottery = require('../models/lottery.model')
const User = require('../models/user.model')
const Team = require('../models/team.model')
const router = express.Router()

async function lotteryList (user, rounds) {
  var listLottery = []
  for (var counter = 0; counter < user.length; counter++) {
    var itemSort = {}
    var listTeam = await Team.find()

    if (rounds > 1) {
      const roundPrevious = rounds - 1
      var teamPrev = await Lottery.find({ 'round': roundPrevious, 'user': user[counter] }).populate('user').populate('team')
      var list = listTeam
      listTeam = []
      list.forEach(element => {
        if (element.id !== teamPrev[0].team.id) {
          listTeam.push(element)
        }
      })
    }
    do {
      var teamSort = undefined
      var sort = listTeam[Math.floor(Math.random() * listTeam.length)]
      if (listLottery.length > 0) {
        const sortLimit = listLottery.filter(element => element.team.id === sort.id)
        if (sortLimit.length === 0) {
          teamSort = sort
        }
      } else {
        teamSort = sort
      }
    }
    while (teamSort === undefined)

    itemSort.user = user[counter]
    itemSort.team = teamSort

    listLottery.push(itemSort)
  }

  return listLottery
}

router.post('/', async (req, res) => {
  const { round } = req.body
  try {
    // Valida se existe a rodada anterior...
    // Caso não exista, ele não permite sortear a atual rodada
    if (round > 1) {
      const roundPrevious = round - 1
      const lotteryPrevious = await Lottery.find({ 'round': roundPrevious})
      if (lotteryPrevious.length === 0){
        return res.status(400).send({
          message: `Você não sorteou a rodada anterior (${roundPrevious})!`,
          data: [],
          success: false
        })
      }
    }

    const user = await User.find()
    var itemLottery = []
    const list = await lotteryList(user, round)
    list.forEach(element => {
      const create = Lottery.create({ ...req.body, user: element.user, team: element.team})
      itemLottery.push(create)
    })

    return res.status(200).send({
      message: `Rodada ${round} cadastrada com sucesso!`,
      data: itemLottery,
      success: true
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
    const lottery = await Lottery.find().populate('user').populate('team')
    res.status(200).send({
      message: 'Sorteio listados com sucesso!',
      data: lottery,
      success: true
    })
  } catch (err) {
    res.status(400).send({
      message: 'Erro ao tentar buscar Sorteio, tente novamente',
      data: err,
      success: false
    })
  }
})

router.get('/:round', async (req, res) => {
  try {
    const lottery = await Lottery.find({ round: req.params.round }).populate('user').populate('team')
    res.status(200).send({
      message: `Rodada ${req.params.round} listada com sucesso!`,
      data: lottery,
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

module.exports = server => server.use('/lottery', router)