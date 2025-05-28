const { conversationModel } = require('../models/conversation.model');
const { messageModel } = require('../models/message.model');
const { userModel } = require('../models/user.model');
const mongoose = require('mongoose');

// Crear o obtener una conversación entre dos usuarios
const getOrCreateConversation = async (req, res) => {
    try {
        const { participantId } = req.body;
        const userId = req.user._id;

        // Verificar que el participante existe
        const participantExists = await userModel.findById(participantId);
        if (!participantExists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Buscar si ya existe una conversación entre estos usuarios
        let conversation = await conversationModel.findOne({
            participants: {
                $all: [userId, participantId],
                $size: 2
            },
            isGroup: false
        }).populate('participants', 'username profileImage')
            .populate('lastMessage');

        // Si no existe, crear una nueva
        if (!conversation) {
            conversation = await conversationModel.create({
                participants: [userId, participantId],
                isGroup: false
            });
            conversation = await conversation.populate('participants', 'username profileImage');
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener/crear conversación', error: error.message });
    }
};

// Obtener todas las conversaciones de un usuario
const getUserConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await conversationModel.find({
            participants: userId
        })
            .populate('participants', 'username profileImage')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener conversaciones', error: error.message });
    }
};

// Obtener mensajes de una conversación con paginación
const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verificar que la conversación existe y el usuario es participante
        const conversation = await conversationModel.findOne({
            _id: conversationId,
            participants: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversación no encontrada' });
        }

        const messages = await messageModel.find({
            conversation: conversationId
        })
            .populate('sender', 'username profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMessages = await messageModel.countDocuments({
            conversation: conversationId
        });

        res.status(200).json({
            messages: messages.reverse(),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
    }
};

// Marcar mensajes como leídos
const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        // Actualizar todos los mensajes no leídos en la conversación
        await messageModel.updateMany(
            {
                conversation: conversationId,
                receiver: userId,
                readAt: null
            },
            {
                $set: { readAt: new Date() }
            }
        );

        res.status(200).json({ message: 'Mensajes marcados como leídos' });
    } catch (error) {
        res.status(500).json({ message: 'Error al marcar mensajes como leídos', error: error.message });
    }
};

module.exports = {
    getOrCreateConversation,
    getUserConversations,
    getConversationMessages,
    markMessagesAsRead
}; 