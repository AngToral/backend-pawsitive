const commentModel = require('../models/comment.model');
const postModel = require('../models/post.model');


// Crear un nuevo comentario
const createComment = async (req, res) => {
    const { text } = req.body;
    const userId = req.user._id; // Asegúrate de que el usuario esté autenticado
    const postId = req.params.postId;
    try {
        // Verificar si el post existe
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        // Crear el comentario
        const newComment = new commentModel({
            post: postId,
            user: userId,
            text: text,
        });

        await newComment.save();
        return res.status(201).json({ message: 'Comentario creado exitosamente', comment: newComment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el comentario' });
    }
};

// Obtener todos los comentarios de un post
const getCommentsByPost = async (req, res) => {
    const { postId } = req.params;

    try {
        // Obtener todos los comentarios asociados al post
        const comments = await commentModel.find({ post: postId })
            .populate('user', 'name email') // Poblamos los datos del usuario que hizo el comentario
            .populate('likes', 'name email') // Poblamos los datos de los usuarios que le dieron like
            .populate('replies.user', 'name email') // Poblamos los datos de los usuarios que respondieron
            .sort({ createdAt: -1 }); // Ordenar los comentarios por fecha de creación

        if (!comments || comments.length === 0) {
            return res.status(404).json({ message: 'No hay comentarios para este post' });
        }

        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los comentarios' });
    }
};

// Agregar un like a un comentario
const likeComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Asegúrate de que el usuario esté autenticado

    try {
        // Buscar el comentario
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        // Verificar si el usuario ya le dio like
        if (comment.likes.includes(userId)) {
            return res.status(400).json({ message: 'Ya le diste like a este comentario' });
        }

        // Agregar el like al comentario
        comment.likes.push(userId);
        await comment.save();

        return res.status(200).json({ message: 'Like agregado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al agregar el like' });
    }
};

// Eliminar un comentario
const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Asegúrate de que el usuario esté autenticado

    try {
        // Buscar el comentario
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        // Verificar si el usuario es el autor del comentario o un administrador
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'No tienes permisos para eliminar este comentario' });
        }

        // Eliminar el comentario
        await comment.remove();

        return res.status(200).json({ message: 'Comentario eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar el comentario' });
    }
};

// Agregar una respuesta a un comentario
const addReply = async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id; // Asegúrate de que el usuario esté autenticado

    try {
        // Buscar el comentario
        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        // Agregar la respuesta
        const newReply = {
            user: userId,
            text: text,
        };

        comment.replies.push(newReply);
        await comment.save();

        return res.status(201).json({ message: 'Respuesta agregada exitosamente', comment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al agregar la respuesta' });
    }
};

module.exports = {
    createComment,
    getCommentsByPost,
    likeComment,
    deleteComment,
    addReply,
};