const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    acceptFollowRequest,
    rejectFollowRequest,
    getPendingFollowRequests
} = require('../controllers/followController');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Seguir a un usuario
router.post('/:userId', followUser);

// Dejar de seguir a un usuario
router.delete('/:userId', unfollowUser);

// Obtener seguidores de un usuario
router.get('/:userId/followers', getFollowers);

// Obtener usuarios seguidos por un usuario
router.get('/:userId/following', getFollowing);

// Aceptar solicitud de seguimiento
router.put('/accept/:userId', acceptFollowRequest);

// Rechazar solicitud de seguimiento
router.put('/reject/:userId', rejectFollowRequest);

// Obtener solicitudes de seguimiento pendientes
router.get('/requests/pending', getPendingFollowRequests);

module.exports = { followRouter: router }; 