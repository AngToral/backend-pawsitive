const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'message'],
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'postModel'
    },
    read: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

const notificationModel = mongoose.model("notificationModel", notificationSchema);

module.exports = { notificationModel }