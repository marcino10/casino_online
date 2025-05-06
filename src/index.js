require('dotenv').config({ path: '.env' });
const MONGO_URL = process.env.MONGO_URL;

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

mongoose.connect(MONGO_URL)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/', (_, res) => {
    res.status(200).send('Hello from Node.js + MongoDB + Socket.IO!');
});

io.on('connection', socket => {
    console.log('User connected');
    socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});