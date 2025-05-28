const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    likePost,
    unlikePost,
    getLikes
} = require('../controllers/likeController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Dar like a un post
router.post('/post/:postId', likePost);

// Quitar like de un post
router.delete('/post/:postId', unlikePost);

// Obtener likes de un post
router.get('/post/:postId', getLikes);

module.exports = { likeRouter: router }; 