const express = require('express');
const { uploadMultiple, handleMultlerError } = require('../middleware/uploadMiddleware');
const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
} = require('../controllers/postController');
const { authMiddleware } = require('../middleware/authMiddleware');

const postRouter = express.Router();
// Todas las rutas requieren autenticación

// Rutas para posts
postRouter.route('/')
    .get(authMiddleware, getAllPosts)
    .post(uploadMultiple, authMiddleware, createPost);

postRouter.route('/:id')
    .get(authMiddleware, getPostById)
    .put(uploadMultiple, authMiddleware, updatePost)
    .delete(authMiddleware, deletePost);

module.exports = { postRouter };