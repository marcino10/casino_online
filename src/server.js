require('dotenv').config({ path: '.env' });
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3000;

const express = require('express');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const crypto = require('crypto');
const exphbs = require('express-handlebars');

const routes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const pokerRoutes = require('./routes/pokerRoutes');
const pokerApiRoutes = require('./api/poker/routes/pokerApiRoutes');


const app = express();
const expressServer = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

const io = new socketIo.Server(expressServer);

// console log for development
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

mongoose.connect(MONGO_URL)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));


// Set up handlebars
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: false,
    partialsDir: path.join(__dirname, 'views', 'partials')
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views', 'pages'));
app.use(express.static(path.join(__dirname, 'public')));

// session configuration
const sessionSecret = crypto.randomBytes(32).toString('hex');
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}));

// flash messages configuration
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

//
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set up routes
app.use('/', routes);
app.use('/poker', pokerRoutes);
app.use('/auth', authRoutes);
app.use('/api/poker', pokerApiRoutes);

// catch errors from express-async-handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const response = {
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace in development
    };

    res.status(statusCode).json(response);
});