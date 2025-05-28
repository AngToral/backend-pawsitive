const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    getFeed,
    getExplorePosts,
    getHashtagPosts,
    getSavedPosts
} = require('../controllers/feedController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener feed personalizado
router.get('/', getFeed);

// Obtener posts sugeridos (explorar)
router.get('/explore', getExplorePosts);

// Obtener posts por hashtag
router.get('/hashtag/:hashtag', getHashtagPosts);

// Obtener posts guardados
router.get('/saved', getSavedPosts);

module.exports = { feedRouter: router }; 