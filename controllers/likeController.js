const { postModel } = require('../models/post.model');
const { notificationModel } = require('../models/notification.model');
const mongoose = require('mongoose');

// Función auxiliar para actualizar contadores
const updatePostCounts = async (postId, session) => {
    const post = await postModel.findById(postId);
    if (!post) return;

    post.likesCount = post.likes.length;
    post.commentsCount = post.comments.length;
    await post.save({ session });
};

// Dar/quitar like a un post
const toggleLike = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        const hasLiked = post.likes.includes(userId);
        let action;

        if (hasLiked) {
            // Quitar like
            await postModel.findByIdAndUpdate(postId, {
                $pull: { likes: userId }
            }, { session });
            action = 'unliked';

            // Eliminar notificación de like si existe
            await notificationModel.deleteOne({
                type: 'like',
                recipient: post.user,
                sender: userId,
                post: postId
            }, { session });
        } else {
            // Dar like
            await postModel.findByIdAndUpdate(postId, {
                $addToSet: { likes: userId }
            }, { session });
            action = 'liked';

            // Crear notificación solo si el like no es del propio usuario del post
            if (post.user.toString() !== userId.toString()) {
                await notificationModel.create([{
                    type: 'like',
                    recipient: post.user,
                    sender: userId,
                    post: postId
                }], { session });
            }
        }

        // Actualizar contadores
        await updatePostCounts(postId, session);

        await session.commitTransaction();

        // Obtener el post actualizado para devolver el número correcto de likes
        const updatedPost = await postModel.findById(postId);

        res.status(200).json({
            message: `Post ${action} successfully`,
            likesCount: updatedPost.likes.length,
            action
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al procesar like', error: error.message });
    } finally {
        session.endSession();
    }
};

// Obtener usuarios que dieron like a un post
const getLikeUsers = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const post = await postModel.findById(postId)
            .populate({
                path: 'likes',
                select: 'username profileImage',
                options: {
                    skip: skip,
                    limit: limit
                }
            });

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        const totalLikes = post.likes.length;

        res.status(200).json({
            users: post.likes,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalLikes / limit),
                totalLikes
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

module.exports = {
    toggleLike,
    getLikeUsers
}; 