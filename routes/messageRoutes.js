const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    sendMessage,
    markMessageAsRead,
    getConversationMessages,
    deleteMessage
} = require('../controllers/messageController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Enviar un mensaje
router.post('/send', sendMessage);

// Marcar mensaje como leído
router.put('/:messageId/read', markMessageAsRead);

// Obtener mensajes de una conversación
router.get('/conversation/:conversationId', getConversationMessages);

// Eliminar mensaje
router.delete('/:messageId', deleteMessage);

module.exports = { messageRouter: router }; 