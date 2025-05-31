const express = require('express');
const {
    registerUser,
    login,
    updateUser,
    deleteUser,
    getUserId,
    getUsers,
    forgotPasswordEmail,
    sendChangePassword,
    updatePhoto,
    searchUsers
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const userRouter = express.Router();

// Rutas públicas
userRouter.post('/register', registerUser);
userRouter.post('/login', login);
userRouter.post('/forgot-password', forgotPasswordEmail);
userRouter.post('/change-password', sendChangePassword);

// Rutas protegidas
userRouter.use(authMiddleware);

// Ruta de búsqueda (debe ir antes de las rutas con :id)
userRouter.get('/search', searchUsers);

userRouter.put('/update/:id', updateUser);
userRouter.put('/photo/:id', uploadSingle, updatePhoto);
userRouter.delete('/:id', deleteUser);

userRouter.get('/:id', getUserId);

module.exports = { userRouter };
