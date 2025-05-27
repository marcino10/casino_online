const {getUserTable, startGame, getPlayersBySeats, raise, fold} = require("../controllers/pokerGameController");

module.exports = io => {
    io.on('connection', async (socket) => {
        const userId = socket.user.userId;
        const table = await getUserTable(userId);
        const isHost = userId.toString() === table.host.toString();
        const roomId = table.tableId;

        socket.join(table.tableId);

        if (isHost) {
            socket.on('start-game', async () => {
                await startGame(io, socket, roomId, userId);
            });
        }

        console.log(userId + ' connected');

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
    });
}
