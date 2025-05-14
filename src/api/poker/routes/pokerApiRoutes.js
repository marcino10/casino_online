const express = require('express');
const router = express.Router();
const drawController = require('../controllers/drawController');

router.post('/draw/players', drawController.players);
router.post('/draw/board', drawController.board)

module.exports = router;