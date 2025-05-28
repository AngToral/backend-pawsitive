const { notificationModel } = require('../models/notification.model');
const { userModel } = require('../models/user.model');
const mongoose = require('mongoose');
const { io } = require('../websockets/websocket');

// Obtener notificaciones del usuario
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await notificationModel.find({
            user: userId,
            removedAt: null
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('fromUser', 'username profilePicture')
            .populate('post', 'images')
            .populate('comment', 'content');

        const totalNotifications = await notificationModel.countDocuments({
            user: userId,
            removedAt: null
        });

        res.status(200).json({
            notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalNotifications / limit),
                totalNotifications
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
};

// Marcar notificaciones como leídas
const markNotificationsAsRead = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { notificationIds } = req.body;

        // Si no se proporcionan IDs, marcar todas como leídas
        const query = notificationIds
            ? { _id: { $in: notificationIds }, user: userId, readAt: null }
            : { user: userId, readAt: null };

        const notifications = await notificationModel.find(query);

        if (notifications.length === 0) {
            return res.status(200).json({ message: 'No hay notificaciones para marcar como leídas' });
        }

        await notificationModel.updateMany(
            query,
            {
                $set: {
                    readAt: new Date(),
                    status: 'read'
                }
            },
            { session }
        );

        await session.commitTransaction();
        res.status(200).json({ message: 'Notificaciones marcadas como leídas' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al marcar notificaciones como leídas', error: error.message });
    } finally {
        session.endSession();
    }
};

// Eliminar notificaciones
const deleteNotifications = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { notificationIds } = req.body;

        // Si no se proporcionan IDs, eliminar todas
        const query = notificationIds
            ? { _id: { $in: notificationIds }, user: userId }
            : { user: userId };

        await notificationModel.updateMany(
            query,
            { $set: { removedAt: new Date() } },
            { session }
        );

        await session.commitTransaction();
        res.status(200).json({ message: 'Notificaciones eliminadas' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al eliminar notificaciones', error: error.message });
    } finally {
        session.endSession();
    }
};

// Función auxiliar para enviar notificación en tiempo real
const sendRealTimeNotification = async (notification) => {
    try {
        // Poblar los datos necesarios para la notificación
        const populatedNotification = await notificationModel.findById(notification._id)
            .populate('fromUser', 'username profilePicture')
            .populate('post', 'images')
            .populate('comment', 'content');

        // Enviar a través de WebSocket
        io.to(notification.user.toString()).emit('newNotification', populatedNotification);
    } catch (error) {
        console.error('Error al enviar notificación en tiempo real:', error);
    }
};

// Crear notificación (uso interno)
const createNotification = async ({ type, user, fromUser, post, comment, session }) => {
    try {
        const notification = await notificationModel.create([{
            type,
            user,
            fromUser,
            post,
            comment,
            status: 'unread'
        }], { session });

        // Enviar notificación en tiempo real
        await sendRealTimeNotification(notification[0]);

        return notification[0];
    } catch (error) {
        console.error('Error al crear notificación:', error);
        throw error;
    }
};

module.exports = {
    getNotifications,
    markNotificationsAsRead,
    deleteNotifications,
    createNotification
}; 