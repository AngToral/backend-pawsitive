const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['dog', 'cat', 'bird', 'fish', 'reptile', 'rodent', 'other']
    },
    breed: String,
    birthday: Date,
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    profilePicture: {
        type: String,
        default: 'default-pet.jpg'
    },
    bio: String,
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'postModel'
    }]
},
    { timestamps: true }
);

const pet = mongoose.model("petModel", petSchema);

module.exports = { pet }