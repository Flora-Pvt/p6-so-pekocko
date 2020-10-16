const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const User = require('../models/User')

/* -- allow user to signup -- */
exports.signup = (req, res, next) => {
  /* -- validate email and length of password -- */
  req.body.password = validator.escape(req.body.password)
  req.body.password = validator.blacklist(req.body.password, '\\[\\]')
  if (validator.isEmail(req.body.email) === true && validator.isLength(req.body.password, 8, 50)) {
    /* -- password "salted" 10 times -- */
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        })
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }))
      })
      .catch(error => res.status(500).json({ error }))
  } else {
    res.status(400).json('Unvalid email or your password has to be 8 length')
  }
}

/* -- allow user to login -- */
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' })
      }
      /* -- compare password with hash -- */
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' })
          }
          /* -- create a token -- */
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          })
        })
        .catch(error => res.status(500).json({ error }))
    })
    .catch(error => res.status(500).json({ error }))
}
