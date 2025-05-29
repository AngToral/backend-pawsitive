const express = require('express');
const {
    getFeed,
    getExplorePosts,
    getHashtagPosts,
    getSavedPosts
} = require('../controllers/feedController');
const { authMiddleware } = require('../middleware/authMiddleware');

const feedRouter = express.Router();

// Todas las rutas requieren autenticación
feedRouter.use(authMiddleware);

// Obtener feed principal del usuario
feedRouter.get('/', getFeed);

// Obtener feed de exploración
feedRouter.get('/explore', getExplorePosts);

// Obtener feed por hashtag
feedRouter.get('/hashtag/:hashtag', getHashtagPosts);

// Obtener posts guardados
feedRouter.get('/saved', getSavedPosts);

module.exports = { feedRouter }; 