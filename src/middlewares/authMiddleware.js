require('dotenv').config({ path: '.env' });
const JWT_SECRET = process.env.JWT_SECRET;

const jwt = require('jsonwebtoken');
const {setFlash} = require("../helpers");
const User = require("../models/User");
const PlayerState = require("../models/PlayerPokerState");
const PokerTable = require("../models/PokerTable");

const isValidToken = token => {
    if(!token) {
        return false;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        return decoded;
    } catch (error) {
        return false;
    }
}

const authInfo = async (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        const decoded = isValidToken(token);
        if (decoded !== false) {
            req.user = decoded;

            const userId = req.user.userId;

            const user = await User.findOne({ _id: userId });
            if (!user) {
                return res.render('index', {
                    isAuth: false
                })
            }

            const nick = user.nick;
            const balance = user.credits;

            const playerStates = await PlayerState.find({ playerId: userId })
                .populate({
                    path: 'tableId',
                    match: { isActive: true },
                    select: '_id tableId players'
                })
                .lean();
            const activePlayerStates = playerStates.filter(state => state.tableId);

            let isInPokerTable = false;
            let pokerTableId = null
            if (activePlayerStates.length > 0) {
                outerLoop: for (const playerState of activePlayerStates) {
                    for (const player of playerState.tableId.players) {
                        if (player.toString() === userId.toString()) {
                            isInPokerTable = true;
                            pokerTableId = playerState.tableId.tableId;
                            break outerLoop;
                        }
                    }
                }
            }

            const activeTables = await PokerTable.find({ isActive: true }).select('tableId players maxNumOfPlayers buyIn tableName').lean();

            const activeTablesWithPlayerCount = activeTables.map(table => ({
                ...table,
                playerCount: table.players.length,
                players: undefined
            }));

            req.data = {
                isAuth: true,
                nick,
                balance,
                isInPokerTable,
                pokerTableId,
                activeTables: activeTablesWithPlayerCount
            }
        }
    }

    next();
}

const auth = (req, res, next) => {
    const token = req.cookies.token;

    const decoded = isValidToken(token);
    if (decoded === false) {
        setFlash(req, 'error_msg', 'You have to log in')
        return res.redirect('/login');
    } else {
        req.user = decoded;
        next();
    }
}

const redirectIfAuth = (req, res, next) => {
    const token = req.cookies.token;
    
    if (isValidToken(token) !== false) {
        return res.redirect('/');
    } else {
        next();
    }
}

module.exports = [auth, redirectIfAuth, authInfo];