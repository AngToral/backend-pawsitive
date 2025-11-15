const express = require('express');
const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
} = require('../controllers/postController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadMultiple, handleMultlerError } = require('../middleware/uploadMiddleware');

const postRouter = express.Router();
// Todas las rutas requieren autenticación
postRouter.use(authMiddleware);

// Rutas para posts
postRouter.route('/')
    .get(getAllPosts)
    .post(uploadMultiple, createPost);

postRouter.route('/:id')
    .get(getPostById)
    .put(uploadMultiple, updatePost)
    .delete(deletePost);

module.exports = { postRouter };