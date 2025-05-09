const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/',(req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login');
})

module.exports = router;