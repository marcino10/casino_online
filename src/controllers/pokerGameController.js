const PlayerState = require("../models/PlayerPokerState");
const PokerTable = require('../models/PokerTable');
const User = require('../models/User');
const Card = require('../models/Card');
const axios = require('axios');
const POKER_API_URL = process.env.POKER_API_URL || 'http://localhost:3000/api/poker';

const getCardsForPlayers = async (numOfPlayers, tableId) => {
    const postData = {
        numOfPlayers
    }

    try {
        const res = await axios.post(`${POKER_API_URL}/draw/players`, postData);
        const playersHands = res.data;

        for (const playerSeat of Object.keys(playersHands)) {
            const cards = playersHands[playerSeat];

            const playerState = await PlayerState.findOne({
                tableId: tableId,
                seat: playerSeat
            });

            const matchingCards = await Card.find({
                $or: cards
            }).select('_id');

            const cardsIds = matchingCards.map(card => card._id);
            playerState.hand = cardsIds;
            await playerState.save();
        }

        return playersHands;
    } catch (err) {
        console.error('Error drawing cards:', err);
    }

};

const getCardsForBoard = async (numOfCards, table, hands) => {
    const postData = {
        numOfCards,
        hands
    }

    try {
        const res = await axios.post(`${POKER_API_URL}/draw/board`, postData);
        const cards = res.data;

        const matchingCards = await Card.find({
            $or: cards
        }).select('_id');
        const cardsIds = matchingCards.map(card => card._id);

        table.boardDeck += cardsIds;
        await table.save();

        return cards;
    } catch (err) {
        console.error('Error drawing cards:', err);
    }
}

const getMinBetStepValue = async (buyIn) => {
    return;
}

const getBlindBetValue = async (buyIn) => {
    const blindBetValue = Math.round(buyIn / 100);

    if (blindBetValue < 1) {
        return 1;
    }

    return blindBetValue;
}

const bet = async (table, playerState, betValue = null) => {
    let betDiff;

    if (!betValue) {
        betValue = table.currentBet;
        betDiff = betValue - playerState.lastBet;

        if (playerState.creditsLeft < betDiff) {
            betDiff = playerState.creditsLeft;
        }
    } else {
        table.currentBet = betValue;
        betDiff = betValue - playerState.lastBet;

        if (playerState.creditsLeft < betDiff) {
            throw new Error('Not enough credits to place this bet');
        }
    }

    table.pot += betDiff;
    await table.save();

    playerState.creditsLeft -= betDiff;
    playerState.lastBet = betValue
    await playerState.save();

    return betDiff;
}

const betNewValue = async (table, playerState, betValue) => {
    let betDiff;
    try {
        betDiff =  await bet(table, playerState, betValue);
    } catch (err) {
        throw new Error(err.message);
    }

    table.currentBetSeat = playerState.seat;
    await table.save();

    return betDiff;
}

const getNextPlayerSeat = async (table) => {
    let nextSeat = table.currentTurnSeat + 1;

    if (nextSeat > table.numOfSeatsInCurrentGame) {
        nextSeat = 1;
    }

    const nextPlayerState = await PlayerState.findOne({
        tableId: table._id,
        seat: nextSeat
    });

    if (nextPlayerState.isFolded) {
        table.currentTurnSeat = nextSeat;
        await table.save();

        return getNextPlayerSeat(table);
    }

    return nextSeat;
}

const getUserTable = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const table = await PokerTable.findOne({
        players: userId,
        isActive: true
    });
    if (!table) {
        throw new Error('Table not found');
    }
    return table;
}

const getPlayersBySeats = async (tableId) => {
    const players = await PlayerState.find({ tableId }).populate('playerId', 'nick').select('seat');
    const playersBySeatsJson = {};
    const numOfSeats = players.length;
    for (const player of players) {
        playersBySeatsJson[player.seat] = player.playerId.nick
    }

    let playersBySeats = [];
    for (let i = 0; i < numOfSeats; i++) {
        playersBySeats.push(playersBySeatsJson[i+1]);
    }

    return playersBySeats;
}

const getTableByRoom = async (roomId) => {
    const table = await PokerTable.findOne({tableId: roomId}).populate('players', 'nick').populate('host', 'nick');

    return table;
}

const getAvailablePlayersStatesByNick = async (playersBySeats, userId, tableId) => {
    const playersStates = await PlayerState.find({
        tableId
    }).populate('playerId', 'nick').populate('hand', 'suit value');

    let playersStatesByNick = {};
    for (const currentPlayerState of playersStates) {
        const isFolded = currentPlayerState.isFolded;
        let hand = [];

        if (isFolded || currentPlayerState.playerId._id.toString() === userId.toString()) {
            const cards = currentPlayerState.hand;
            for (const card of cards) {
                hand.push(card);
            }
        }

        playersStatesByNick[currentPlayerState.playerId.nick] = {
            isFolded,
            hand,
            lastBet: currentPlayerState.lastBet,
            creditsLeft: currentPlayerState.creditsLeft,
        }
    }

    return playersStatesByNick;
}

const raise = async (io, reqSocket, roomId, userId, betValue = 0) => {
    const table = await getTableByRoom(roomId);

    if (betValue < table.currentBet && betValue !== 0) {
        return;
    }

    const playerState = await PlayerState.findOne({
        playerId: userId,
        tableId: table._id
    });

    if (playerState.seat !== table.currentTurnSeat) {
        return;
    }

    let betDiff;
    if (betValue === 0) {
        try {
            betDiff = await bet(table, playerState);
        } catch (err) {
            return;
        }
    } else {
        try {
            betDiff = await betNewValue(table, playerState, betValue);
        } catch (err) {
            return;
        }
    }

    table.currentTurnSeat = await getNextPlayerSeat(table);
    await table.save();

    io.to(roomId).emit('raised', {
        ActionBySeat: playerState.seat,
        betValue: table.currentBet,
        betDiff,
        creditsLeft: playerState.creditsLeft,
        pot: table.pot,
        currentTurnSeat: table.currentTurnSeat
    })
}

const startGame = async (io, hostSocket, roomId, userId) => {
    const table = await getTableByRoom(roomId)
    const tableId = table._id;

    if (table.isStarted) return;

    if(table.players.length < 2) {
        hostSocket.emit('start-status', {
            message: 'Not enough players'
        });
        return;
    }

    const numOfPlayers = table.players.length;
    const playersHands = await getCardsForPlayers(numOfPlayers, tableId);

    await PokerTable.updateOne(
        { _id: tableId },
        {
            $set: {
                allHandsJson: playersHands,
                numOfSeatsInCurrentGame: numOfPlayers,
                isStarted: true,
                currentTurnSeat: 2,
            }
        }
    );

    const firstPlayerState = await PlayerState.findOne({
        tableId: tableId,
        seat: 1
    });
    const playersBySeats = await getPlayersBySeats(table._id);
    const blindBetValue = await getBlindBetValue(table.buyIn);
    const betDiff =  await betNewValue(table, firstPlayerState, blindBetValue);

    io.in(roomId).fetchSockets().then(async (sockets) => {
       for (const socket of sockets) {
          const currentUserId = socket.user.userId;
          const playersStates = await getAvailablePlayersStatesByNick(playersBySeats, currentUserId, tableId);

          socket.emit('game-started', {
                players: playersBySeats,
                ActionBySeat: 1,
                betValue: firstPlayerState.creditsLeft,
                betDiff,
                pot: table.pot,
                currentTurnSeat: table.currentTurnSeat,
                playersStates
          });
       }
    });
}

module.exports = {
    startGame,
    raise,
    getUserTable,
    getPlayersBySeats,
    getAvailablePlayersStatesByNick
}