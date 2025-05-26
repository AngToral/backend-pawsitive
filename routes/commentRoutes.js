const express = require("express");
const { createComment,
    getCommentsByPost,
    likeComment,
    deleteComment,
    addReply, } = require("../controllers/commentController");

const commentRouter = express.Router();

// Ruta para crear un comentario
router.post('/create', createComment);

// Ruta para obtener todos los comentarios de un post específico
router.get('/post/:postId', getCommentsByPost);

// Ruta para agregar un like a un comentario
router.put('/like/:commentId', likeComment);

// Ruta para eliminar un comentario
router.delete('/:commentId', deleteComment);

// Ruta para agregar una respuesta a un comentario
router.post('/reply/:commentId', addReply);

module.exports = { commentRouter }