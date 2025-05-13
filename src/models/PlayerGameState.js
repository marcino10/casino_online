const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerGameStateSchema = new Schema({
    tableId: {
        type: Schema.Types.ObjectId,
        ref: 'PockerTable',
        required: true
    },
    playerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seat: {
        type: Number
    },
    hand: [{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }],
    allBet: {
        type: Number,
        default: 0
    },
    lastBet: {
        type: Number,
        default: 0
    },
    isFolded: {
        type: Boolean,
        default: false
    }
})