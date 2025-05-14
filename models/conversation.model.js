const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'message'
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
        ref: 'message'
    }]
},
    { timestamps: true }
);

module.exports = mongoose.model('conversation', conversationSchema);