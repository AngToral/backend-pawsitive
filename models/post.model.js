const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    }],
    mentions: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'commentModel'
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    removedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const postModel = mongoose.model('postModel', postSchema);

module.exports = { postModel };