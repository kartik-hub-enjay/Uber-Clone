const captainModel = require("../models/captainModel");
const {validationResult} = require("express-validator");
const bcrypt = require("bcrypt");
const {createCaptain} = require("../services/captainService");
const blackListTokenModel = require("../models/blackListTokenModel");


async function registerCaptain(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try { 
        const {fullname,email,password,vehicle} = req.body;
        const existingCaptain = await captainModel.findOne({email});
        if(existingCaptain){
            return res.status(400).json({message:"Captain with this email already exists"})
        }
        const hashedPassword = await captainModel.hashPassword(password);
        const captain = await createCaptain({
            firstname:fullname.firstname,
            lastname:fullname.lastname,
            email,
            password:hashedPassword,
            color:vehicle.color,
            plate:vehicle.plate,
            capacity:vehicle.capacity,
            vehicleType:vehicle.vehicleType
        });
        const token = captain.generateAuthToken();
        res.status(201).json({message:"Captain registered successfully",captain,token})
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message})
    }
}

async function loginCaptain(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const {email,password} = req.body;
        const captain = await captainModel.findOne({email}).select("+password");
        if(!captain){
            return res.status(401).json({message:"Invalid email or password"})
        }
        const isMatch = await captain.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({message:"Invalid email or password"})
        }
        const token = captain.generateAuthToken();
        res.cookie("token", token);
        res.status(200).json({message:"Login successful",captain,token})
    }catch(error){
        res.status(500).json({message:"Server error",error:error.message})
    }
}

async function getCaptainProfile(req,res){
    try {
        console.log("req.captain:", req.captain);
        const captain = req.captain;
        if(!captain){
            return res.status(404).json({message:"Captain not found"})
        }
        res.status(200).json({captain})
    }  catch(error){
        res.status(500).json({message:"Server error",error:error.message})
    }
}

async function logoutCaptain(req,res){
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        // Add the token to the blacklist
        await blackListTokenModel.create({token});
        // Clear the token cookie
        res.clearCookie("token");
        res.status(200).json({message:"Logout successful"})
    }  catch(error){
        res.status(500).json({message:"Server error",error:error.message})
    }
}

module.exports = {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    logoutCaptain
}