const express = require('express');
const router = express.Router();
const [auth, redirectIfAuth] = require('../middlewares/authMiddleware');
const pokerController = require('../controllers/pokerController');

router.get('/', (req, res) => {
    res.render('pokerLobby');
});

router.get('/join/:id', auth, pokerController.join);

router.get('/game/:id', auth, pokerController.show);

router.post('/game/create', auth, pokerController.create);

router.get('/leave/:id', auth, pokerController.leave);

module.exports = router;