const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = (socket, next) => {
    try {
        const rawCookie = socket.handshake.headers.cookie;
        if (!rawCookie) {
            return next(new Error('No cookies found'));
        }

        const cookies = cookie.parse(rawCookie);

        const token = cookies.token;

        if (!token) {
            return next(new Error('Authentication token not found in cookies'));
        }

        const decoded = jwt.verify(token, SECRET);

        socket.user = decoded;
        next();
    } catch (err) {
        console.error('Socket auth error:', err.message);
        next(new Error('Authentication error'));
    }
};
