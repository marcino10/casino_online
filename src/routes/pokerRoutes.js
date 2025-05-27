const express = require('express');
const router = express.Router();
const [auth, redirectIfAuth, authInfo] = require('../middlewares/authMiddleware');
const pokerController = require('../controllers/pokerController');

router.get('/', auth, authInfo, (req, res) => {
    if (!req.data) {
        return res.render('pokerLobby', {
            isAuth: false
        });
    }

    res.render('pokerLobby', req.data);
});

router.get('/join/:id', auth, pokerController.join);

router.get('/game/:id', auth, pokerController.show);

router.post('/game/create', auth, pokerController.create);

router.get('/leave/:id', auth, pokerController.leave);

module.exports = router;