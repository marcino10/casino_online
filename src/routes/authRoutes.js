const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const [auth] = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/change/password', auth, authController.changePassword);

module.exports = router;