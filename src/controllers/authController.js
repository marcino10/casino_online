require('dotenv').config({ path: '.env' });

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

exports.register = asyncHandler(async (req, res, next) => {
    const {nick, email, password} = req.body;
    if (!nick || !email || !password) {
        req.flash('error_msg', 'All fields are required');
        return res.redirect('/login');
    }

    if (!isValidNick(nick)) {
        req.flash('error_msg', 'The username must be between 3-16 characters and can only contains alphanumerical characters or one of the following: _, #, @, =, +, !, -');
        return res.redirect('/login')
    }

    const nickExists = await User.findOne({nick});
    if (nickExists) {
        req.flash('error_msg', 'Username already exists');
        return res.redirect('/login')
    }

    if (!isValidEmail(email)) {
        req.flash('error_msg', 'Enter a valid email');
        return res.redirect('/login')
    }

    const emailExists = await User.findOne({email})
    if (emailExists) {
        req.flash('error_msg', 'There is already account with this email');
        return res.redirect('/login')
    }

    if(!isValidPassword(password)) {
        req.flash('error_msg', 'Password must contain at least 5 characters and 1 number');
        return res.redirect('/login')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        nick,
        email,
        password: hashedPassword
    })

    req.flash('success_msg', 'Account created');
    return res.redirect('/');
});

exports.login = asyncHandler(async (req, res, next) => {
    const {login, password} = req.body;
    if (!login || !password) {
        req.flash('error_msg', 'All fields are required');
        return res.redirect('/login');
    }

    let user;
    if (isValidNick(login)) {
        user = await User.findOne({nick: login});
    } else {
        user = await User.findOne({email: login});
    }

    if (!user) {
        req.flash('error_msg', 'Invalid credentials');
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        req.flash('error_msg', 'Invalid credentials');
        return res.redirect('/login');
    }

    try {
        const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })

        return res.redirect('/');
    } catch (error) {
        req.flash('error_msg', 'Server error, try again later');
        return res.redirect('/login');
    }
});

exports.logout = asyncHandler(async (req, res, next) => {
    res.clearCookie('token');
    req.flash('success_msg', 'Logged out');
    return res.redirect('/login');
});