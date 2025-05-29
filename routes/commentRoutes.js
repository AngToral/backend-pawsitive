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

// Crear un nuevo comentario
commentRouter.post('/', createComment);

// Obtener comentarios de un post
commentRouter.get('/post/:postId', getPostComments);

// Eliminar un comentario
commentRouter.delete('/:commentId', deleteComment);

module.exports = { commentRouter };