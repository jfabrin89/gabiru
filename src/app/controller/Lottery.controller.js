const express = require('express')

const mailer = require('../../modules/mailer')

const Lottery = require('../models/lottery.model')
const User = require('../models/user.model')
const Team = require('../models/team.model')
const router = express.Router()

async function lotteryList (lottery, users, rounds) {
  var listLottery = []
  for (var counter = 0; counter < users.length; counter++) {
    var itemSort = {}
    var user = users[counter]
    var listTeam = await Team.find()
    listTeam.map(element => element._id)

    console.log('---------------------------------------')
    console.log(user.name)

    if (rounds > 1) {
      var round = rounds - 1
      var teamPrev = lottery.filter(element => (element.round === round))
      console.log(teamPrev.user)
      var positionPrev = listTeam.indexOf(`${teamPrev.id}`)
      listTeam.splice(positionPrev, 1)
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

    console.log(teamSort.name)
    itemSort.user = user
    itemSort.team = teamSort
    itemSort.round = rounds

    listLottery.push(itemSort)
  }

  return listLottery
}

router.post('/', async (req, res) => {
  const { round } = req.body
  try {
    const user = await User.find()
    const lottery = await Lottery.find()
    var itemLottery = []
    const list = await lotteryList(lottery, user, round)
    list.forEach(element => {
      /* console.log('----------------------------------------------------------')
      console.log(element)*/
      const create = Lottery.create(element)
      itemLottery.push(create)
    })

    return res.status(200).send({
      message: `Rodada ${round} cadastrada com sucesso!`,
      data: itemLottery,
      success: true
    })
  } catch (err) {
    console.log(err)
    return res.status(400).send({
      message: 'Erro ao cadastrar rodada!',
      data: err,
      success: false
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const lottery = await Lottery.find()
    res.status(200).send({
      message: 'Usuários listados com sucesso!',
      data: lottery,
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

router.get('/:lotteryId', async (req, res) => {
  try {
    const lottery = await Lottery.findById(req.params.lotteryId)
    res.status(200).send({
      message: 'Usuário listado com sucesso!',
      data: lottery,
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

router.put('/:lotteryId', async (req, res) => {
  try {
    const { name, email } = req.body

    await Lottery.findByIdAndUpdate(req.params.lotteryId, {
      name,
      email
    })

    return res.status(200).send({
      message: 'Usuário alterado com sucesso!',
      data: [],
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

router.delete('/:lotteryId', async (req, res) => {
  try {
    await Lottery.findByIdAndRemove(req.params.lotteryId)
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