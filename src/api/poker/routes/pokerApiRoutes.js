const express = require('express');
const router = express.Router();
const drawController = require('../controllers/drawController');
const positionController = require('../controllers/positionController');

router.post('/draw/players', drawController.players);
router.post('/draw/board', drawController.board);
router.post('/positions', positionController.getPositions);

module.exports = router;