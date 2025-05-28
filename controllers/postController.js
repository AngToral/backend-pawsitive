const { postModel } = require("../models/post.model");
const fs = require("node:fs");
const cloudinary = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.find({ removedAt: null })
            .sort({ createdAt: -1 })
            .populate('user', 'username')
            .populate('likes', 'username')
            .populate('comments');

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los posts', error });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id)
            .populate('user', 'username')
            .populate('likes', 'username')
            .populate('comments');

        if (!post || post.removedAt) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el post', error });
    }
};

const createPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const result = await cloudinary.uploader.upload(req.file.path)
        fs.unlinkSync(req.file.path);
        console.log("result", result)
        const photo = await postModel.create({ caption, postImage: result.url })
        console.log(photo)
        res.status(201).json({ msg: "Post creado", id: photo._id })
    } catch (error) {
        res.status(400).json({ msg: "Ha habido un error", error: error.message })
    }
}

const updatePost = async (req, res) => {
    try {
        const updateData = req.body;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            fs.unlinkSync(req.file.path);
            updateData.postImage = result.url;
        }
        const photo = await postModel.findByIdAndUpdate(req.params.id, updateData)
        if (photo) { return res.status(200).json({ msg: "Post actualizado" }) }
        else return res.status(404).json({ msg: "Post no encontrado" })
    } catch (error) {
        res.status(400).json({ msg: "Ha habido un error", error: error.message })
    }
}

const deletePost = async (req, res) => {
    try {
        const photo = await postModel.findByIdAndUpdate(req.params.id, { removedAt: new Date(), })
        if (photo) { return res.status(200).json({ msg: "Post eliminado exitosamente" }) }
        else return res.status(404).json({ msg: "Post no encontrado" })
    } catch (error) {
        res.status(403).json({ msg: "Prohibido", error: error.message })
    }
}

const toggleLike = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        const userId = req.user._id;

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        const index = post.likes.indexOf(userId);
        if (index > -1) {
            post.likes.splice(index, 1); // Quitar like
        } else {
            post.likes.push(userId); // Agregar like
        }

        await post.save();
        res.status(200).json({ likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: 'Error al modificar el like', error });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike
};