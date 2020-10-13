const fs = require('fs')

const Sauce = require('../models/Sauce')

exports.createThing = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce)
  delete sauceObject._id
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée' }))
    .catch(error => res.status(400).json({ error }))
}

exports.getOneThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }))
}

exports.modifyThing = (req, res, next) => {
  const sauceObject = req.file
    ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: ' Sauce modifiée' }))
    .catch(error => res.status(400).json({ error }))
}

exports.deleteThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée' }))
          .catch(error => res.status(400).json({ error }))
      })
    })
    .catch(error => res.status(500).json({ error }))
}

exports.getAllThings = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }))
}

exports.likeThing = (req, res, next) => {
  // Un tableau qui retournent les utilisateurs qui ont aimé la sauce. [...userId, userId]
  // On veut le nombre d'utilisateurs qui aiment la sauce. usersLiked.length
  // controller avec des conditions si 1 (like), 0 (neutre) ou -1 (dislike)
  // switch
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (!sauce.usersLiked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Aime ajouté' }))
          .catch(error => res.status(400).json({ error }))
      } else if (!sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Aime pas ajouté' }))
          .catch(error => res.status(400).json({ error }))
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { $set: { dislikes: 0, likes: 0 }, $pull: { usersDisliked: req.body.userId, usersLiked: req.body.userId }, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Note retirée' }))
          .catch(error => res.status(400).json({ error }))
      }
    })
    .catch(error => res.status(500).json({ error }))
}
