const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'postModel',
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
},
    { timestamps: true }
);

const commentModel = mongoose.model("commentModel", commentSchema);

module.exports = { commentModel }