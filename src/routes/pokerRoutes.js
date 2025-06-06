const express = require('express');
const router = express.Router();
const [auth] = require('../middlewares/authMiddleware');
const pokerController = require('../controllers/pokerController');

router.get('/join/:id', auth, pokerController.join);

router.get('/game/:id', auth, pokerController.show);

router.post('/create', auth, pokerController.create);

module.exports = router;