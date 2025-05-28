const express = require('express');
const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike
} = require('../controllers/postController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadMultiple, handleMulterError } = require('../middleware/uploadMiddleware');

const postRouter = express.Router();
// Todas las rutas requieren autenticación
postRouter.use(authMiddleware);

// Obtener todos los posts
postRouter.get('/', getAllPosts);

// Obtener un post específico
postRouter.get('/:id', getPostById);

// Crear un nuevo post
postRouter.post('/', uploadMultiple, handleMulterError, createPost);

// Actualizar un post
postRouter.put('/:id', uploadMultiple, handleMulterError, updatePost);

// Eliminar un post
postRouter.delete('/:id', deletePost);

// Dar/quitar like a un post
postRouter.post('/:id/like', toggleLike);

module.exports = { postRouter };