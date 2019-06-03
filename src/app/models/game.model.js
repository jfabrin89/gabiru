const mongoose = require('../../config/db.config')

const GameSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    require: true,
  },
  principal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    require: true,
  },
  result_visitor: {
    type: Number,
    require: false
  },
  result_principal: {
    type: Number,
    require: false
  },
  round: {
    type: Number,
    require: true
  },
  postponed: {
    type: Boolean,
    require: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Game = mongoose.model('Game', GameSchema)
module.exports = Game