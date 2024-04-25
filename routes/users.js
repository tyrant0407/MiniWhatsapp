const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://0.0.0.0/miniwhatsapp')

const userSChema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  profileImage: {
    type: String,
    default: '/images/def.jpg'
  },
  socketId: String,
  friends: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  } ]
})

userSChema.plugin(plm)

module.exports = mongoose.model('user', userSChema)