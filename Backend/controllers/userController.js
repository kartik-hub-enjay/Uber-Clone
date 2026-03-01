const userModel = require("../models/userModel");
const {createUser} = require("../services/userService");
const {validationResult} = require("express-validator");


async function registerUserController(req,res,next){
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

module.exports = {
    registerUserController
}