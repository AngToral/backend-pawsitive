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
        enum: ['like', 'comment', 'follow', 'followAccepted', 'message'],
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'postModel'
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'commentModel'
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    }
},
    { timestamps: true }
);

// Índice para mejorar el rendimiento de las consultas
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

const notificationModel = mongoose.model("notificationModel", notificationSchema);

module.exports = { notificationModel }