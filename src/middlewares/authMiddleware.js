require('dotenv').config({ path: '.env' });
const JWT_SECRET = process.env.JWT_SECRET;

const jwt = require('jsonwebtoken');
const {setFlash} = require("../helpers");

const isValidToken = token => {
    if(!token) {
        return false;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        return decoded;
    } catch (error) {
        return false;
    }
}

const auth = (req, res, next) => {
    const token = req.cookies.token;

    const decoded = isValidToken(token);
    if (decoded === false) {
        setFlash(req, 'error_msg', 'You have to log in')
        return res.redirect('/login');
    } else {
        req.user = decoded;
        next();
    }
}

const redirectIfAuth = (req, res, next) => {
    const token = req.cookies.token;
    
    if (isValidToken(token) !== false) {
        return res.redirect('/');
    } else {
        next();
    }
}

module.exports = [auth, redirectIfAuth];