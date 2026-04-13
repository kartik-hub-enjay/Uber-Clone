const rideService = require('../services/rideService');
const { validationResult } = require('express-validator');
const mapService = require('../services/mapsService');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/rideModel');


module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType, pickupCoords, destinationCoords } = req.body;

    try {
        const ride = await rideService.createRide({
            user: req.user._id,
            pickup,
            destination,
            vehicleType,
            pickupCoords,
            destinationCoords
        });
        res.status(201).json(ride);

        let pickupCoordinates = null;
        if (
            pickupCoords &&
            Number.isFinite(Number(pickupCoords.ltd)) &&
            Number.isFinite(Number(pickupCoords.lng))
        ) {
            pickupCoordinates = {
                ltd: Number(pickupCoords.ltd),
                lng: Number(pickupCoords.lng)
            };
        } else {
            pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        }



        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 2);

        ride.otp = ""

        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.map(captain => {

            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            })

        })

    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }

};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, pickupLtd, pickupLng, destinationLtd, destinationLng } = req.query;

    const hasPickupCoords = Number.isFinite(Number(pickupLtd)) && Number.isFinite(Number(pickupLng));
    const hasDestinationCoords = Number.isFinite(Number(destinationLtd)) && Number.isFinite(Number(destinationLng));

    const pickupCoords = hasPickupCoords
        ? { ltd: Number(pickupLtd), lng: Number(pickupLng) }
        : null;

    const destinationCoords = hasDestinationCoords
        ? { ltd: Number(destinationLtd), lng: Number(destinationLng) }
        : null;

    try {
        const fare = await rideService.getFare(pickup, destination, {
            pickupCoords,
            destinationCoords
        });
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })



        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}