const { userModel } = require("../models/user.model")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require("node:fs");
const cloudinary = require("cloudinary");

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

module.exports = {
    getUsers
}