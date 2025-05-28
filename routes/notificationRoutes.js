const express = require('express');
const {
    getNotifications,
    markAsRead,
    deleteNotification,
    clearAllNotifications
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const notificationRouter = express.Router();

// Todas las rutas requieren autenticación
notificationRouter.use(authMiddleware);

// Obtener notificaciones del usuario
notificationRouter.get('/', getNotifications);

// Marcar notificación como leída
notificationRouter.put('/:notificationId/read', markAsRead);

// Eliminar una notificación
notificationRouter.delete('/:notificationId', deleteNotification);

// Eliminar todas las notificaciones
notificationRouter.delete('/', clearAllNotifications);

module.exports = { notificationRouter }; 