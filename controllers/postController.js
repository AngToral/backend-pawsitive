const { postModel } = require("../models/post.model");
const { userModel } = require("../models/user.model");
const { notificationModel } = require("../models/notification.model");
const fs = require("node:fs");
const cloudinary = require("cloudinary");
const mongoose = require('mongoose');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función auxiliar para extraer menciones
const extractMentions = async (caption) => {
    const mentionUsernames = (caption.match(/@[a-zA-Z0-9_]+/g) || [])
        .map(mention => mention.slice(1).toLowerCase());

    const mentionedUsers = await userModel.find({
        username: { $in: mentionUsernames }
    }).select('_id');

    return mentionedUsers.map(user => user._id);
};

// Función auxiliar para subir imágenes a Cloudinary
// const uploadImages = async (files) => {
//     const uploadPromises = files.map(file =>
//         cloudinary.uploader.upload(file.path)
//             .then(result => {
//                 fs.unlinkSync(file.path);
//                 return {
//                     url: result.url,
//                     publicId: result.public_id
//                 };
//             })
//     );

//     return Promise.all(uploadPromises);
// };

const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        stream.end(file.buffer);
    });
};

const uploadImages = async (files) => {
    const results = [];
    for (const file of files) {
        const result = await uploadImage(file);
        results.push(result);
    }
    return results;
};

// Función auxiliar para actualizar contadores
const updatePostCounts = async (postId, session) => {
    const post = await postModel.findById(postId);
    if (!post) return;

    post.likesCount = post.likes.length;
    post.commentsCount = post.comments.length;
    await post.save({ session });
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.find({ removedAt: null })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture')
            .populate('mentions', 'username')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los posts', error: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id)
            .populate('user', 'username profilePicture')
            .populate('mentions', 'username')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            });

        if (!post || post.removedAt) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el post', error: error.message });
    }
};

const createPost = async (req, res) => {
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    console.log('req.user:', req.user);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { caption } = req.body;
        const userId = req.user._id;

        // Verificar que hay archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Se requiere al menos una imagen' });
        }

        // Subir imágenes a Cloudinary
        const uploadedImages = await uploadImages(req.files);

        // Extraer menciones
        const mentions = await extractMentions(caption);

        // Crear el post
        const post = await postModel.create([{
            user: userId,
            caption,
            images: uploadedImages,
            mentions,
            likesCount: 0,
            commentsCount: 0
        }], { session });

        // Actualizar el contador de posts del usuario
        await userModel.findByIdAndUpdate(
            userId,
            { $inc: { postsCount: 1 } },
            { session }
        );

        // Crear notificaciones para usuarios mencionados
        if (mentions.length > 0) {
            await notificationModel.create(mentions.map(mentionId => ({
                type: 'mention',
                user: mentionId,
                fromUser: userId,
                post: post[0]._id
            })), { session });
        }

        await session.commitTransaction();

        // Poblar los datos necesarios antes de enviar la respuesta
        const populatedPost = await postModel.findById(post[0]._id)
            .populate('user', 'username profilePicture')
            .populate('mentions', 'username');

        res.status(201).json(populatedPost);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: 'Error al crear el post', error: error.message });
    } finally {
        session.endSession();
    }
};

const updatePost = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { caption } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        // Verificar que el post existe y pertenece al usuario
        const post = await postModel.findOne({
            _id: postId,
            user: userId,
            removedAt: null
        });

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        // Extraer menciones
        const mentions = await extractMentions(caption);

        // Preparar datos de actualización
        const updateData = {
            caption,
            mentions
        };

        // Si hay nuevas imágenes, procesarlas
        if (req.files && req.files.length > 0) {
            // Eliminar imágenes antiguas de Cloudinary
            const deletePromises = post.images.map(image =>
                cloudinary.uploader.destroy(image.publicId)
            );
            await Promise.all(deletePromises);

            // Subir nuevas imágenes
            updateData.images = await uploadImages(req.files);
        }

        // Actualizar el post
        const updatedPost = await postModel.findByIdAndUpdate(
            postId,
            updateData,
            { new: true, session }
        ).populate('user', 'username profilePicture')
            .populate('mentions', 'username');

        await session.commitTransaction();
        res.status(200).json(updatedPost);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: 'Error al actualizar el post', error: error.message });
    } finally {
        session.endSession();
    }
};

const deletePost = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const postId = req.params.id;
        const userId = req.user._id;

        // Verificar que el post existe y pertenece al usuario
        const post = await postModel.findOne({
            _id: postId,
            user: userId,
            removedAt: null
        });

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        // Marcar el post como eliminado
        await postModel.findByIdAndUpdate(
            postId,
            { removedAt: new Date() },
            { session }
        );

        // Actualizar el contador de posts del usuario
        await userModel.findByIdAndUpdate(
            userId,
            { $inc: { postsCount: -1 } },
            { session }
        );

        await session.commitTransaction();
        res.status(200).json({ message: 'Post eliminado exitosamente' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error al eliminar el post', error: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};