const { postModel } = require("../models/post.model");

const getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.find({ removedAt: null })
            .sort({ createdAt: -1 })
            .populate('user', 'username avatar')
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
            .populate('user', 'username avatar')
            .populate('comments')
            .populate('likes', 'username');

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
        const { caption, images, location, tags, petTags, userTags, hashtags } = req.body;
        const user = req.user._id;

        const newPost = new postModel({
            user,
            caption,
            images,
            location,
            tags,
            petTags,
            userTags,
            hashtags
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el post', error });
    }
};

const updatePost = async (req, res) => {
    try {
        const post = await postModel.findByIdAndUpdate(req.params.id, { ...req.body })
        if (post) { return res.status(200).json({ msg: "Post actualizado" }) }
        else return res.status(404).json({ msg: "Post no encontrado" })
    } catch (error) {
        res.status(400).json({ msg: "Ha habido un error", error: error.message })
    }
}

const deletePost = async (req, res) => {
    try {
        const post = await postModel.findByIdAndUpdate(
            req.params.id,
            { removedAt: new Date() },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        res.status(200).json({ message: 'Post eliminado (soft delete)', post });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el post', error });
    }
};

// const toggleLike = async (req, res) => {
//     try {
//         const post = await postModel.findById(req.params.id);
//         const userId = req.user._id;

//         if (!post) {
//             return res.status(404).json({ message: 'Post no encontrado' });
//         }

//         const index = post.likes.indexOf(userId);
//         if (index > -1) {
//             post.likes.splice(index, 1); // Quitar like
//         } else {
//             post.likes.push(userId); // Agregar like
//         }

//         await post.save();
//         res.status(200).json({ likes: post.likes });
//     } catch (error) {
//         res.status(500).json({ message: 'Error al modificar el like', error });
//     }
// };

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};