const express = require('express')
const zod = require('zod')
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config')
const {users} = require('../db')
const userRouter = express.Router();

const signUpBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string().max(50),
    lastName: zod.string().max(50),
    password: zod.string().min(8)
})

userRouter.post('/signup', async (req,res)=>{
    const {success} = signUpBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({msg: 'invalid inputs'})
    }
    const username = req.body.username;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;
    
    try{
        const userExist = await users.findOne({ username });
        if(userExist){
            return res.status(411).json({msg: 'User Already Exist'})
        }
        const user = await users.create({
            username: username, 
            firstName: firstName,
            lastName: lastName,
            password: password
        })

        const userId = user._id;

        const token =  jwt.sign({userId},JWT_SECRET);

        res.status(200).json({msg: 'User Created', token: token});
    }
    catch(err){
        res.status(411).json({err: 'error'})
    }
    
})

const signInBody = zod.object({
    username: zod.string().email(),
    password: zod.string().min(8)
})

userRouter.get('/signin', async (req,res)=> {
    const {success} = signInBody.safeParse(req.body);
    if(!success){
        res.status(411).json({msg: 'Invalid inputs'})
    }
    const username = req.body.username;
    const password = req.body.password;

    try{
        const user = await users.findOne({
            username: username,
            password: password
        })

        const userId = user._id;
        const token = jwt.sign({userId},JWT_SECRET);

        return res.status(200).json({msg: "Signed In", token: token});
    }
    catch(err){
        res.status(411).json({msg: 'error'})
    }
})


module.exports = userRouter