const express = require('express');
const {
    createComment,
    getPostComments,
    deleteComment
} = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');

const commentRouter = express.Router();

// Todas las rutas requieren autenticación
commentRouter.use(authMiddleware);

// Crear un nuevo comentario y obtener comentarios de un post
commentRouter.route('/posts/:postId/comments')
    .post(createComment)    // Crear comentario
    .get(getPostComments); // Obtener comentarios

// Eliminar un comentario
commentRouter.delete('/comments/:commentId', deleteComment);

module.exports = { commentRouter };