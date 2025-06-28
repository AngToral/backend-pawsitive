const { notificationModel } = require('../models/notification.model');
const { userModel } = require('../models/user.model');
const mongoose = require('mongoose');
const { emitToUser } = require('../websockets/websocket');

// Función auxiliar para enviar notificación en tiempo real
const sendRealTimeNotification = async (notification) => {
    try {
        // Poblar los datos necesarios para la notificación
        const populatedNotification = await notificationModel.findById(notification._id)
            .populate('sender', 'username profilePicture')
            .populate('post', 'images')
            .populate('comment', 'text');

        // Enviar notificación en tiempo real
        emitToUser(
            populatedNotification.recipient.toString(),
            'newNotification',
            populatedNotification
        );

        return populatedNotification;
    } catch (error) {
        console.error('Error al enviar notificación en tiempo real:', error);
    }
};

// Crear notificación (función auxiliar para otros controladores)
const createNotification = async ({ type, recipient, sender, post = null, comment = null }, session = null) => {
    try {
        // No crear notificación si el remitente es el mismo que el destinatario
        if (recipient.toString() === sender.toString()) {
            return null;
        }

        const notificationData = {
            type,
            recipient,
            sender,
            post,
            comment
        };

        const notification = session
            ? await notificationModel.create([notificationData], { session })
            : await notificationModel.create(notificationData);

        // Si se creó con sesión, la notificación está en un array
        const newNotification = session ? notification[0] : notification;

        // Enviar notificación en tiempo real solo si no es de tipo mensaje
        // (los mensajes ya tienen su propio sistema de notificación en tiempo real)
        if (type !== 'message') {
            await sendRealTimeNotification(newNotification);
        }

        return newNotification;
    } catch (error) {
        console.error('Error al crear notificación:', error);
        throw error;
    }
};

// Obtener notificaciones del usuario
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await notificationModel.find({
            recipient: userId
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username profilePicture')
            .populate('post', 'images')
            .populate('comment', 'text');

        const totalNotifications = await notificationModel.countDocuments({
            recipient: userId
        });

        const unreadCount = await notificationModel.countDocuments({
            recipient: userId,
            read: false
        });

        res.status(200).json({
            notifications,
            unreadCount,
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

        const query = notificationIds
            ? { _id: { $in: notificationIds }, recipient: userId, read: false }
            : { recipient: userId, read: false };

        const result = await notificationModel.updateMany(
            query,
            {
                $set: {
                    read: true,
                    readAt: new Date()
                }
            },
            { session }
        );

        await session.commitTransaction();

        // Emitir evento de notificaciones leídas
        emitToUser(userId.toString(), 'notificationsRead', {
            notificationIds: notificationIds || 'all',
            timestamp: new Date()
        });

        res.status(200).json({
            message: 'Notificaciones marcadas como leídas',
            modifiedCount: result.modifiedCount
        });
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

module.exports = {
    getNotifications,
    markNotificationsAsRead,
    deleteNotifications,
    createNotification
}; 