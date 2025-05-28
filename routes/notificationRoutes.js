const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markNotificationsAsRead,
    deleteNotifications
} = require('../controllers/notificationController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener notificaciones del usuario
router.get('/', getNotifications);

// Marcar notificaciones como leídas
router.put('/read', markNotificationsAsRead);

// Eliminar notificaciones
router.delete('/', deleteNotifications);

module.exports = { notificationRouter: router }; 