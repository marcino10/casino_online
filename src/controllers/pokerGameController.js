const {setFlash} = require("../helpers");
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

        table.boardDeck = cardsIds;
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

const betValue = async (table, playerState, betValue) => {
    const betDiff = betValue - playerState.lastBet;

    table.currentBet = betValue;
    table.pot += betDiff;
    await table.save();

    playerState.creditsLeft -= betDiff;
    playerState.lastBet = betValue
    await playerState.save();

    return playerState;
}

const startGame = async (table, io, hostSocket, ioRoom) => {
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

    const boardDeck = {
        "0": await getCardsForBoard(3, table, playersHands)
    }

    await PokerTable.updateOne(
        { _id: tableId },
        {
            $set: {
                allHandsJson: {...boardDeck, ...playersHands},
                numOfSeatsInCurrentGame: numOfPlayers,
                isStarted: true,
                currentActionSeat: 1,
            }
        }
    );

    const playersBySeats = await getPlayersBySeats(table._id);

    let firstPlayerState = await PlayerState.findOne({
        tableId: tableId,
        seat: 1
    });

    const blindBetValue = await getBlindBetValue(table.buyIn);
    firstPlayerState =  await betValue(table, firstPlayerState, blindBetValue);

    io.in(ioRoom).fetchSockets().then(async (sockets) => {
       for (const socket of sockets) {
          const userId = socket.user.userId;
          const userState = await PlayerState.findOne({
              playerId: userId,
              tableId
          });
          const cards = playersHands[userState.seat];

          socket.emit('game-started', {
                players: playersBySeats,
                cards,
                ActionBy: playersBySeats[0],
                betValue: blindBetValue,
                creditsLeft: firstPlayerState.creditsLeft,
                pot: table.pot
          });
       }
    });
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

module.exports = {
    startGame,
    getUserTable,
    getPlayersBySeats,
}