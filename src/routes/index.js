const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send('Hello from Node.js + MongoDB + Socket.IO!!')}
);

module.exports = router;