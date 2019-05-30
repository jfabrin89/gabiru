const mongoose = require('../../config/db.config')

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Team = mongoose.model('Team', TeamSchema)
module.exports = Team