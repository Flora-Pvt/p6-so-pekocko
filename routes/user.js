const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/user')

/* -- available routes to create an account and login -- */
router.post('/signup', userCtrl.signup)
router.post('/login', userCtrl.login)

module.exports = router
