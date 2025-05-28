const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followSchema = new Schema({
    follower: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    following: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'accepted' // Por defecto aceptado, pero útil para cuentas privadas en el futuro
    }
}, { timestamps: true });

// Índice compuesto para evitar duplicados
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const followModel = mongoose.model('followModel', followSchema);

module.exports = { followModel }; 