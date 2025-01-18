const express = require('express')
const zod = require('zod')
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config')
const {users, account} = require('../db');
const {authMiddleware} = require('../middleware');

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

        await account.create({
            balance: 1 + (Math.random()*10000),
            userId: userId
        })

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

const updateBody = zod.object({
    firstName: zod.string().max(50).optional(),
    lastName: zod.string().max(50).optional(),
    password: zod.string().min(8).optional()
})

userRouter.put('/', authMiddleware, async(req,res)=>{
    const {success, data} = updateBody.safeParse(req.body);
    if(!success){
        return res.status(403).json({});
    }
    const userId = req.userId;
    try{
        await users.findOneAndUpdate({_id: userId}, data);
        res.json({msg: "updated"});

    }
    catch(err){
        res.status(400).json({});
    }
})

userRouter.get('/bulk', async(req,res)=>{
    const search = req.query.search || "";
    try{
        const result = await users.find({
            $or:[{
                firstName: {
                    "$regex": search
                }
            },{
                lastName: {
                    "$regex": search
                }
            }]
        })
        res.json(result)
        // res.json({
        //     user: result.map(user => ({
        //     username: user.username,
        //     firstName: user.firstName,
        //     lastName: user.lastName,
        // }))})
    }
    catch(err){
        res.json("error")
    }
})


module.exports = userRouter