const express = require('express');
const router = express.Router();
const userController = require('../api/controllers/userController');

router.get('/', userController.getUsers);
router.post('/create', userController.create)

module.exports = router;