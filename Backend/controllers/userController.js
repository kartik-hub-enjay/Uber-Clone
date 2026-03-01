const blackListTokenModel = require("../models/blackListTokenModel");
const userModel = require("../models/userModel");
const {createUser} = require("../services/userService");
const {validationResult} = require("express-validator");


async function registerUserController(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {fullname,email,password} = req.body;

    const hashedPassword = await userModel.hashPassword(password);

    const user = await createUser({
        firstname:fullname.firstname,
        lastname:fullname.lastname,
        email,
        password:hashedPassword
    })

    const token = user.generateAuthToken();

    res.status(201).json({token,user});
}

async function loginUserController(req,res){
    const {email,password} = req.body
    
    const user = await userModel.findOne({email}).select('+password')

    if(!user){
        res.status(401).json({message:"Invalid email or password"});
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch){
        res.status(401).json({message:"invalid password"});
    }

    const token = await user.generateAuthToken()

    res.cookie('token',token);

    res.status(200).json({token , user})



}

async function getUserProfileController(req,res){
    res.status(200).json(req.user);
}

async function logOutUserController(req,res){
    const token = req.cookies.token || req.headers.authorization.split(" ")[1]
    await blackListTokenModel.create({token})
    res.clearCookie("token")
    res.status(200).json({message:"Logged Out"})
}
module.exports = {
    registerUserController,
    loginUserController,
    getUserProfileController,
    logOutUserController
}