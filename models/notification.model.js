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
        enum: ['like', 'comment', 'follow', 'mention', 'tag', 'followRequest'],
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'post'
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'comment'
    },
    message: String,
    read: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('notification', notificationSchema);