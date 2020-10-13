const fs = require('fs')

const Sauce = require('../models/Sauce')

/* -- affiche toutes les sauces -- */
exports.getAllThings = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }))
}

/* -- affiche une sauce -- */
exports.getOneThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }))
}

/* -- crée une sauce -- */
exports.createThing = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce)
  delete sauceObject._id
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce créée !' }))
    .catch(error => res.status(400).json({ error }))
}

/* -- modifie une sauce et l'image si nécessaire-- */
exports.modifyThing = (req, res, next) => {
  const sauceObject = req.file
    ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, $set: { likes: 0, dislikes: 0, usersLiked: [], usersDisliked: [] }, _id: req.params.id })
    .then(() => res.status(200).json({ message: ' Sauce modifiée' }))
    .catch(error => res.status(400).json({ error }))
}

/* -- supprime une sauce et son image du dossier images -- */
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

/* -- permet de liker ou disliker une sauce -- */
exports.likeThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      switch (req.body.like) {
        case 1:
          if (!sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: 'Like ajouté :)' }))
              .catch(error => res.status(400).json({ error }))
          }
          break
        case -1:
          if (!sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: 'Dislike ajouté :/' }))
              .catch(error => res.status(400).json({ error }))
          }
          break
        case 0:
          if (sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 }, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: 'Like retiré :/' }))
              .catch(error => res.status(400).json({ error }))
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 }, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: 'Dislike retiré :)' }))
              .catch(error => res.status(400).json({ error }))
          }
      }
    })
    .catch(error => res.status(500).json({ error }))
}
