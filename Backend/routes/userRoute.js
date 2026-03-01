const express = require("express")
const router = express.Router()
const {body} = require("express-validator")
const {registerUserController,loginUserController,getUserProfileController,logOutUserController} = require("../controllers/userController");
const {authUser} = require("../middlewares/authMiddelware");

router.post("/register",[
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({min:2}).withMessage('First name must be atleast 2 character long'),
    body('password').isLength({min:6}).withMessage("Password must be atleast 6 character long")
],registerUserController);

router.post("/login",[
    body('email').isEmail().withMessage("Invalid Email"),
    body('password').isLength({min:6}).withMessage('Password must contain atleast 6 chars')
],loginUserController)


router.get("/profile",authUser,getUserProfileController);

router.get("/logout",authUser,logOutUserController);

module.exports = router;