const PokerTable = require('../models/PokerTable');
const PlayerPokerState = require('../models/PlayerPokerState');
const User = require('../models/User');
const PlayerState = require("../models/PlayerPokerState");

async function up() {
    const user = await User.findOne({ nick: "test" });

    const table = await PokerTable.create({
        tableName: "Test table",
        tableId: "aaaaaaaa",
        buyIn: 50,
        maxNumOfPlayers: 10,
        host: user._id,
        players: [user._id]
    });

    await PlayerState.create({
        tableId: table._id,
        playerId: user._id,
        seat: 1,
        creditsLeft: 50
    });

    console.log('✅ Poker table migration completed');
}

async function down() {
    await PokerTable.deleteMany({});
    await PlayerPokerState.deleteMany({});
    console.log('✅ Poker table migration rolled back');
}

module.exports = { up, down };