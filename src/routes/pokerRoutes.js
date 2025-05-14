const express = require('express');
const router = express.Router();
const [auth, redirectIfAuth] = require('../middlewares/authMiddleware');

router.get('/', (req, res) => {
    res.render('pokerLobby');
});

router.get('/game', (req, res) => {
   res.render('pokerGame');
});

module.exports = router;