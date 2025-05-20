require('dotenv').config({ path: '.env' });

const {setFlash} = require("../helpers");
const User = require("../models/User");

const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const isValidNick = nick => {
    const nickRegex = /^(?!.*@.*\..*)[a-zA-Z0-9_#@=+!-]{3,16}$/;

    if (!nickRegex.test(nick)) {
        return false;
    }

    return true;
}

const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return false;
    }

    return true;
}

const isValidPassword = password => {
    const hasNumberRegex = /\d/

    if (password.length < 5 || !hasNumberRegex.test(password)) {
        return false
    }

    return true;
}

const authenticateUser = async (user, req, res) => {
    try {
        const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        return res.redirect('/');
    } catch (error) {
        setFlash(req, 'error_msg', 'Server error, try again later');
        return res.redirect('/login');
    }
};

exports.register = asyncHandler(async (req, res, next) => {
    const {nick, email, password} = req.body;
    if (!nick || !email || !password) {
        setFlash(req, 'error_msg', 'All fields are required');
        return res.redirect('/login');
    }

    if (!isValidNick(nick)) {
        setFlash(req, 'error_msg', 'The username must be between 3-16 characters and can only contains alphanumerical characters or one of the following: _, #, @, =, +, !, -');
        return res.redirect('/login')
    }

    const nickExists = await User.findOne({nick});
    if (nickExists) {
        setFlash(req, 'error_msg', 'Username already exists');
        return res.redirect('/login')
    }

    if (!isValidEmail(email)) {
        setFlash(req, 'error_msg', 'Enter a valid email');
        return res.redirect('/login')
    }

    const emailExists = await User.findOne({email})
    if (emailExists) {
        setFlash(req, 'error_msg', 'There is already account with this email');
        return res.redirect('/login')
    }

    if(!isValidPassword(password)) {
        setFlash(req, 'error_msg', 'Password must contain at least 5 characters and 1 number');
        return res.redirect('/login')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        nick,
        email,
        password: hashedPassword
    })

    await authenticateUser(user, req, res);
});

exports.login = asyncHandler(async (req, res, next) => {
    const {login, password} = req.body;
    if (!login || !password) {
        setFlash(req, 'error_msg', 'All fields are required');
        return res.redirect('/login');
    }

    let user;
    if (isValidNick(login)) {
        user = await User.findOne({nick: login});
    } else {
        user = await User.findOne({email: login});
    }

    if (!user) {
        setFlash(req, 'error_msg', 'Invalid credentials');
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        setFlash(req, 'error_msg', 'Invalid credentials');
        return res.redirect('/login');
    }

    await authenticateUser(user, req, res);
});

exports.logout = asyncHandler(async (req, res, next) => {
    res.clearCookie('token');
    setFlash(req, 'success_msg', 'Logged out');
    return res.redirect('/login');
});