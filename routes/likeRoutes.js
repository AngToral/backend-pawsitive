const express = require('express');
const {
    toggleLike,
    getLikeUsers
} = require('../controllers/likeController');
const { authMiddleware } = require('../middleware/authMiddleware');

const likeRouter = express.Router();

// Todas las rutas requieren autenticación
likeRouter.use(authMiddleware);

// Dar/quitar like a un post
likeRouter.post('/post/:postId', toggleLike);

// Obtener usuarios que dieron like a un post
likeRouter.get('/post/:postId/users', getLikeUsers);

module.exports = { likeRouter }; 