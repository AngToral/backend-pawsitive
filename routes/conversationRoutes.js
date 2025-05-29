const express = require('express');
const {
    getOrCreateConversation,
    getUserConversations,
    getConversationMessages,
    markMessagesAsRead
} = require('../controllers/conversationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const conversationRouter = express.Router();

// Todas las rutas requieren autenticación
conversationRouter.use(authMiddleware);

// Crear o obtener una conversación con otro usuario
conversationRouter.post('/', getOrCreateConversation);

// Obtener todas las conversaciones del usuario
conversationRouter.get('/', getUserConversations);

// Obtener mensajes de una conversación específica
conversationRouter.get('/:conversationId/messages', getConversationMessages);

// Marcar mensajes como leídos
conversationRouter.put('/:conversationId/read', markMessagesAsRead);

module.exports = { conversationRouter }; 