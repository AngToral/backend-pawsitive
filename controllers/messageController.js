const { messageModel } = require('../models/message.model');
const { conversationModel } = require('../models/conversation.model');
const { notificationModel } = require('../models/notification.model');
const mongoose = require('mongoose');
const { io, emitToUser } = require('../websockets/websocket');

// Función auxiliar para actualizar la conversación
const updateConversation = async (conversationId, messageId, session) => {
    await conversationModel.findByIdAndUpdate(
        conversationId,
        {
            lastMessage: messageId,
            $addToSet: { messages: messageId }
        },
        { session }
    );
};

// Enviar un mensaje
const sendMessage = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { conversationId, content, type = 'text' } = req.body;
        const senderId = req.user._id;

        // Verificar que la conversación existe y el usuario es participante
        const conversation = await conversationModel.findOne({
            _id: conversationId,
            participants: senderId
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversación no encontrada' });
        }

        // Encontrar el receptor (el otro participante)
        const receiverId = conversation.participants
            .find(p => p.toString() !== senderId.toString());

        // Crear el mensaje
        const message = await messageModel.create([{
            conversation: conversationId,
            sender: senderId,
            receiver: receiverId,
            content,
            type
        }], { session });

        // Actualizar la conversación con el último mensaje
        await updateConversation(conversationId, message[0]._id, session);

        // Crear notificación
        await notificationModel.create([{
            type: 'message',
            recipient: receiverId,
            sender: senderId,
            conversation: conversationId
        }], { session });

        await session.commitTransaction();

        // Poblar el mensaje con datos del remitente
        const populatedMessage = await messageModel.findById(message[0]._id)
            .populate('sender', 'username profilePicture');

        // Emitir el mensaje al receptor a través de socket.io
        emitToUser(receiverId.toString(), 'receiveMessage', populatedMessage);

        res.status(201).json(populatedMessage);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al enviar mensaje', error: error.message });
    } finally {
        session.endSession();
    }
};

// Marcar mensaje como leído
const markMessageAsRead = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await messageModel.findOne({
            _id: messageId,
            receiver: userId,
            readAt: null
        });

        if (!message) {
            return res.status(404).json({ message: 'Mensaje no encontrado o ya leído' });
        }

        message.readAt = new Date();
        message.status = 'read';
        await message.save({ session });

        await session.commitTransaction();
        res.status(200).json({ message: 'Mensaje marcado como leído' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al marcar mensaje como leído', error: error.message });
    } finally {
        session.endSession();
    }
};

// Obtener mensajes de una conversación
const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verificar que el usuario es participante de la conversación
        const conversation = await conversationModel.findOne({
            _id: conversationId,
            participants: userId
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversación no encontrada' });
        }

        const messages = await messageModel.find({ conversation: conversationId })
            .populate('sender', 'username profilePicture')
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

// Eliminar mensaje
const deleteMessage = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await messageModel.findOne({
            _id: messageId,
            sender: userId
        });

        if (!message) {
            return res.status(404).json({ message: 'Mensaje no encontrado' });
        }

        // Si es el último mensaje de la conversación, actualizar lastMessage
        const conversation = await conversationModel.findById(message.conversation);
        if (conversation.lastMessage.toString() === messageId) {
            // Buscar el mensaje anterior
            const previousMessage = await messageModel.findOne({
                conversation: message.conversation,
                _id: { $ne: messageId }
            })
                .sort({ createdAt: -1 });

            if (previousMessage) {
                conversation.lastMessage = previousMessage._id;
            } else {
                conversation.lastMessage = null;
            }
            await conversation.save({ session });
        }

        // Eliminar el mensaje
        await messageModel.deleteOne({ _id: messageId }).session(session);

        // Eliminar la referencia en la conversación
        await conversationModel.updateOne(
            { _id: message.conversation },
            { $pull: { messages: messageId } }
        ).session(session);

        await session.commitTransaction();
        res.status(200).json({ message: 'Mensaje eliminado correctamente' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al eliminar mensaje', error: error.message });
    } finally {
        session.endSession();
    }
};

// Buscar mensajes por término dentro de una conversación
const searchMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { term } = req.query;
        const userId = req.user._id;

        // Verificar que el usuario es participante de la conversación
        const conversation = await conversationModel.findOne({
            _id: conversationId,
            participants: userId
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversación no encontrada' });
        }

        // Buscar mensajes que contengan el término (insensible a mayúsculas/minúsculas)
        const messages = await messageModel.find({
            conversation: conversationId,
            content: { $regex: term, $options: 'i' }
        }).populate('sender', 'username profilePicture')
            .sort({ createdAt: 1 });

        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar mensajes', error: error.message });
    }
};

module.exports = {
    sendMessage,
    markMessageAsRead,
    getConversationMessages,
    deleteMessage,
    searchMessages
};
