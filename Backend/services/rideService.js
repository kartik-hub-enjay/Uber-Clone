const rideModel = require('../models/rideModel');
const mapService = require('./mapsService');
const crypto = require('crypto')

async function getFare(pickup, destination, options = {}) {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const hasPickupCoords =
        options?.pickupCoords &&
        Number.isFinite(Number(options.pickupCoords.ltd)) &&
        Number.isFinite(Number(options.pickupCoords.lng));

    const hasDestinationCoords =
        options?.destinationCoords &&
        Number.isFinite(Number(options.destinationCoords.ltd)) &&
        Number.isFinite(Number(options.destinationCoords.lng));

    const distanceTime = (hasPickupCoords && hasDestinationCoords)
        ? await mapService.getDistanceTimeByCoords(
            {
                ltd: Number(options.pickupCoords.ltd),
                lng: Number(options.pickupCoords.lng)
            },
            {
                ltd: Number(options.destinationCoords.ltd),
                lng: Number(options.destinationCoords.lng)
            },
            pickup,
            destination
        )
        : await mapService.getDistanceTime(pickup, destination);

    const baseFare = {
        auto: 30,
        car: 50,
        motorcycle: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        motorcycle: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        motorcycle: 1.5
    };
        const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)),
        motorcycle: Math.round(baseFare.motorcycle + ((distanceTime.distance.value / 1000) * perKmRate.motorcycle) + ((distanceTime.duration.value / 60) * perMinuteRate.motorcycle))
    };

    // Backward compatibility with earlier key name used in some parts of code.
    fare.moto = fare.motorcycle;

    return fare;


}

module.exports.getFare = getFare;

function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}


module.exports.createRide = async ({
    user, pickup, destination, vehicleType, pickupCoords, destinationCoords
}) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination, {
        pickupCoords,
        destinationCoords
    });
    const normalizedVehicleType = vehicleType === 'moto' ? 'motorcycle' : vehicleType;



    const ride = rideModel.create({
        user,
        pickup,
        destination,
        otp:getOtp(6),
        fare: fare[ normalizedVehicleType ]
    })

    return ride;
}

module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'accepted',
        captain: captain._id
    })

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;

}

module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'ongoing'
    })

    return ride;
}

module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'ongoing') {
        throw new Error('Ride not ongoing');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'completed'
    })

    return ride;
}