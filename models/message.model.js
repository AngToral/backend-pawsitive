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
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    content: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const messageModel = mongoose.model("messageModel", messageSchema);

module.exports = { messageModel }