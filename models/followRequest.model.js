const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followRequestSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('followRequestModel', followRequestSchema);