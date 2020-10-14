const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const saucesCtrl = require('../controllers/sauces')

/* -- availables routes for sauces, with authentication -- */
router.get('/', auth, saucesCtrl.getAllThings)
router.get('/:id', auth, saucesCtrl.getOneThing)
router.post('/', auth, multer, saucesCtrl.createThing)
router.put('/:id', auth, multer, saucesCtrl.modifyThing)
router.delete('/:id', auth, saucesCtrl.deleteThing)

router.post('/:id/like', auth, saucesCtrl.likeThing)

module.exports = router
