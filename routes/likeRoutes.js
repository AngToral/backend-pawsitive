const express = require('express');
const {
    likePost,
    unlikePost,
    getLikes
} = require('../controllers/likeController');
const { authMiddleware } = require('../middleware/authMiddleware');

const likeRouter = express.Router();

// Todas las rutas requieren autenticación
likeRouter.use(authMiddleware);

// Dar like a un post
likeRouter.post('/post/:postId', likePost);

// Quitar like de un post
likeRouter.delete('/post/:postId', unlikePost);

// Obtener likes de un post
likeRouter.get('/post/:postId', getLikes);

module.exports = { likeRouter }; 