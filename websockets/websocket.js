let io;
const initSocket = (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
        cors: { origin: '*' },
    });

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('join', (userId) => {
            socket.join(userId);
        });

        socket.on('sendMessage', ({ sender, receiver, content }) => {
            io.to(receiver).emit('receiveMessage', { sender, content });
        });
    });
};

module.exports = { initSocket, io };