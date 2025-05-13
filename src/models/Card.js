const express = require('express');
const mongoose = require('mongoose');

const app = express();
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    humanName: {
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
        type: String,
        required: true,
        enum: [
            '2', '3', '4', '5', '6', '7', '8', '9', '10',
            'j', 'q', 'k', 'a'
        ],
    },
    name: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('Card', cardSchema);