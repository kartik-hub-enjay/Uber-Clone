const axios = require('axios');
const captainModel = require('../models/captainModel');

// Simple in-memory cache to reduce provider calls in type-ahead flow.
const suggestionCache = new Map();
const SUGGESTION_CACHE_TTL_MS = 5 * 60 * 1000;
const coordinateCache = new Map();
const COORDINATE_CACHE_TTL_MS = 30 * 60 * 1000;
const providerBackoffUntil = {
    photon: 0,
    nominatim: 0
};

module.exports.getAddressCoordinate = async (address) => {
    const normalizedAddress = (address || '').trim();

    if (!normalizedAddress || normalizedAddress.length < 3) {
        throw new Error('Invalid address');
    }

    const cacheKey = normalizedAddress.toLowerCase();
    const cachedCoords = coordinateCache.get(cacheKey);
    if (cachedCoords && cachedCoords.expiresAt > Date.now()) {
        return cachedCoords.data;
    }

    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalizedAddress)}&count=1&language=en&format=json`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(normalizedAddress)}`;

    // Provider 1: Open-Meteo (free, no key)
    try {
        const openMeteoResponse = await axios.get(openMeteoUrl, { timeout: 8000 });
        const result = openMeteoResponse.data?.results?.[0];

        if (result && typeof result.latitude === 'number' && typeof result.longitude === 'number') {
            const coords = {
                ltd: Number(result.latitude),
                lng: Number(result.longitude)
            };
            coordinateCache.set(cacheKey, {
                data: coords,
                expiresAt: Date.now() + COORDINATE_CACHE_TTL_MS
            });
            return coords;
        }
    } catch (error) {
        console.error('Geocoding open-meteo error:', error.response?.status || error.message);
    }

    // Provider 2: Nominatim fallback
    try {
        const response = await axios.get(nominatimUrl, {
            headers: {
                'User-Agent': 'Uber-Clone/1.0 (learning project geocoder)'
            },
            timeout: 8000
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
            const location = response.data[0];
            const coords = {
                ltd: Number(location.lat),
                lng: Number(location.lon)
            };
            coordinateCache.set(cacheKey, {
                data: coords,
                expiresAt: Date.now() + COORDINATE_CACHE_TTL_MS
            });
            return coords;
        }
    } catch (error) {
        console.error('Geocoding nominatim error:', error.response?.status || error.message);
    }

    throw new Error('Unable to fetch coordinates');
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

const toRadians = (value) => (value * Math.PI) / 180;

const getHaversineDistanceMeters = (a, b) => {
    const earthRadius = 6371000;
    const dLat = toRadians(b.ltd - a.ltd);
    const dLng = toRadians(b.lng - a.lng);
    const lat1 = toRadians(a.ltd);
    const lat2 = toRadians(b.ltd);

    const x =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return earthRadius * c;
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

        // Fallback when OSRM is unavailable/rate-limited.
        const straightLineMeters = getHaversineDistanceMeters(originCoords, destinationCoords);
        const roadFactor = 1.25;
        const estimatedDistanceMeters = Math.max(300, Math.round(straightLineMeters * roadFactor));

        // Average city speed assumption for fallback ETA (~28 km/h).
        const avgMetersPerSecond = 28 * (1000 / 3600);
        const estimatedDurationSeconds = Math.max(
            180,
            Math.round(estimatedDistanceMeters / avgMetersPerSecond)
        );

        return {
            distance: {
                text: formatDistanceText(estimatedDistanceMeters),
                value: estimatedDistanceMeters
            },
            duration: {
                text: formatDurationText(estimatedDurationSeconds),
                value: estimatedDurationSeconds
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
};

module.exports.getDistanceTimeByCoords = async (originCoords, destinationCoords, originLabel = 'Origin', destinationLabel = 'Destination') => {
    if (
        !originCoords ||
        !destinationCoords ||
        !Number.isFinite(Number(originCoords.ltd)) ||
        !Number.isFinite(Number(originCoords.lng)) ||
        !Number.isFinite(Number(destinationCoords.ltd)) ||
        !Number.isFinite(Number(destinationCoords.lng))
    ) {
        throw new Error('Invalid coordinates');
    }

    const normalizedOriginCoords = {
        ltd: Number(originCoords.ltd),
        lng: Number(originCoords.lng)
    };

    const normalizedDestinationCoords = {
        ltd: Number(destinationCoords.ltd),
        lng: Number(destinationCoords.lng)
    };

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${normalizedOriginCoords.lng},${normalizedOriginCoords.ltd};${normalizedDestinationCoords.lng},${normalizedDestinationCoords.ltd}?overview=false`;

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
                    address: originLabel,
                    coordinates: normalizedOriginCoords
                },
                destination: {
                    address: destinationLabel,
                    coordinates: normalizedDestinationCoords
                }
            };
        }

        throw new Error('Unable to fetch distance and time');
    } catch (error) {
        console.error('Routing by coords error:', error.response?.status || error.message);

        const straightLineMeters = getHaversineDistanceMeters(normalizedOriginCoords, normalizedDestinationCoords);
        const roadFactor = 1.25;
        const estimatedDistanceMeters = Math.max(300, Math.round(straightLineMeters * roadFactor));
        const avgMetersPerSecond = 28 * (1000 / 3600);
        const estimatedDurationSeconds = Math.max(
            180,
            Math.round(estimatedDistanceMeters / avgMetersPerSecond)
        );

        return {
            distance: {
                text: formatDistanceText(estimatedDistanceMeters),
                value: estimatedDistanceMeters
            },
            duration: {
                text: formatDurationText(estimatedDurationSeconds),
                value: estimatedDurationSeconds
            },
            origin: {
                address: originLabel,
                coordinates: normalizedOriginCoords
            },
            destination: {
                address: destinationLabel,
                coordinates: normalizedDestinationCoords
            }
        };
    }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
    const normalizedInput = (input || '').trim();

    if (!normalizedInput || normalizedInput.length < 3) {
        throw new Error('Invalid input');
    }

    const cacheKey = normalizedInput.toLowerCase();
    const cached = suggestionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    // Prefix cache reuse: if user types progressively, reuse previous cached results.
    const prefixEntries = Array.from(suggestionCache.entries())
        .filter(([ key, value ]) => cacheKey.startsWith(key) && value.expiresAt > Date.now())
        .sort((a, b) => b[0].length - a[0].length);

    if (prefixEntries.length > 0) {
        const [ , prefixValue ] = prefixEntries[0];
        const filtered = (prefixValue.data || [])
            .filter((item) => (item?.description || '').toLowerCase().includes(cacheKey))
            .slice(0, 5);

        if (filtered.length >= 3) {
            suggestionCache.set(cacheKey, {
                data: filtered,
                expiresAt: Date.now() + SUGGESTION_CACHE_TTL_MS
            });
            return filtered;
        }
    }

    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalizedInput)}&count=5&language=en&format=json`;
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(normalizedInput)}&limit=5`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(normalizedInput)}`;

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

    // Provider 1 (Primary): Open-Meteo geocoding API (free, no API key)
    try {
        const openMeteoResponse = await axios.get(openMeteoUrl, { timeout: 8000 });

        if (openMeteoResponse.data && Array.isArray(openMeteoResponse.data.results)) {
            openMeteoResponse.data.results.forEach((item) => {
                const parts = [ item.name, item.admin1, item.country ].filter(Boolean);
                const description = parts.join(', ');
                addSuggestion(description, item.id, item.latitude, item.longitude);
            });
        }
    } catch (error) {
        console.error('Autocomplete open-meteo error:', error.response?.status || error.message);
    }

    // Provider 2: Photon (good POI/local suggestions when available)
    if (suggestions.length < 5 && Date.now() > providerBackoffUntil.photon) {
        try {
            const photonResponse = await axios.get(photonUrl, {
                headers: {
                    'User-Agent': 'Uber-Clone/1.0 (learning project autocomplete)'
                },
                timeout: 7000
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
            // Temporary backoff on repeated network issues from provider.
            providerBackoffUntil.photon = Date.now() + (2 * 60 * 1000);
        }
    }

    // Provider 3: Nominatim (best fallback, but strict rate limits)
    if (suggestions.length < 5 && Date.now() > providerBackoffUntil.nominatim) {
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
            if (error.response?.status === 429) {
                // Back off longer on explicit rate limit response.
                providerBackoffUntil.nominatim = Date.now() + (15 * 60 * 1000);
            } else {
                providerBackoffUntil.nominatim = Date.now() + (2 * 60 * 1000);
            }
        }
    }

    const result = suggestions.slice(0, 5);
    suggestionCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + SUGGESTION_CACHE_TTL_MS
    });

    // Return empty array on provider failures so frontend doesn't break with 500.
    return result;
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