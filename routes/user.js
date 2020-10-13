const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/user')

/* -- routes disponibles pour créer un compte et se connecter -- */
router.post('/signup', userCtrl.signup)
router.post('/login', userCtrl.login)

module.exports = router
