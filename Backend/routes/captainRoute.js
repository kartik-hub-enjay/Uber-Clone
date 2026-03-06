const express = require('express');
const router = express.Router();
const {registerCaptain} = require("../controllers/captianController");
const {body} = require("express-validator"); // with the help of express-validator we can validate the incoming request data and ensure that it meets the required criteria before processing it further , this helps in maintaining data integrity and preventing potential security vulnerabilities.

router.post("/register",[
    body("fullname.firstname").notEmpty().withMessage("First name is required").isLength({min:2}).withMessage("First name should contain at least 2 characters"),
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required").isLength({min:6}).withMessage("Password should contain at least 6 characters"),
    body("vehicle.color").notEmpty().withMessage("Vehicle color is required"),
    body("vehicle.plate").notEmpty().withMessage("Vehicle plate is required"),
    body("vehicle.capacity").isInt({min:1}).withMessage("Vehicle capacity should be at least 1"),
    body("vehicle.vehicleType").isIn(["car","motorcycle","auto"]).withMessage("Invalid vehicle type")
    
], registerCaptain);

module.exports = router;