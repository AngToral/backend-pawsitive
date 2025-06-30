const express = require('express');
const {
    sendMessage,
    markMessageAsRead,
    getConversationMessages,
    deleteMessage,
    searchMessages
} = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');

const messageRouter = express.Router();

// Todas las rutas requieren autenticación
messageRouter.use(authMiddleware);

// Enviar un mensaje
messageRouter.post('/send', sendMessage);

// Marcar mensaje como leído
messageRouter.put('/:messageId/read', markMessageAsRead);

// Obtener mensajes de una conversación
messageRouter.get('/conversation/:conversationId', getConversationMessages);

// Eliminar mensaje
messageRouter.delete('/:messageId', deleteMessage);

// Buscar mensajes dentro de una conversación
messageRouter.get('/:conversationId/search', searchMessages);

module.exports = { messageRouter }; 