const mongoose = require('mongoose')

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, min: 1, max: 10, required: true },
  likes: 0,
  dislikes: 0,
  usersLiked: [String],
  usersDisliked: [String]
})

module.exports = mongoose.model('Sauce', sauceSchema)
