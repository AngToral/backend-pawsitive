const { commentModel } = require('../models/comment.model');
const { postModel } = require('../models/post.model');
const { notificationModel } = require('../models/notification.model');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');

// Crear un nuevo comentario
const createComment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { text } = req.body;
        const { postId } = req.params;
        const userId = req.user._id;

        // Verificar que el post existe
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        // Crear el comentario
        const comment = await commentModel.create([{
            post: postId,
            user: userId,
            text
        }], { session });

        // Añadir el comentario al post
        await postModel.findByIdAndUpdate(postId, {
            $push: { comments: comment[0]._id }
        }, { session });

        // Crear notificación si el comentario no es del propio usuario del post
        if (post.user.toString() !== userId.toString()) {
            await createNotification({
                type: 'comment',
                recipient: post.user,
                sender: userId,
                post: postId,
                comment: comment[0]._id
            }, session);
        }

        await session.commitTransaction();

        // Poblar el comentario con datos del usuario
        const populatedComment = await comment[0].populate('user', 'username profileImage');

        res.status(201).json(populatedComment);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al crear comentario', error: error.message });
    } finally {
        session.endSession();
    }
};

// Obtener comentarios de un post
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await commentModel.find({ post: postId })
            .populate('user', 'username profileImage')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalComments = await commentModel.countDocuments({ post: postId });

        res.status(200).json({
            comments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalComments / limit),
                totalComments
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener comentarios', error: error.message });
    }
};

// Eliminar un comentario
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        // Verificar que el usuario es el autor del comentario o del post
        const post = await postModel.findById(comment.post);
        if (comment.user.toString() !== userId.toString() && post.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'No autorizado para eliminar este comentario' });
        }

        // Eliminar el comentario
        await commentModel.findByIdAndDelete(commentId);

        // Eliminar la referencia del comentario en el post
        await postModel.findByIdAndUpdate(comment.post, {
            $pull: { comments: commentId }
        });

        // Eliminar la notificación relacionada si existe
        await notificationModel.deleteOne({
            type: 'comment',
            comment: commentId
        });

        res.status(200).json({ message: 'Comentario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar comentario', error: error.message });
    }
};

module.exports = {
    createComment,
    getPostComments,
    deleteComment
};