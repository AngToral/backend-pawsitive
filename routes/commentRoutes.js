const express = require('express');
const {
    createComment,
    getComments,
    updateComment,
    deleteComment,
    likeComment
} = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');

const commentRouter = express.Router();

// Todas las rutas requieren autenticación
commentRouter.use(authMiddleware);

// Crear un nuevo comentario
commentRouter.post('/', createComment);

// Obtener comentarios de un post
commentRouter.get('/post/:postId', getComments);

// Actualizar un comentario
commentRouter.put('/:commentId', updateComment);

// Eliminar un comentario
commentRouter.delete('/:commentId', deleteComment);

// Dar/quitar like a un comentario
commentRouter.post('/:commentId/like', likeComment);

module.exports = { commentRouter };