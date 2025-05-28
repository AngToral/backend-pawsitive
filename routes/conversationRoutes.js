const express = require('express');
const {
    createConversation,
    getConversations,
    getConversation,
    deleteConversation
} = require('../controllers/conversationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const conversationRouter = express.Router();

// Todas las rutas requieren autenticación
conversationRouter.use(authMiddleware);

// Crear una nueva conversación
conversationRouter.post('/', createConversation);

// Obtener todas las conversaciones del usuario
conversationRouter.get('/', getConversations);

// Obtener una conversación específica
conversationRouter.get('/:conversationId', getConversation);

// Eliminar una conversación
conversationRouter.delete('/:conversationId', deleteConversation);

module.exports = { conversationRouter }; 