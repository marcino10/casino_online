require('dotenv').config({ path: '.env' });
const JWT_SECRET = process.env.JWT_SECRET;

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        req.flash('error_msg', 'You have to log in')
        res.redirect('/login');
    }

    try {
        const decode = jwt.verify(token, JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        req.flash('error_msg', 'You have to log in')
        res.redirect('/login');
    }
}

module.exports = auth;