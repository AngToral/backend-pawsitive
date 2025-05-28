const express = require('express');
const {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getUser,
    searchUsers,
    verifyEmail,
    requestPasswordReset,
    resetPassword
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const userRouter = express.Router();

// Rutas públicas
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/verify/:token', verifyEmail);
userRouter.post('/request-reset', requestPasswordReset);
userRouter.post('/reset-password', resetPassword);

// Rutas protegidas
userRouter.use(authMiddleware);
userRouter.put('/update', uploadSingle, updateUser);
userRouter.delete('/', deleteUser);
userRouter.get('/:username', getUser);
userRouter.get('/search/:query', searchUsers);

module.exports = { userRouter };
