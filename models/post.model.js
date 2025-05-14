const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    caption: {
        type: String,
        maxLength: 2200
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: String
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    location: String,
    tags: [String],
    // Para etiquetar mascotas o personas en la foto
    petTags: [{
        type: Schema.Types.ObjectId,
        ref: 'Pet'
    }],
    userTags: [{
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    }],
    // Hashtags para categorizar el contenido
    hashtags: [String],
    // Características adicionales
    allowComments: {
        type: Boolean,
        default: true
    },
    removedAt: Date
},
    { timestamps: true }
);

module.exports = mongoose.model('post', postSchema);