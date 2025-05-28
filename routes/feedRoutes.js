const express = require('express');
const {
    getFeed,
    getExplore,
    getHashtagFeed,
    getUserFeed
} = require('../controllers/feedController');
const { authMiddleware } = require('../middleware/authMiddleware');

const feedRouter = express.Router();

// Todas las rutas requieren autenticación
feedRouter.use(authMiddleware);

// Obtener feed principal del usuario
feedRouter.get('/', getFeed);

// Obtener feed de exploración
feedRouter.get('/explore', getExplore);

// Obtener feed por hashtag
feedRouter.get('/hashtag/:tag', getHashtagFeed);

// Obtener feed de un usuario específico
feedRouter.get('/user/:userId', getUserFeed);

module.exports = { feedRouter }; 