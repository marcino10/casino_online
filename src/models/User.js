const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    nick: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    credits: {
        type: Number,
        default: 1000
    },
    avatarFile: {
        type: String,
        default: null,
        match: /\.(png|jpg|jpeg|webp)$/i
    }
})

module.exports = mongoose.model('User', userSchema);