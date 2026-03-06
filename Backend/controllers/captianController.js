const captainModel = require("../models/captainModel");
const {validationResult} = require("express-validator");
const bcrypt = require("bcrypt");
const {createCaptain} = require("../services/captainService");


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


module.exports = {
    registerCaptain
}