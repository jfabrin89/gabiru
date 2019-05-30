const mongoose = require('../../config/db.config')

const LotterySchema = new mongoose.Schema({
  round: {
    type: Number,
    require: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Lottery = mongoose.model('Lottery', LotterySchema)
module.exports = Lottery