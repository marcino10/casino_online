const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcrypt');

exports.create = asyncHandler(async (req, res) => {
    const {nick, email, password} = req.body;
    if (!nick || !email || !password) {
        res.status(400);
        throw new Error("all fields are required");
    }

    const nickExists = await User.findOne({nick});
    if (nickExists) {
        res.status(400);
        throw new Error("Username already exists");
    }

    const emailExists = await User.findOne({email})
    if (emailExists) {
        res.status(400);
        throw new Error("There is already account with this email");
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        nick,
        email,
        password: hashedPassword
    })

    res.status(201).json({
        message: 'User created'
    });
})