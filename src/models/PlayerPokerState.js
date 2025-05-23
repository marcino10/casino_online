const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerPokerStateSchema = new Schema({
    tableId: {
        type: Schema.Types.ObjectId,
        ref: 'PokerTable',
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
    lastBet: {
        type: Number,
        default: 0
    },
    creditsLeft: {
        type: Number,
        require: true
    },
    isFolded: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('PlayerPokerState', playerPokerStateSchema);