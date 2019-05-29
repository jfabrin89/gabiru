const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://gabiru:chupaR10@gabiru-gcpyt.gcp.mongodb.net/test?retryWrites=true')
mongoose.Promise = global.Promise

module.exports = mongoose