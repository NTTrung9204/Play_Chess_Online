const express = require('express')
const router = express.Router()
const testController = require('../app/controllers/homePageController')

router.get('/', testController.index)

module.exports = router