const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    text: {
        type: String,
        required: true,
        maxLength: 1000
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    replies: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'userModel'
        },
        text: {
            type: String,
            required: true,
            maxLength: 1000
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: 'userModel'
        }]
    }]
},
    { timestamps: true }
);

module.exports = mongoose.model('comment', commentSchema);