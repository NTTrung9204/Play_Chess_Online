const express = require('express')
const router = express.Router()
const normalMatchController = require('../app/controllers/normalMatchController')

router.get('/', normalMatchController.index)
router.get('/createRoom', normalMatchController.create_room)
router.get('/:id_room', normalMatchController.join_room)

module.exports = router