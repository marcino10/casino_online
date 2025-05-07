const express = require('express');
const mongoose = require('mongoose');

const app = express();
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    suit: {
        type: String,
        required: true,
        enum: ['heart', 'diamond', 'club', 'spade'],
    },
    value: {
        type: Number,
        required: true,
        min: 2,
        max: 14
    },
    imageFile: {
        type: String,
        required: true,
        match: /\.(png|jpg|jpeg)$/i
    },
})

module.exports = mongoose.model('Card', cardSchema);