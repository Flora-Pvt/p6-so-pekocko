const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')

const saucesRoutes = require('./routes/sauces')
const userRoutes = require('./routes/user')

const app = express()

/* -- connection à MongoDB -- */
mongoose.connect('mongodb+srv://moi:moi@cluster0.ri2gw.mongodb.net/test?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'))

/* -- configure les en-têtes des requêtes -- */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  next()
})

/* -- extrait les données reçues du frontend -- */
app.use(bodyParser.json())

/* -- configure le chemin des routes -- */
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/api/sauces', saucesRoutes)
app.use('/api/auth', userRoutes)

module.exports = app
