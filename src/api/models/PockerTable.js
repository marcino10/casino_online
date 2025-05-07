const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pockerTableSchema = new Schema({
    tableName: {
        type: String,
        required: true,
        trim: true
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    pot: {
        type: Number,
        default: 0
    },
    currentBet: {
        type: Number,
        default: 0
    },
    gameState: {
        type: String,
        enum: ['waiting', 'dealing', 'betting', 'showdown'],
        default: 'waiting'
    },
    currentRound: {
        type: Number,
        default: 0
    },
    isActive : {
        type: Boolean,
        default: true
    },
    boardDeck: [{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }],
    seat: {
        type: Number
    }
});

module.exports = mongoose.model('PockerTable', pockerTableSchema);