const express = require('express')
const router = express.Router()
const loginController = require('../app/controllers/loginController')

router.get('/', loginController.index)
router.post('/', loginController.store)

module.exports = router