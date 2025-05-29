const express = require('express');
const {
    getNotifications,
    markNotificationsAsRead,
    deleteNotifications
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const notificationRouter = express.Router();

// Todas las rutas requieren autenticación
notificationRouter.use(authMiddleware);

// Obtener notificaciones del usuario
notificationRouter.get('/', getNotifications);

// Marcar notificaciones como leídas
notificationRouter.put('/read', markNotificationsAsRead);

// Eliminar notificaciones
notificationRouter.delete('/', deleteNotifications);

module.exports = { notificationRouter }; 