const express = require("express");
const { getUsers, } = require("../controllers/userController");
const multer = require('multer');

const userRouter = express.Router();
const ProfilePicUpload = multer({ dest: './images-profile' })

userRouter.get('/', getUsers)

module.exports = { userRouter }
