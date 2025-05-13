const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    fullName: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: 'default-profile.jpg'
    },
    bio: {
        type: String,
        maxLength: 150,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    phoneNumber: String,
    gender: String,
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    savedPosts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Notification'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
},
    { timestamps: true }
);

const userModel = mongoose.model("userModel", userSchema);

module.exports = { userModel }