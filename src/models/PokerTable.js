const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pokerTableSchema = new Schema({
    tableName: {
        type: String,
        required: true,
        trim: true
    },
    tableId: {
        type: String,
        required: true
    },
    buyIn: {
        type: Number,
        required: true
    },
    maxNumOfPlayers: {
        type: Number,
        required: true,
        min: 2,
        max: 10
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isStarted: {
        type: Boolean,
        default: false
    },
    pot: {
        type: Number,
        default: 0
    },
    currentBet: {
        type: Number,
        default: 0
    },
    currentRound: {
        type: Number,
        default: 0
    },
    boardDeck: [{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }],
    allHandsJson: {
        type: {},
        default: {}
    },
    lastActionSeat: {
        type: Number
    },
    numOfSeatsInCurrentGame: {
        type: Number
    }
});

pokerTableSchema.path('players').validate(function (players) {
    return players.length <= this.maxNumOfPlayers;
}, 'Number of players cannot exceed maxNumOfPlayers');

module.exports = mongoose.model('PokerTable', pokerTableSchema);