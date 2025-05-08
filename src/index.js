require('dotenv').config({ path: '.env' });
const MONGO_URL = process.env.MONGO_URL;

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const routes = require('./routes/app')
const userRoutes = require('./routes/user')
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

mongoose.connect(MONGO_URL)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);
app.use('/user', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const response = {
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace in development
    };

    res.status(statusCode).json(response);
});

io.on('connection', socket => {
    console.log('User connected');
    socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});