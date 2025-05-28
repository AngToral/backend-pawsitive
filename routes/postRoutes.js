const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadMultiple, handleMulterError } = require('../middleware/uploadMiddleware');
const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike
} = require('../controllers/postController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los posts
router.get('/', getAllPosts);

// Obtener un post específico
router.get('/:id', getPostById);

// Crear un nuevo post
router.post('/', uploadMultiple, handleMulterError, createPost);

// Actualizar un post
router.put('/:id', uploadMultiple, handleMulterError, updatePost);

// Eliminar un post
router.delete('/:id', deletePost);

// Dar/quitar like a un post
router.post('/:id/like', toggleLike);

module.exports = { postRouter: router };