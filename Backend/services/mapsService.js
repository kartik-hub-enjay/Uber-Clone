const axios = require('axios');
const captainModel = require('../models/captainModel');

module.exports.getAddressCoordinate = async (address) => {
    const normalizedAddress = (address || '').trim();

    if (!normalizedAddress || normalizedAddress.length < 3) {
        throw new Error('Invalid address');
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(normalizedAddress)}`;
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(normalizedAddress)}&limit=1`;

    try {
        const response = await axios.get(nominatimUrl, {
            headers: {
                // Nominatim usage policy requires a valid identifying User-Agent.
                'User-Agent': 'Uber-Clone/1.0 (learning project geocoder)'
            },
            timeout: 8000
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
            const location = response.data[0];
            return {
                // Keep existing response keys to avoid breaking current consumers.
                ltd: Number(location.lat),
                lng: Number(location.lon)
            };
        }

        // Fallback: Photon (OpenStreetMap based, free).
        const fallbackResponse = await axios.get(photonUrl, { timeout: 8000 });

        if (
            fallbackResponse.data &&
            Array.isArray(fallbackResponse.data.features) &&
            fallbackResponse.data.features.length > 0
        ) {
            const coords = fallbackResponse.data.features[0].geometry?.coordinates;

            if (Array.isArray(coords) && coords.length === 2) {
                return {
                    // Photon returns [lon, lat]. Keep existing response keys for compatibility.
                    ltd: Number(coords[1]),
                    lng: Number(coords[0])
                };
            }
        }

        throw new Error('Unable to fetch coordinates');
    } catch (error) {
        console.error('Geocoding error:', error.response?.status || error.message);
        throw error;
    }
}

const formatDistanceText = (meters) => {
    const km = meters / 1000;
    if (km < 1) {
        return `${Math.round(meters)} m`;
    }
    return `${km.toFixed(1)} km`;
};

const formatDurationText = (seconds) => {
    const totalMinutes = Math.round(seconds / 60);
    if (totalMinutes < 60) {
        return `${totalMinutes} mins`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) {
        return `${hours} hr`;
    }
    return `${hours} hr ${minutes} mins`;
};

module.exports.getDistanceTime = async (origin, destination) => {
    const normalizedOrigin = (origin || '').trim();
    const normalizedDestination = (destination || '').trim();

    if (!normalizedOrigin || normalizedOrigin.length < 3) {
        throw new Error('Invalid origin');
    }

    if (!normalizedDestination || normalizedDestination.length < 3) {
        throw new Error('Invalid destination');
    }

    const originCoords = await module.exports.getAddressCoordinate(normalizedOrigin);
    const destinationCoords = await module.exports.getAddressCoordinate(normalizedDestination);

    // OSRM expects coordinates in [lon,lat] order.
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.ltd};${destinationCoords.lng},${destinationCoords.ltd}?overview=false`;

    try {
        const response = await axios.get(osrmUrl, { timeout: 8000 });

        if (
            response.data &&
            response.data.code === 'Ok' &&
            Array.isArray(response.data.routes) &&
            response.data.routes.length > 0
        ) {
            const route = response.data.routes[0];
            return {
                distance: {
                    text: formatDistanceText(route.distance),
                    value: Math.round(route.distance)
                },
                duration: {
                    text: formatDurationText(route.duration),
                    value: Math.round(route.duration)
                },
                origin: {
                    address: normalizedOrigin,
                    coordinates: originCoords
                },
                destination: {
                    address: normalizedDestination,
                    coordinates: destinationCoords
                }
            };
        }

        throw new Error('Unable to fetch distance and time');
    } catch (error) {
        console.error('Routing error:', error.response?.status || error.message);
        throw error;
    }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
    const normalizedInput = (input || '').trim();

    if (!normalizedInput || normalizedInput.length < 3) {
        throw new Error('Invalid input');
    }

    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(normalizedInput)}&limit=5`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(normalizedInput)}`;
    const mapsCoUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(normalizedInput)}`;

    const suggestions = [];
    const seen = new Set();

    const addSuggestion = (description, placeId, lat, lon) => {
        if (!description || seen.has(description)) {
            return;
        }

        seen.add(description);
        suggestions.push({
            description,
            placeId: placeId || description,
            ltd: typeof lat === 'number' ? lat : Number(lat),
            lng: typeof lon === 'number' ? lon : Number(lon)
        });
    };

    // Provider 1: Photon
    try {
        const photonResponse = await axios.get(photonUrl, {
            headers: {
                'User-Agent': 'Uber-Clone/1.0 (learning project autocomplete)'
            },
            timeout: 8000
        });

        if (photonResponse.data && Array.isArray(photonResponse.data.features)) {
            photonResponse.data.features.forEach((feature) => {
                const props = feature.properties || {};
                const coords = feature.geometry?.coordinates || [];
                const parts = [ props.name, props.city, props.state, props.country ].filter(Boolean);
                const description = parts.join(', ');

                addSuggestion(description, props.osm_id || props.osm_key, coords[1], coords[0]);
            });
        }
    } catch (error) {
        console.error('Autocomplete photon error:', error.response?.status || error.message);
    }

    // Provider 2: Nominatim
    if (suggestions.length === 0) {
        try {
            const nominatimResponse = await axios.get(nominatimUrl, {
                headers: {
                    'User-Agent': 'Uber-Clone/1.0 (learning project geocoder)'
                },
                timeout: 8000
            });

            if (Array.isArray(nominatimResponse.data)) {
                nominatimResponse.data.forEach((item) => {
                    addSuggestion(item.display_name, item.place_id, item.lat, item.lon);
                });
            }
        } catch (error) {
            console.error('Autocomplete nominatim error:', error.response?.status || error.message);
        }
    }

    // Provider 3: maps.co
    if (suggestions.length === 0) {
        try {
            const mapsCoResponse = await axios.get(mapsCoUrl, { timeout: 8000 });

            if (Array.isArray(mapsCoResponse.data)) {
                mapsCoResponse.data.forEach((item) => {
                    addSuggestion(item.display_name, item.place_id, item.lat, item.lon);
                });
            }
        } catch (error) {
            console.error('Autocomplete maps.co error:', error.response?.status || error.message);
        }
    }

    // Return empty array on provider failures so frontend doesn't break with 500.
    return suggestions.slice(0, 5);
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {

    // radius in km


    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ ltd, lng ], radius / 6371 ]
            }
        }
    });

    return captains;


}