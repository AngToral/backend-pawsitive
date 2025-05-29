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
    updatePhoto
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
userRouter.put('/update', updateUser);
userRouter.put('/photo', uploadSingle, updatePhoto);
userRouter.delete('/', deleteUser);
userRouter.get('/search', getUsers);
userRouter.get('/:id', getUserId);

module.exports = { userRouter };
