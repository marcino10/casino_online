const PlayerState = require("../models/PlayerPokerState");
const PokerTable = require('../models/PokerTable');
const User = require('../models/User');
const Card = require('../models/Card');
const axios = require('axios');
const POKER_API_URL = process.env.POKER_API_URL || 'http://localhost:3000/api/poker';

const getMinCash = (buyIn) => {
    const minCash = Math.round(0.3 * buyIn);
    if (minCash < 1) {
        return 1;
    }
    return minCash;
}

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

    const activePlayers = await getAllActivePlayers(table._id);
    const allHands = table.allHandsJson;
    const playersActiveHands = {};

    for (const player of activePlayers) {
        const playerSeat = player.seat;
        playersActiveHands[playerSeat] = allHands[playerSeat];
    }

    let allActiveHands;
    if (allHands["0"] === undefined) {
        allActiveHands = {
            "0": [],
            ...playersActiveHands
        }
    } else {
        allActiveHands = {
            "0": allHands["0"],
            ...playersActiveHands
        }
    }

    const res = await axios.post(postUrl, allActiveHands);

    const playersBestHands = res.data.playersBestHands;
    for (const player of Object.keys(playersBestHands)) {
        if (playersBestHands.hasOwnProperty(player)) {
            const playerState = await PlayerState.findOne({
                tableId: table._id,
                seat: Number(player)
            });

            playerState.rankingName = playersBestHands[player].rankingName;
            playerState.save();
        }
    }

    return res.data.playersPositions;
}

const distributePrize = async (table) => {
    const positions = await getPositions(table);
    const activePlayers = await getAllActivePlayers();
    const prizePools = getPrizePools(activePlayers.length);

    let currentPrizePool = 0;
    const numOfPrizePools = prizePools.length;
    let allPrizeDistributed = 0;

    for (const position of positions) {
        if (currentPrizePool >= numOfPrizePools) {
            break;
        }

        const numOfPlayersInPosition = position.length;
        let prizePoolForPosition = 0;
        for (let i = 0; i < numOfPlayersInPosition; i++) {
            if (currentPrizePool >= numOfPrizePools) {
                break;
            }

            prizePoolForPosition = prizePools[currentPrizePool];
            currentPrizePool++;
        }

        const prizeValueForPlayer = Math.floor((table.pot * prizePoolForPosition) / numOfPlayersInPosition);

        for (const player of position) {
            const playerState = await PlayerState.findOne({
                tableId: table._id,
                seat: Number(player)
            });

            playerState.creditsLeft += prizeValueForPlayer;
            playerState.currentGameProfit = prizeValueForPlayer;
            allPrizeDistributed += prizeValueForPlayer;
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

    const playersIds = table.players.map(user => user._id);

    await PlayerState.updateMany(
        {tableId: table._id},
        {
            $set: {
                isFolded: false,
                lastBet: 0,
                hand: [],
                currentGameProfit: 0,
                rankingName: ''
            }
        }
    );

    await PlayerState.deleteMany({
        playerId: { $nin: playersIds }
    });
}

const leavePlayersWithTooLowCredits = async (io, table) => {
    const minCash = getMinCash(table.buyIn);
    const playersStates = await PlayerState.find({tableId: table._id});

    for (const playerState of playersStates) {
        if (playerState.creditsLeft < minCash) {
            await systemLeave(io, table.tableId, playerState.playerId.toString());
        }
    }
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
            await distributePrize(table);

            table.isStarted = false;
            await table.save();

            const playersStates = await PlayerState.find({tableId: table._id}).populate('playerId', 'nick').populate('hand', 'suit value');

            let playersStatesByNick = {};
            for (const currentPlayerState of playersStates) {
                const isFolded = currentPlayerState.isFolded;

                playersStatesByNick[currentPlayerState.playerId.nick] = {
                    isFolded,
                    hand: currentPlayerState.hand,
                    lastBet: currentPlayerState.lastBet,
                    creditsLeft: currentPlayerState.creditsLeft,
                    profit: currentPlayerState.currentGameProfit,
                    rankingName: currentPlayerState.rankingName
                }
            }

            io.to(roomId).emit('game-ended', {
                playersStates: playersStatesByNick,
                pot: table.pot,
                currentTurnSeat: table.currentTurnSeat
            });

            await leavePlayersWithTooLowCredits(io, table);
            break;
    }
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

const getNextPlayerBetSeat = async (table) => {
    let nextSeat = table.currentBetSeat + 1;

    if (nextSeat > table.numOfSeatsInCurrentGame) {
        nextSeat = 1;
    }

    const nextPlayerState = await PlayerState.findOne({
        tableId: table._id,
        seat: nextSeat
    });

    if (nextPlayerState.isFolded) {
        table.currentBetSeat = nextSeat;

        return getNextPlayerBetSeat(table);
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
        return null;
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

const getAllActivePlayers = async (tableId) => {
    const players = await PlayerState.find({
        tableId,
        isFolded: false
    });

    return players;
}

const fold = async (io, reqSocket, roomId, userId) => {
    const table = await getTableByRoom(roomId);
    const playerState = await PlayerState.findOne({
        tableId: table._id,
        playerId: userId
    }).populate('hand', 'suit value');

    playerState.isFolded = true;
    await playerState.save();

    const activePlayers = await getAllActivePlayers(table._id);
    if (activePlayers.length === 1) {
        table.currentRound = 3;
        await nextRound(io, roomId, table);
        return;
    }

    if (table.currentBetSeat === playerState.seat) {
        table.isCurrentBetSeatFolded = true;
        await table.save();
    }

    if (table.currentTurnSeat === playerState.seat) {
        table.currentTurnSeat = await getNextPlayerSeat(table);
        await table.save();
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

const leave = async (io, reqSocket, roomId, userId) => {
    await systemLeave(io, roomId, userId, reqSocket);

    reqSocket.emit('leaved');
}

const systemLeave = async (io, roomId, userId, reqSocket = null) => {
    const table = await PokerTable.findOne({tableId: roomId});
    const user = await User.findOne({_id: userId});
    const playerState = await PlayerState.findOne({
        tableId: table._id,
        playerId: userId
    });

    if (playerState !== null) {
        if (table.isStarted && reqSocket !== null) {
            await fold(io, reqSocket, roomId, userId);
        }

        user.credits += playerState.creditsLeft;
        playerState.creditsLeft = 0;
        await user.save();
        await playerState.save();
    }

    table.players = table.players.filter(playerId => playerId.toString() !== userId.toString());

    if (table.host.toString() === userId.toString()) {
        table.host = table.players[0] || null;
    }

    const numOfPlayers = table.players.length;
    if (numOfPlayers === 0) {
        table.isActive = false;
    } else {
        const hostId = table.host;
        const host = await User.findById(hostId);

        io.to(roomId).emit('players-changed', {
            numOfPlayers,
            hostNick: host.nick
        })
    }

    await table.save();
}

const raise = async (io, reqSocket, roomId, userId, betValue = 0) => {
    const table = await getTableByRoom(roomId);

    if (betValue < table.currentBet && betValue !== 0) {
        return;
    }

    if (betValue > table.maxBet) {
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
    if (betValue === 0 || betValue === table.currentBet) {
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
    if (table.isCurrentBetSeatFolded) {
        table.currentBetSeat = await getNextPlayerBetSeat(table);
        table.isCurrentBetSeatFolded = false;
    }

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

    await resetGame(table);

    const playersStates = await PlayerState.find({tableId});
    const numOfPlayers = playersStates.length;
    for (let i = 0; i < numOfPlayers; i++) {
        playersStates[i].seat = i + 1;
    }

    await PlayerState.bulkSave(playersStates);

    let maxBet = 9999999999;
    for (const playerState of playersStates) {
        if (playerState.creditsLeft < maxBet) {
            maxBet = playerState.creditsLeft;
        }
    }

    table.allHandsJson = await getCardsForPlayers(numOfPlayers, tableId);
    table.numOfSeatsInCurrentGame = numOfPlayers;
    table.isStarted = true;
    table.currentTurnSeat = await getNextPlayerSeat(table);
    table.maxBet = maxBet;
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
                actionBySeat: 1,
                betValue: firstPlayerState.lastBet,
                creditsLeft: firstPlayerState.creditsLeft,
                betDiff,
                maxBet,
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
    leave,
    getUserTable,
    getPlayersBySeats,
    getAvailablePlayersStatesByNick
}