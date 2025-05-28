const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    createComment,
    getComments,
    updateComment,
    deleteComment
} = require('../controllers/commentController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear un nuevo comentario
router.post('/', createComment);

// Obtener comentarios de un post
router.get('/post/:postId', getComments);

// Actualizar un comentario
router.put('/:commentId', updateComment);

// Eliminar un comentario
router.delete('/:commentId', deleteComment);

module.exports = { commentRouter: router };