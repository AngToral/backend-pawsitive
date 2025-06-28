const { followModel } = require('../models/follow.model');
const { userModel } = require('../models/user.model');
const { notificationModel } = require('../models/notification.model');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');

// Función auxiliar para actualizar contadores
const updateFollowCounts = async (followerId, followingId, increment) => {
    const inc = increment ? 1 : -1;

    await Promise.all([
        // Actualizar contador de following para el follower
        userModel.findByIdAndUpdate(followerId, {
            $inc: { followingCount: inc }
        }),
        // Actualizar contador de followers para el following
        userModel.findByIdAndUpdate(followingId, {
            $inc: { followersCount: inc }
        })
    ]);
};

// Seguir a un usuario
const followUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const followerId = req.user._id;
        const { userId: followingId } = req.params;

        // Verificar que no se está intentando seguir a sí mismo
        if (followerId.toString() === followingId) {
            return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });
        }

        // Verificar que el usuario a seguir existe
        const userToFollow = await userModel.findById(followingId);
        if (!userToFollow) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si ya sigue al usuario
        const existingFollow = await followModel.findOne({
            follower: followerId,
            following: followingId
        });

        if (existingFollow) {
            return res.status(400).json({ message: 'Ya sigues a este usuario' });
        }

        // Crear la relación de seguimiento
        const follow = await followModel.create([{
            follower: followerId,
            following: followingId,
            status: userToFollow.isPrivate ? 'pending' : 'accepted'
        }], { session });

        // Si la cuenta no es privada, actualizar contadores y crear notificación
        if (!userToFollow.isPrivate) {
            await updateFollowCounts(followerId, followingId, true);

            await createNotification({
                type: 'follow',
                recipient: followingId,
                sender: followerId
            }, session);
        }

        await session.commitTransaction();

        res.status(201).json({
            message: userToFollow.isPrivate ?
                'Solicitud de seguimiento enviada' :
                'Usuario seguido correctamente',
            status: follow[0].status
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al seguir usuario', error: error.message });
    } finally {
        session.endSession();
    }
};

// Dejar de seguir a un usuario
const unfollowUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const followerId = req.user._id;
        const { userId: followingId } = req.params;

        const follow = await followModel.findOne({
            follower: followerId,
            following: followingId
        });

        if (!follow) {
            return res.status(404).json({ message: 'No sigues a este usuario' });
        }

        // Si el estado era 'accepted', actualizar contadores
        if (follow.status === 'accepted') {
            await updateFollowCounts(followerId, followingId, false);
        }

        await followModel.deleteOne({ _id: follow._id }).session(session);

        // Eliminar notificación relacionada si existe
        await notificationModel.deleteOne({
            type: 'follow',
            recipient: followingId,
            sender: followerId
        }).session(session);

        await session.commitTransaction();
        res.status(200).json({ message: 'Usuario dejado de seguir correctamente' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al dejar de seguir usuario', error: error.message });
    } finally {
        session.endSession();
    }
};

// Obtener seguidores
const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const followers = await followModel.find({
            following: userId,
            status: 'accepted'
        })
            .populate('follower', 'username fullName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalFollowers = await followModel.countDocuments({
            following: userId,
            status: 'accepted'
        });

        res.status(200).json({
            followers: followers.map(f => f.follower),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalFollowers / limit),
                totalFollowers
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener seguidores', error: error.message });
    }
};

// Obtener usuarios seguidos
const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const following = await followModel.find({
            follower: userId,
            status: 'accepted'
        })
            .populate('following', 'username fullName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalFollowing = await followModel.countDocuments({
            follower: userId,
            status: 'accepted'
        });

        res.status(200).json({
            following: following.map(f => f.following),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalFollowing / limit),
                totalFollowing
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios seguidos', error: error.message });
    }
};

// Aceptar solicitud de seguimiento (para cuentas privadas)
const acceptFollowRequest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { followerId } = req.params;

        const followRequest = await followModel.findOne({
            follower: followerId,
            following: userId,
            status: 'pending'
        });

        if (!followRequest) {
            return res.status(404).json({ message: 'Solicitud de seguimiento no encontrada' });
        }

        followRequest.status = 'accepted';
        await followRequest.save({ session });

        // Actualizar contadores
        await updateFollowCounts(followerId, userId, true);

        // Crear notificación de solicitud aceptada
        await createNotification({
            type: 'followAccepted',
            recipient: followerId,
            sender: userId
        }, session);

        await session.commitTransaction();
        res.status(200).json({ message: 'Solicitud de seguimiento aceptada' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al aceptar solicitud', error: error.message });
    } finally {
        session.endSession();
    }
};

// Rechazar solicitud de seguimiento
const rejectFollowRequest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { followerId } = req.params;

        const followRequest = await followModel.findOne({
            follower: followerId,
            following: userId,
            status: 'pending'
        });

        if (!followRequest) {
            return res.status(404).json({ message: 'Solicitud de seguimiento no encontrada' });
        }

        await followModel.deleteOne({ _id: followRequest._id }).session(session);

        await session.commitTransaction();
        res.status(200).json({ message: 'Solicitud de seguimiento rechazada' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al rechazar solicitud', error: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    acceptFollowRequest,
    rejectFollowRequest
}; 