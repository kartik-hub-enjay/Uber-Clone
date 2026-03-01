const express = require("express")
const router = express.Router()
const {body} = require("express-validator")
const {registerUserController} = require("../controllers/userController");

router.post("/register",[
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({min:2}).withMessage('First name must be atleast 2 character long'),
    body('password').isLength({min:6}).withMessage("Password must be atleast 6 character long")
],registerUserController);

module.exports = router;