const mongoose = require('mongoose');
const { number } = require('zod');
require('dotenv').config();

(async ()=>{
    try{
        await mongoose.connect(process.env.DB_URI);
        console.log('db connected')
    }
    catch(err){
        console.log(err)
    }
    
})();   

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxLength: 50
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    }
})

const accountSchema = mongoose.Schema({
    balance: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
})

const users = mongoose.model('Users', UserSchema);
const account = mongoose.model('Accounts',accountSchema);

module.exports= {
    users,
    account
}