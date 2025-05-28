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
        maxLength: 2200
    },
    postImage: {
        type: String,
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'commentModel'
    }],
    allowComments: {
        type: Boolean,
        default: true
    },
    removedAt: Date
},
    { timestamps: true }
);

const postModel = mongoose.model("postModel", postSchema);

module.exports = { postModel }