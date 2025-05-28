const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'messageModel'
    },
    name: String,
    isGroup: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'messageModel'
    }]
},
    { timestamps: true }
);

const conversationModel = mongoose.model("conversationModel", conversationSchema);

module.exports = { conversationModel }