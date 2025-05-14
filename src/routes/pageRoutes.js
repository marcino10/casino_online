const express = require('express');
const router = express.Router();
const [auth, redirectIfAuth] = require('../middlewares/authMiddleware');

router.get('/',(req, res) => {
    res.render('index');
});

router.get('/login', redirectIfAuth,(req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    res.redirect('/auth/logout');
})

router.get('/dashboard', auth, (req, res) => {
    res.render('dashboard')
});

module.exports = router;