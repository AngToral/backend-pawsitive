const { postModel } = require('../models/post.model');
const { followModel } = require('../models/follow.model');
const { userModel } = require('../models/user.model');
const mongoose = require('mongoose');

// Obtener feed personalizado
const getFeed = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Obtener lista de usuarios seguidos
        const following = await followModel.find({
            follower: userId,
            status: 'accepted'
        }).select('following');

        const followingIds = following.map(f => f.following);
        // Incluir también los posts del usuario actual
        followingIds.push(userId);

        // Obtener posts de usuarios seguidos y del usuario actual
        const posts = await postModel.find({
            user: { $in: followingIds },
            removedAt: null
        })
            .populate('user', 'username fullName profilePicture')
            .populate({
                path: 'comments',
                select: 'content user createdAt',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                },
                options: { limit: 3, sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Contar total de posts para paginación
        const totalPosts = await postModel.countDocuments({
            user: { $in: followingIds },
            removedAt: null
        });

        res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener feed', error: error.message });
    }
};

// Obtener posts sugeridos (de usuarios no seguidos)
const getExplorePosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Obtener usuarios seguidos
        const following = await followModel.find({
            follower: userId
        }).select('following');
        const followingIds = following.map(f => f.following);
        followingIds.push(userId); // Excluir también los posts propios

        // Obtener posts de usuarios no seguidos
        const posts = await postModel.find({
            user: { $nin: followingIds },
            removedAt: null
        })
            .populate('user', 'username fullName profilePicture')
            .populate({
                path: 'comments',
                select: 'content user createdAt',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                },
                options: { limit: 3, sort: { createdAt: -1 } }
            })
            .sort({
                likesCount: -1, // Primero los posts más populares
                createdAt: -1   // Luego los más recientes
            })
            .skip(skip)
            .limit(limit);

        const totalPosts = await postModel.countDocuments({
            user: { $nin: followingIds },
            removedAt: null
        });

        res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener posts sugeridos', error: error.message });
    }
};

// Obtener posts de un hashtag específico
const getHashtagPosts = async (req, res) => {
    try {
        const { hashtag } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await postModel.find({
            caption: new RegExp(`#${hashtag}\\b`, 'i'),
            removedAt: null
        })
            .populate('user', 'username fullName profilePicture')
            .populate({
                path: 'comments',
                select: 'content user createdAt',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                },
                options: { limit: 3, sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await postModel.countDocuments({
            caption: new RegExp(`#${hashtag}\\b`, 'i'),
            removedAt: null
        });

        res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener posts por hashtag', error: error.message });
    }
};

// Obtener posts guardados
const getSavedPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await userModel.findById(userId)
            .populate({
                path: 'savedPosts',
                populate: [
                    {
                        path: 'user',
                        select: 'username fullName profilePicture'
                    },
                    {
                        path: 'comments',
                        select: 'content user createdAt',
                        populate: {
                            path: 'user',
                            select: 'username profilePicture'
                        },
                        options: { limit: 3, sort: { createdAt: -1 } }
                    }
                ],
                options: {
                    sort: { createdAt: -1 },
                    skip: skip,
                    limit: limit
                }
            });

        const totalPosts = user.savedPosts.length;

        res.status(200).json({
            posts: user.savedPosts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener posts guardados', error: error.message });
    }
};

module.exports = {
    getFeed,
    getExplorePosts,
    getHashtagPosts,
    getSavedPosts
}; 