require('dotenv').config({ path: '.env' });
const MONGO_URL = process.env.MONGO_URL;

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const crypto = require('crypto');

const app = express();
const routes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const pokerRoutes = require('./api/poker/routes/pokerRoutes');
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

mongoose.connect(MONGO_URL)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/pages'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionSecret = crypto.randomBytes(32).toString('hex');
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}));

app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/api/poker', pokerRoutes);

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

server.listen(port,() => {
    console.log(`Server running on http://localhost:${port}`);
});