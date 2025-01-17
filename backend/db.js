const mongoose = require('mongoose')
const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI);

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 30,
        lowercase: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxLength: 50,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxLength: 50,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8
    }
})

const User = new mongoose.model('User',userSchema);

module.exports = {
    User
}