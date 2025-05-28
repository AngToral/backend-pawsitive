const express = require("express");
const { getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost } = require("../controllers/postController");
const multer = require('multer');

const postRouter = express.Router();
const postUpload = multer({ dest: './images-post' })

postRouter.get('/', getAllPosts)
postRouter.get('/:id', getPostById)
postRouter.put('/update/:id', postUpload.single('postImage'), updatePost)
postRouter.post('/', postUpload.single('postImage'), createPost)
postRouter.delete('/:id', deletePost)

module.exports = { postRouter }