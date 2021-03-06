const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/user')

const limiter = require('../middleware/rate-limiter')

/* -- available routes to create an account and login -- */
router.post('/signup', limiter, userCtrl.signup)
router.post('/login', limiter, userCtrl.login)

module.exports = router
