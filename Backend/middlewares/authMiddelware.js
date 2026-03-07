const userModel = require("../models/userModel");
const captainModel = require("../models/captainModel");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const blackListTokenModel = require("../models/blackListTokenModel");

async function authUser(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    const isBlacklisted = await blackListTokenModel.findOne({token:token})
    if(isBlacklisted){
        return res.status(401).json({message:"Unauthorized"})
    }

    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded._id)

        req.user = user;

        return next();
    }catch(err){
        return res.status(401).json({message:"Unauthorized"})
    }
}

async function authCaptain(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if(!token){
        return res.status(401).json({message:"Unauthorized - No token provided"});
    }
    const isBlacklisted = await blackListTokenModel.findOne({token:token})
    if(isBlacklisted){
        return res.status(401).json({message:"Unauthorized - Token blacklisted"})
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        
        const captain = await captainModel.findById(decoded._id)
        
        if(!captain){
            return res.status(401).json({message:"Unauthorized - Captain not found"})
        }
        req.captain = captain;
        return next();
    }catch(err){
        
        return res.status(401).json({message:"Unauthorized - Invalid token"})
    }
}

module.exports = {
    authUser,
    authCaptain
}