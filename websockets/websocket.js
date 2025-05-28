const socketIO = require('socket.io');

// Almacenamiento en memoria de usuarios conectados
const connectedUsers = new Map();

let io;
const initSocket = (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
        cors: { origin: '*' },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        // Manejo de conexión de usuario
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(userId);
                connectedUsers.set(userId, socket.id);
                io.emit('userOnline', userId);
                console.log(`Usuario ${userId} conectado`);
            }
        });

        // Manejo de desconexión
        socket.on('disconnect', () => {
            let disconnectedUser;
            for (const [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUser = userId;
                    break;
                }
            }
            if (disconnectedUser) {
                connectedUsers.delete(disconnectedUser);
                io.emit('userOffline', disconnectedUser);
                console.log(`Usuario ${disconnectedUser} desconectado`);
            }
        });

        // Manejo de mensajes
        socket.on('sendMessage', ({ sender, receiver, content, conversationId }) => {
            const message = {
                sender,
                content,
                conversationId,
                timestamp: new Date(),
                status: 'sent'
            };

            // Enviar al receptor si está conectado
            if (isUserOnline(receiver)) {
                io.to(receiver).emit('receiveMessage', message);
            }

            // Confirmar envío al remitente
            socket.emit('messageSent', {
                messageId: message.timestamp,
                delivered: isUserOnline(receiver)
            });
        });

        // Manejo de estado de escritura
        socket.on('typing', ({ sender, receiver, conversationId }) => {
            io.to(receiver).emit('userTyping', { sender, conversationId });
        });

        socket.on('stopTyping', ({ sender, receiver, conversationId }) => {
            io.to(receiver).emit('userStopTyping', { sender, conversationId });
        });

        // Manejo de lectura de mensajes
        socket.on('messageRead', ({ messageId, reader, sender }) => {
            io.to(sender).emit('messageStatus', {
                messageId,
                status: 'read',
                reader,
                timestamp: new Date()
            });
        });

        // Manejo de notificaciones
        socket.on('readNotifications', ({ userId, notificationIds }) => {
            // Emitir evento de notificaciones leídas
            socket.emit('notificationsRead', {
                notificationIds,
                timestamp: new Date()
            });
        });

        // Suscripción a actualizaciones de notificaciones
        socket.on('subscribeToNotifications', (userId) => {
            socket.join(`notifications:${userId}`);
            console.log(`Usuario ${userId} suscrito a notificaciones`);
        });

        // Cancelar suscripción a notificaciones
        socket.on('unsubscribeFromNotifications', (userId) => {
            socket.leave(`notifications:${userId}`);
            console.log(`Usuario ${userId} canceló suscripción a notificaciones`);
        });
    });

    // Manejo de errores de socket
    io.on('error', (error) => {
        console.error('Error en Socket.IO:', error);
    });
};

// Función auxiliar para verificar si un usuario está en línea
const isUserOnline = (userId) => {
    return connectedUsers.has(userId);
};

// Función auxiliar para obtener el socket ID de un usuario
const getUserSocketId = (userId) => {
    return connectedUsers.get(userId);
};

// Función auxiliar para emitir notificación a un usuario específico
const emitToUser = (userId, event, data) => {
    if (isUserOnline(userId)) {
        io.to(userId).emit(event, data);
        return true;
    }
    return false;
};

module.exports = {
    initSocket,
    io,
    isUserOnline,
    getUserSocketId,
    emitToUser
};