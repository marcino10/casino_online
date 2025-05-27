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

const drawCardsForBoard = async (numOfCards, table, hands) => {
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

        table.boardDeck.push(...cardsIds);
        await table.save();

        return cards;
    } catch (err) {
        console.error('Error drawing cards:', err);
    }
}

const getPrizePools = (numOfPlayers) => {
    if (numOfPlayers > 6) {
        return [0.5, 0.3, 0.2];
    }

    if (numOfPlayers > 2) {
        return [0.75, 0.25];
    }

    return [1.0];
}

const getPositions = async (table) => {
    const postUrl = `${POKER_API_URL}/positions`;

    const activePlayers = await PlayerState.find({
        tableId: table._id,
        isFolded: false
    }).select('seat');

    const allHands = table.allHandsJson;
    const playersActiveHands = {};

    for (const player of activePlayers) {
        const playerSeat = player.seat;
        playersActiveHands[playerSeat] = allHands[playerSeat];
    }

    const allActiveHands = {
        "0": allHands["0"],
        ...playersActiveHands
    }

    const res = await axios.post(postUrl, allActiveHands);
    return res.data.playersPositions;
}

const distributePrize = async (positions, prizePools, table) => {
    let currentPrizePool = 0;
    const numOfPrizePools = prizePools.length;
    let allPrizeDistributed = 0;

    for (const position of positions) {
        const numOfAvailablePrizePools = numOfPrizePools - currentPrizePool;
        if (currentPrizePool >= numOfAvailablePrizePools) {
            break;
        }

        const numOfPlayersInPosition = position.length;
        let prizePoolForPosition = 0;
        for (let i = 0; i < numOfPlayersInPosition; i++) {
            if (currentPrizePool >= numOfAvailablePrizePools) {
                break;
            }

            prizePoolForPosition += prizePools[currentPrizePool];
            currentPrizePool++;
        }

        const prizeValueForPlayer = Math.floor((table.pot * prizePoolForPosition) / numOfPlayersInPosition);
        allPrizeDistributed += prizeValueForPlayer * numOfPlayersInPosition;

        for (const player of position) {
            const playerState = await PlayerState.findOne({
                tableId: table._id,
                seat: Number(player)
            });

            playerState.creditsLeft += prizeValueForPlayer;
            playerState.save();
        }
    }

    if (allPrizeDistributed < table.pot) {
        const remainingPrize = table.pot - allPrizeDistributed;
        const firstPlayerState = await PlayerState.findOne({
            tableId: table._id,
            seat: Number(positions[0][0])
        })

        firstPlayerState.creditsLeft += remainingPrize;
        firstPlayerState.save();
    }
}

const resetGame = async (table) => {
    table.isStarted = false;
    table.currentRound = 0;
    table.currentTurnSeat = 1;
    table.currentBetSeat = 0;
    table.currentBet = 0;
    table.numOfSeatsInCurrentGame = 0;
    table.pot = 0;
    table.boardDeck = [];
    table.allHandsJson = {};
    await table.save();

    await PlayerState.updateMany(
        {tableId: table._id},
        {
            $set: {
                isFolded: false,
                lastBet: 0,
                hand: []
            }
        }
    );
}

const nextRound = async (io, roomId, table) => {
    const currentRound = table.currentRound;
    const currentCards = table.allHandsJson;

    let newCards;
    switch (currentRound) {
        case 0:
            newCards = await drawCardsForBoard(3, table, currentCards);

            table.allHandsJson = {
                "0": newCards,
                ...table.allHandsJson
            }
            table.currentRound += 1;
            await table.save();

            io.to(roomId).emit('new-turn', {
                cards: newCards
            });
            break;
        case 1:
        case 2:
            newCards = await drawCardsForBoard(1, table, currentCards);

            table.allHandsJson["0"].push(...newCards);
            table.currentRound += 1;
            await table.save();

            io.to(roomId).emit('new-turn', {
                cards: newCards
            });
            break;
        case 3:
            const prizePools = getPrizePools(table.numOfSeatsInCurrentGame);
            const positions = await getPositions(table);
            await distributePrize(positions, prizePools, table);
            await resetGame(table)

            const playersBySeats = await getPlayersBySeats(table._id);


            io.in(roomId).fetchSockets().then(async (sockets) => {
                for (const socket of sockets) {
                    const playersStates = await getAvailablePlayersStatesByNick(playersBySeats, socket.user.userId, table._id);

                    socket.emit('game-ended', {
                        playersStates,
                        pot: table.pot,
                        currentTurnSeat: table.currentTurnSeat
                    });
                }
            });

            break;
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

const fold = async (io, reqSocket, roomId, userId) => {
    const table = await getTableByRoom(roomId);
    const playerState = await PlayerState.findOne({
        tableId: table._id,
        playerId: userId
    }).populate('hand', 'suit value');

    playerState.isFolded = true;
    await playerState.save();

    if (table.currentTurnSeat === playerState.seat) {
        table.currentTurnSeat = await getNextPlayerSeat(table);
        table.save();
    }

    if (table.currentTurnSeat === table.currentBetSeat) {
        await nextRound(io, roomId, table);
    }

    io.to(roomId).emit('folded', {
        actionBySeat: playerState.seat,
        currentTurnSeat: table.currentTurnSeat,
        playerCards: playerState.hand
    })
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

    if (playerState.isFolded) {
        return;
    }

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
    });

    if (table.currentTurnSeat === table.currentBetSeat) {
        await nextRound(io, roomId, table);
    }
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

    table.currentTurnSeat = 1;

    const numOfPlayers = table.players.length;
    const playersHands = await getCardsForPlayers(numOfPlayers, tableId);

    table.allHandsJson = playersHands;
    table.numOfSeatsInCurrentGame = numOfPlayers;
    table.isStarted = true;
    table.currentTurnSeat = await getNextPlayerSeat(table);
    await table.save();

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
    fold,
    getUserTable,
    getPlayersBySeats,
    getAvailablePlayersStatesByNick
}