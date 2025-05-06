const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (_, res) => {
    res.send('Hello from Node.js + Socket.IO!');
});

io.on('connection', socket => {
    console.log('User connected');
    socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
