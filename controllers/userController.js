const { userModel } = require("../models/user.model")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require("node:fs");
const cloudinary = require("cloudinary");
const transporter = require('../transporter');
const forgotEmail = require("../emails/forgotEmail");
const changePassword = require("../emails/changePassword");
const newAccountEmail = require("../emails/newAccountEmail");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const myTokenSecret = process.env.MYTOKENSECRET //creo secreto de firma para token

const getUsers = async (req, res) => {
    try {
        const users = await userModel.find({ removedAt: { $eq: null } })
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ msg: "Error getting user", error: error.message })
    }
}

const getUserId = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id)
        if (user) { return res.status(200).json(user) }
        else return res.status(404).json({ msg: "User not found" })
    } catch (error) {
        return res.status(403).json({ msg: "Forbidden", error: error.message })
    }
}

const updateUser = async (req, res) => {
    try {
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10) //si cambio contraseña, la encripto
            const data = await userModel.findByIdAndUpdate(req.params.id, {
                ...req.body,
                password: hashedPassword,
                status: "active",
            })
            res.status(200).json(data)
        }
        else {
            const user = await userModel.findByIdAndUpdate(req.params.id, { ...req.body })
            if (user) { return res.status(200).json(user) }
            else return res.status(404).json({ msg: "User not found" })
        }
    } catch (error) {
        res.status(400).json({ msg: "You missed some parameter", error: error.message })
    }
}

const updatePhoto = async (req, res) => {
    try {
        const updateData = req.body;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            fs.unlinkSync(req.file.path);
            updateData.profilePic = result.url;
        }
        const photo = await userModel.findByIdAndUpdate(req.params.id, updateData)
        if (photo) { return res.status(200).json({ msg: "Photo updated" }) }
        else return res.status(404).json({ msg: "Photo not found" })
    } catch (error) {
        res.status(400).json({ msg: "You missed some parameter", error: error.message })
    }
}

const registerUser = async (req, res) => {
    const { email } = req.body
    try {
        const userChecked = await userModel.findOne({ email: email }) //busco email en BD
        if (userChecked) {
            return res.status(500).json({ msg: "This email already exist" })
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10) //encripto contraseña
        const user = await userModel.create({ //creo usuario con contraseña encriptada
            ...req.body,
            password: hashedPassword,
            profilePicture: "https://res.cloudinary.com/dloxlkff8/image/upload/v1748196454/Daisy_mhsxsf.png"
        })
        //El cliente debe crear contraseña de su nueva cuenta
        if (user) {
            const sendingEmail = newAccountEmail(user._id, user.fullName)
            const newEmail = {
                from: "angtoral.dev@gmail.com",
                to: email,
                subject: "Welcome to Pawsitive! 🐾",
                html: sendingEmail,
            };
            transporter.sendMail(newEmail, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });
            console.log("Email sent")
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(400).json({ msg: "You missed some parameter", error: error.message })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const userChecked = await userModel.findOne({ email: email }) //busco email en BD
        if (!userChecked) return res.status(404).json({ msg: "This email is not registered" })
        if (userChecked.removedAt) return res.status(404).json({ msg: "Email is no longer active" })
        if (userChecked.status === "inactive") return res.status(404).json({ msg: "You have to change your password first" })
        const passwordChecked = await bcrypt.compare(req.body.password, userChecked.password) // si existe email, verificamos si la contraseña es correcta
        if (passwordChecked) { //generamos token de ingreso si la contraseña es correcta
            const token = jwt.sign({ //creo token con esta info
                id: userChecked._id,
                name: userChecked.name,
                lastname: userChecked.lastname,
                email: userChecked.email
            }, myTokenSecret, //doy secreto de validación
                { expiresIn: '1h' } //expira en 1h el token
            )
            console.log("token: ", token)
            return res.status(200).json(token)
        }
        return res.status(404).json({ msg: "Wrong password" })
    } catch (error) {
        res.status(400).json({ msg: "You missed some parameter", error: error.message })
    }
}

const verifyToken = async (req, res, next) => { //middleware que verifica token activo
    try {
        const token = req.headers.authorization.split(' ')[1]; // nos quedamos con el token antes de Bearer
        const decodedToken = jwt.verify(token, myTokenSecret)
        req.user = decodedToken;
        next()
    } catch (error) {
        res.status(403).json({ msg: "You are not authenticated", error })
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndUpdate(req.params.id, { removedAt: new Date(), })
        if (user) { return res.status(200).json(user) }
        else return res.status(404).json({ msg: "User not found" })
    } catch (error) {
        res.status(403).json({ msg: "Forbidden", error: error.message })
    }
}

// Si se olvida la contraseña fuera del login
const forgotPasswordEmail = async (req, res) => {
    const { email } = req.body
    try {
        const user = await userModel.findOne({ email: email })
        if (!user) res.status(404).json({ msg: "This email is not registered" })
        if (user) {
            const sendingEmail = forgotEmail(user._id)
            const forgottenEmail = {
                from: "angtoral.dev@gmail.com",
                to: email,
                subject: "Reset password 🔑",
                html: sendingEmail,
            };
            transporter.sendMail(forgottenEmail, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });
            console.log("Email sent")
            res.status(200).json(user);
        }
    }
    catch {
        res.status(500).json({ msg: "Error" })
    }
}

//Quiere cambiar la contraseña dentro del login
const sendChangePassword = async (req, res) => {
    const { email } = req.body
    try {
        const user = await userModel.findOne({ email: email })
        const sendingEmail = changePassword(user._id)
        if (user) {
            const newEmail = {
                from: "angtoral.dev@gmail.com",
                to: email,
                subject: "Change your password 🔑",
                html: sendingEmail,
            };
            transporter.sendMail(newEmail, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });
            console.log("Email sent")
            res.status(200).json(user);
        }
        if (!user) res.status(404).json({ msg: "This email is not registered" })
    }
    catch {
        res.status(500).json({ msg: "Error" })
    }
}

const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow.followers.includes(req.user.id)) {
            userToFollow.followers.push(req.user.id);
            currentUser.following.push(userToFollow._id);
            await userToFollow.save();
            await currentUser.save();
            await createNotification('follow', req.user.id, userToFollow._id);
            res.json({ message: 'User followed' });
        } else {
            userToFollow.followers.pull(req.user.id);
            currentUser.following.pull(userToFollow._id);
            await userToFollow.save();
            await currentUser.save();
            res.json({ message: 'User unfollowed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getUsers,
    getUserId,
    updateUser,
    updatePhoto,
    registerUser,
    login,
    verifyToken,
    deleteUser,
    forgotPasswordEmail,
    sendChangePassword,
    followUser

}