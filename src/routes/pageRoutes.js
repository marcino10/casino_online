const express = require('express');
const router = express.Router();
const [auth, redirectIfAuth, authInfo] = require('../middlewares/authMiddleware');
const User = require('../models/User');

router.get('/', auth, authInfo, async (req, res) => {
    return res.render('index', {
        ...req.data,
        activePage: 'home'
    });
});

router.get('/login', redirectIfAuth,(req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    res.redirect('/auth/logout');
})

router.get('/dashboard', auth, authInfo, (req, res) => {
    if (!req.data) {
        return res.render('dashboard', {
            isAuth: false
        });
    }

    return res.render('dashboard', {
        ...req.data,
        activePage: 'dashboard'
    });
});

module.exports = router;