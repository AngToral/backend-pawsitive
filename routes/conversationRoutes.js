const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    createConversation,
    getConversations,
    getConversation,
    deleteConversation
} = require('../controllers/conversationController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear una nueva conversación
router.post('/', createConversation);

// Obtener todas las conversaciones del usuario
router.get('/', getConversations);

// Obtener una conversación específica
router.get('/:conversationId', getConversation);

// Eliminar una conversación
router.delete('/:conversationId', deleteConversation);

module.exports = { conversationRouter: router }; 