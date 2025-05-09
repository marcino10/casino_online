require('dotenv').config({ path: '.env' });

const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = asyncHandler(async (req, res, next) => {
    const {nick, email, password} = req.body;
    if (!nick || !email || !password) {
        req.flash('error_msg', 'All fields are required');
        res.redirect('/register');
    }

    const nickExists = await User.findOne({nick});
    if (nickExists) {
        req.flash('error_msg', 'Username already exists');
        res.redirect('/register')
    }

    const emailExists = await User.findOne({email})
    if (emailExists) {
        req.flash('error_msg', 'There is already account with this email');
        res.redirect('/register')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        nick,
        email,
        password: hashedPassword
    })

    req.flash('success_msg', 'Account created');
    res.redirect('/');
});

exports.login = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) {
        req.flash('error_msg', 'All fields are required');
        res.redirect('/login');
    }

    const user = await User.findOne({email});
    if (!user) {
        req.flash('error_msg', 'Invalid credentials');
        res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        req.flash('error_msg', 'Invalid credentials');
        res.redirect('/login');
    }

    try {
        const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })

        res.redirect('/');
    } catch (error) {
        req.flash('error_msg', 'Server error, try again later');
        res.redirect('/login');
    }
});

exports.logout = asyncHandler(async (req, res, next) => {
    res.clearCookie('token');
    req.flash('success_msg', 'Logged out');
    res.redirect('/login');
});