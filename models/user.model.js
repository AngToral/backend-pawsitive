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
    },
    bio: {
        type: String,
        maxLength: 150,
        default: ''
    },
    phoneNumber: String,
    gender: String,
    followersCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },
    postsCount: {
        type: Number,
        default: 0
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'postModel'
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'notificationModel'
    }],
    removedAt: Date
},
    { timestamps: true }
);

const userModel = mongoose.model("userModel", userSchema);

module.exports = { userModel }