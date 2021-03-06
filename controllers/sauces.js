const fs = require('fs')
const sharp = require('sharp')

const Sauce = require('../models/Sauce')

/* -- dispaly sauces -- */
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(404).json({ error }))
}

/* -- display a sauce -- */
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }))
}

/* -- create a sauce and resize uploaded image -- */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce)
  delete sauceObject._id
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })
  sauce.save()
    .then(() => {
      sharp(req.file.path)
        .resize(480, 480)
        .toBuffer()
        .then(data => {
          fs.writeFileSync(req.file.path, data)
          res.status(201).json({ message: 'Sauce created !' })
        })
        .catch(error => res.status(500).json({ error }))
    })
    .catch(error => res.status(400).json({ error }))
}

/* -- modify a sauce (and the image if necessary) -- */
exports.modifySauce = (req, res, next) => {
  if (req.file) {
    const sauceObject = JSON.parse(req.body.sauce)
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1]
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, $set: { imageUrl: imageUrl, likes: 0, dislikes: 0, usersLiked: [], usersDisliked: [] }, _id: req.params.id })
            .then(() => {
              sharp(req.file.path)
                .resize(480, 480)
                .toBuffer()
                .then(data => {
                  fs.writeFileSync(req.file.path, data)
                  res.status(201).json({ message: 'Sauce modified !' })
                })
                .catch(error => res.status(500).json({ error }))
            })
            .catch(error => res.status(400).json({ error }))
        })
      })
      .catch(error => res.status(500).json({ error }))
  } else {
    Sauce.updateOne({ _id: req.params.id }, { ...req.body, $set: { likes: 0, dislikes: 0, usersLiked: [], usersDisliked: [] }, _id: req.params.id })
      .then(() => res.status(201).json({ message: 'Sauce modified !' }))
      .catch(error => res.status(400).json({ error }))
  }
}

/* -- delete a sauce and the image in the folder images -- */
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce deleted' }))
          .catch(error => res.status(400).json({ error }))
      })
    })
    .catch(error => res.status(500).json({ error }))
}

/* -- allow to like ou dislike a sauce -- */
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      switch (req.body.like) {
        /* -- if user clicks on like -- */
        case 1:
          if (!sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }, _id: req.params.id }
            )
              .then(() => res.status(201).json({ message: 'Like added' }))
              .catch(error => res.status(400).json({ error }))
          }
          break
        /* -- if user clicks on dislike -- */
        case -1:
          if (!sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }, _id: req.params.id }
            )
              .then(() => res.status(201).json({ message: 'Dislike added' }))
              .catch(error => res.status(400).json({ error }))
          }
          break
        /* -- if user clicks while he already liked or disliked -- */
        case 0:
          if (sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 }, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: 'Like removed' }))
              .catch(error => res.status(400).json({ error }))
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 }, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: 'Dislike removed' }))
              .catch(error => res.status(400).json({ error }))
          }
      }
    })
    .catch(error => res.status(500).json({ error }))
}
