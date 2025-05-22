const PokerTable = require('../models/PokerTable');
require('../controllers/pokerGameController')
const {getUserTable, startGame, getPlayersBySeats} = require("../controllers/pokerGameController");

module.exports = io => {
    io.on('connection', async (socket) => {
        const userId = socket.user.userId;
        const table = await getUserTable(userId);
        const isHost = userId.toString() === table.host.toString();

        socket.join(table.tableId);

        if (isHost) {
            socket.on('start-game', async () => {
                await startGame(table, io, socket, table.tableId);
            });
        }

        console.log(userId + ' connected');

        if (table.isStarted)

            socket.on('disconnect', () => {
                console.log(userId + ' disconnected');
            });
    });
};
