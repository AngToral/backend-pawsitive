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
        ref: 'commentModel'
    }],
    location: String,
    tags: [String],
    // Para etiquetar mascotas o personas en la foto
    petTags: [{
        type: Schema.Types.ObjectId,
        ref: 'petModel'
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

const postModel = mongoose.model("postModel", postSchema);

module.exports = { postModel }