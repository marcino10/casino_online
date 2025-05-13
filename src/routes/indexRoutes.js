const express = require('express');
const router = express.Router();
const [auth, redirectIfAuth] = require('../middlewares/authMiddleware');

router.get('/',(req, res) => {
    res.render('index');
});

router.get('/login', redirectIfAuth,(req, res) => {
    res.render('login');
})

router.get('/register', redirectIfAuth, (req, res) => {
    res.render('register')
})

module.exports = router;