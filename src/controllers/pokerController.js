const PokerTable = require('../models/PokerTable');
const User = require('../models/User');
const asyncHandler = require("express-async-handler");
const { customAlphabet } = require('nanoid');
const {setFlash} = require("../helpers");
const PlayerState = require("../models/PlayerPokerState");

const generateTableId = async () => {
    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 8);

    let tableId;
    let tableIdExists;

    do{
        tableId = nanoid();
        tableIdExists = await PokerTable.findOne({ tableId });
    } while (tableIdExists);

    return tableId;
};

const tableNameExists = async (tableName) => {
    const exists = await PokerTable.findOne({
        tableName,
        isActive: true
})

    return !!exists;
};

const validateBuyIn = (value) => {
    value = Number(value);

    if (value === NaN) return false;

    if (Number.isInteger(value) && value >= 50) {
        return true;
    }

    return false;
};

const validateMaxNumOfPlayers = (value) => {
    value = Number(value);

    if (value === NaN) return false;

    if (Number.isInteger(value) && value >= 2 && value <= 10) {
        return true;
    }

    return false;
}

const isUserInAnyActiveTable = async (userId) => {
    const table = await PokerTable.findOne({
        isActive: true,
        players: userId
    });

    return table !== null;
}

const isUserInTable = async (userId, tableId) => {
    const table = await PokerTable.findOne({
        players: userId,
        _id: tableId
    })

    return table !== null;
}

const changeSeats = async(table, playerState) => {
    await PlayerState.updateMany(
        {
            tableId: table._id,
            seat: {$gt: playerState.seat}
        },
        {
            $inc: { seat: -1 }
        }
    );
}

const createPlayerState = async (tableId, userId, numOfPlayers, buyIn) => {
    await PlayerState.create({
        tableId: tableId,
        playerId: userId,
        seat: numOfPlayers + 1,
        creditsLeft: buyIn
    });
};

const joinPlayerToGame = async (table, user, numOfPlayers = table.players.length) => {
    table.players.push(user._id);
    await table.save();

    user.credits -= table.buyIn;
    await user.save();

    await createPlayerState(table._id, user._id, numOfPlayers, table.buyIn);
}

exports.create = asyncHandler( async (req, res, next) => {
    const {tableName, buyIn, maxNumOfPlayers} = req.body;
    const userId = req.user.userId;
    const tableId = await generateTableId();

    if (await isUserInAnyActiveTable(userId)) {
        setFlash(req, 'error_msg', 'You are already in active poker game');
        return res.redirect('/poker');
    }

    if (!tableName || tableName.length === 0 || !buyIn || !maxNumOfPlayers) {
        setFlash(req, 'error_msg', 'Please fill all the fields');
        return res.redirect('/poker');
    }

    if (await tableNameExists(tableName)) {
        setFlash(req, 'error_msg', 'The game name already exists');
        return res.redirect('/poker');
    }

    if (!validateBuyIn(buyIn)) {
        setFlash(req, 'error_msg', 'The buy in value must be an integer >= 50');
        return res.redirect('/poker');
    }

    if (!validateMaxNumOfPlayers(maxNumOfPlayers)) {
        setFlash(req, 'error_msg', 'The number of players must be between 2 and 10');
        return res.redirect('/poker');
    }

    const table = await PokerTable.create({
        tableName,
        tableId,
        buyIn,
        maxNumOfPlayers,
        host: userId
    });

    const user = await User.findOne({
        _id: userId
    });

    await joinPlayerToGame(table, user, 0);

    return res.redirect(`/poker/game/${tableId}`);
});

exports.join = asyncHandler( async (req, res, next) => {
    const internalTableId = req.params.id;
    const userId = req.user.userId;
    const user = await User.findOne({
        _id: userId
    });
    const table = await PokerTable.findOne({
        tableId: internalTableId,
        isActive: true
    });

    if (table === null) {
        setFlash(req, 'error_msg', 'The poker table does not exist');
        return res.redirect('/poker');
    }

    const buyIn = table.buyIn;
    const numOfPlayers = table.players.length;

    if (await isUserInTable(userId, table._id)) {
        return res.redirect('/poker/game/' + internalTableId);
    }

    if (numOfPlayers >= table.maxNumOfPlayers) {
        setFlash(req, 'error_msg', 'The table already has the max number of players');
        return res.redirect('/poker');
    }

    if (await isUserInAnyActiveTable(userId)) {
        setFlash(req, 'error_msg', 'You are already in active poker game');
        return res.redirect('/poker');
    }

    if (user.credits < buyIn) {
        setFlash(req, 'error_msg', 'You don\'t have enough credits to join this game');
        return res.redirect('/poker')
    }

    try {
        await joinPlayerToGame(table, user);
    } catch (e) {
table.players.filter(playerId => playerId.toString() !== userId.toString());
        await table.save();
        setFlash(req, 'error_msg', 'Something went wrong');
        return res.redirect('/poker');
    }

    return res.redirect('/poker/game/' + internalTableId);
});

exports.show = asyncHandler( async (req, res, next) => {
    const internalTableId = req.params.id;
    const userId = req.user.userId;
    const table = await PokerTable.findOne({
        tableId: internalTableId,
        isActive: true
    });

    if (table === null) {
        setFlash(req, 'error_msg', 'The poker table does not exist');
        return res.redirect('/poker');
    }

    if (!await isUserInTable(userId, table._id)) {
        setFlash(req, 'error_msg', 'You are not participating in this poker table');
        return res.redirect('/poker');
    }

    return res.render('pokerGame');
});

exports.leave = asyncHandler( async (req, res, next) => {
    const internalTableId = req.params.id;
    const userId = req.user.userId;
    const table = await PokerTable.findOne({
        tableId: internalTableId,
        isActive: true
    });


    if (table === null) {
        setFlash(req, 'error_msg', 'The poker table does not exist');
        return res.redirect('/poker');
    }

    if (!await isUserInTable(userId, table._id)) {
        setFlash(req, 'error_msg', 'You are already not participating in this poker table');
        return res.redirect('/poker');
    }

    const playerState = await PlayerState.findOne({
        tableId: table._id,
        playerId: userId
    });

    const user = await User.findOne({
        _id: userId
    });

    playerState.isFolded = true;
    user.credits += playerState.creditsLeft;
    playerState.creditsLeft = 0;

    await playerState.save();
    await user.save();

    await changeSeats(table, playerState);

    table.players = table.players.filter(playerId => playerId.toString() !== userId.toString());

    if (table.players.length === 0) {
        table.isActive = false;
    }

    await table.save();

    setFlash(req, "success_msg", "You have left the game");
    return res.redirect('/poker');
});