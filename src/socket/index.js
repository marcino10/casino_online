const {getUserTable, startGame, getPlayersBySeats, raise, fold, leave} = require("../controllers/pokerGameController");

module.exports = io => {
    io.on('connection', async (socket) => {
        const userId = socket.user.userId;
        const table = await getUserTable(userId);

        if (table) {
            const roomId = table.tableId;

            socket.join(table.tableId);

            socket.on('start-game', async () => {
                const table = await getUserTable(userId);
                const isHost = userId.toString() === table.host.toString();

                if (isHost) {
                    await startGame(io, socket, roomId, userId);
                }
            });

            socket.on('raise', async (data) => {
                const betValue = data.betValue;

                if (betValue > 0) {
                    await raise(io, socket, roomId, userId, betValue);
                }
            })

            socket.on('call', async () => {
                await raise(io, socket, roomId, userId, 0);
            });

            socket.on('fold', async () => {
                await fold(io, socket, roomId, userId);
            });

            socket.on('disconnect', () => {
                console.log(userId + ' disconnected');
            });

            socket.on('leave', async () => {
                await leave(io, socket, roomId, userId);
                socket.leave(roomId);
            })

            socket.on('change-players', async () => {
                const numOfPlayers = table.players.length;
                io.to(roomId).emit('players-changed', {
                    numOfPlayers
                });
            });
        }
    });
}
