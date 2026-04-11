const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const rideController = require("../controllers/rideController")
const {authUser }= require("../middlewares/authMiddelware")
router.post(
  "/create",
  authUser,
  body("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid pickup address"),
  body("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid destination address"),
    body('vehicleType').isString().isIn(['auto','car','motorcycle']).withMessage('Invalid vehicle type'),rideController.createRide
);

module.exports = router