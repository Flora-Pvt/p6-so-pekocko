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
  if (Sauce.find({ usersLiked: { $in: [...req.body.userId] } })) {
    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: { $in: [req.body.userId] }, $set: { likes: 0 } } })
      .then((sauce) => { res.status(200).json({ message: 'Pouce enlevé :(' }) })
      .catch(error => res.status(400).json({ error }))
  } else if (Sauce.find({ usersDisliked: { $in: [...req.body.userId] } })) {
    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: { $in: [req.body.userId] }, $set: { dislikes: 0 } } })
      .then(() => { res.status(200).json({ message: 'Dislike enlevé :)' }) })
      .catch(error => res.status(400).json({ error }))
  } else {
    if (req.body.like === 1) {
      Sauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: [req.body.userId] }, $set: { likes: 1 } })
        .then(() => { res.status(200).json({ message: 'Sauce aimée :)' }) })
        .catch(error => res.status(400).json({ error }))
    } else if (req.body.like === -1) {
      Sauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: [req.body.userId] }, $set: { dislikes: -1 } })
        .then((sauce) => { res.status(200).json({ message: 'Sauce dislikée :(' }) })
        .catch(error => res.status(400).json({ error }))
    }
  }
}
// message: 'Sauce aimée :)'
