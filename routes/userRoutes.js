const express = require("express");
const { getUsers, getUserId, updateUser, updatePhoto, registerUser, login, deleteUser, forgotPasswordEmail, sendChangePassword, } = require("../controllers/userController");
const multer = require('multer');

const userRouter = express.Router();
const ProfilePicUpload = multer({ dest: './images-profile' })

userRouter.get('/', getUsers)
userRouter.get('/:id?', getUserId)
userRouter.put('/:id?', updateUser)
userRouter.put('/update/:id?', ProfilePicUpload.single('profilePic'), updatePhoto)
userRouter.post('/register', registerUser)
userRouter.post('/login', login)
userRouter.delete('/:id?', deleteUser)
userRouter.post('/forgottenpassword', forgotPasswordEmail) // Si se olvida la contraseña fuera del login
userRouter.post('/changepassword', sendChangePassword) //Si quieres cambiar la contraseña dentro del login

module.exports = { userRouter }
