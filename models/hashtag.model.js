const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hashtagSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'postModel'
    }],
    count: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('hashtagModel', hashtagSchema);
