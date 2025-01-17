const express = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config')
const {User} = require('../db');
const router = express.Router();

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string().max(30),
    lastName: zod.string().max(30),
    password: zod.string().min(8)
})

router.post('/signup', async (req,res) => {
    const success = signupBody.safeParse(req.body);
    if(!success){
        res.status(411).json({msg: 'Incorrect Inputs'});
    }
    const username = req.body.username;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    const existingUser = await User.find({username : username});
    if(existingUser){
        res.status(411).json({msg: 'Email already exist'});
    }

    const user = await User.create({
        username,
        firstName,
        lastName,
        password,
    })

    const userId = user._id;
    const token = jwt.sign({userId},JWT_SECRET);

    res.status(200).json({message: 'Account Created Successfully', token: token});

})  

module.exports = {
    router
}