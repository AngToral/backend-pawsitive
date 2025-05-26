const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    conversation: {
        type: Schema.Types.ObjectId,
        ref: 'conversationModel',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    text: String,
    image: String,
    read: {
        type: Boolean,
        default: false
    },
    readBy: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'userModel'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
},
    { timestamps: true }
);

module.exports = mongoose.model('messageModel', messageSchema);