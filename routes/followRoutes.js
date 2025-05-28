const express = require('express');
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    acceptFollowRequest,
    rejectFollowRequest,
    getPendingFollowRequests
} = require('../controllers/followController');
const { authMiddleware } = require('../middleware/authMiddleware');

const followRouter = express.Router();

// Todas las rutas requieren autenticación
followRouter.use(authMiddleware);

// Seguir a un usuario
followRouter.post('/:userId', followUser);

// Dejar de seguir a un usuario
followRouter.delete('/:userId', unfollowUser);

// Obtener seguidores de un usuario
followRouter.get('/:userId/followers', getFollowers);

// Obtener usuarios seguidos por un usuario
followRouter.get('/:userId/following', getFollowing);

// Aceptar solicitud de seguimiento
followRouter.put('/accept/:userId', acceptFollowRequest);

// Rechazar solicitud de seguimiento
followRouter.put('/reject/:userId', rejectFollowRequest);

// Obtener solicitudes de seguimiento pendientes
followRouter.get('/requests/pending', getPendingFollowRequests);

module.exports = { followRouter }; 