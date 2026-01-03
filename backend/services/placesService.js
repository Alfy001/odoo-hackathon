import axios from "axios";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Search for places using Google Places Text Search API
 * @param {string} query - Search query (e.g., "restaurants in Paris")
 * @param {string} type - Place type filter (e.g., "restaurant", "tourist_attraction", "lodging")
 * @returns {Promise<Array>} - Array of place results
 */
const searchPlaces = async (query, type) => {
    try {
        const params = {
            query,
            key: GOOGLE_PLACES_API_KEY
        };

        if (type) {
            params.type = type;
        }

        const response = await axios.get(`${BASE_URL}/textsearch/json`, { params });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API error: ${response.data.status}`);
        }

        return response.data.results || [];
    } catch (error) {
        console.error('Error searching places:', error.message);
        throw error;
    }
};

/**
 * Get detailed information about a place
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} - Place details
 */
const getPlaceDetails = async (placeId) => {
    try {
        const response = await axios.get(`${BASE_URL}/details/json`, {
            params: {
                place_id: placeId,
                fields: 'name,formatted_address,formatted_phone_number,geometry,rating,reviews,photos,price_level,opening_hours,website,types,user_ratings_total',
                key: GOOGLE_PLACES_API_KEY
            }
        });

        if (response.data.status !== 'OK') {
            throw new Error(`Google Places API error: ${response.data.status}`);
        }

        return response.data.result;
    } catch (error) {
        console.error('Error getting place details:', error.message);
        throw error;
    }
};

/**
 * Search for nearby places
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (max 50000)
 * @param {string} type - Place type filter
 * @returns {Promise<Array>} - Array of nearby places
 */
const getNearbyPlaces = async (lat, lng, radius = 5000, type) => {
    try {
        const params = {
            location: `${lat},${lng}`,
            radius: Math.min(radius, 50000), // Max 50km
            key: GOOGLE_PLACES_API_KEY
        };

        if (type) {
            params.type = type;
        }

        const response = await axios.get(`${BASE_URL}/nearbysearch/json`, { params });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API error: ${response.data.status}`);
        }

        return response.data.results || [];
    } catch (error) {
        console.error('Error getting nearby places:', error.message);
        throw error;
    }
};

/**
 * Get place photo URL
 * @param {string} photoReference - Photo reference from Places API
 * @param {number} maxWidth - Maximum width of the image
 * @returns {string} - Photo URL
 */
const getPhotoUrl = (photoReference, maxWidth = 400) => {
    return `${BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
};

/**
 * Autocomplete place search
 * @param {string} input - User input for autocomplete
 * @param {string} types - Type restrictions (e.g., "(cities)" or "establishment")
 * @returns {Promise<Array>} - Array of autocomplete predictions
 */
const autocomplete = async (input, types) => {
    try {
        const params = {
            input,
            key: GOOGLE_PLACES_API_KEY
        };

        if (types) {
            params.types = types;
        }

        const response = await axios.get(`${BASE_URL}/autocomplete/json`, { params });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places API error: ${response.data.status}`);
        }

        return response.data.predictions || [];
    } catch (error) {
        console.error('Error in autocomplete:', error.message);
        throw error;
    }
};

export {
    searchPlaces,
    getPlaceDetails,
    getNearbyPlaces,
    getPhotoUrl,
    autocomplete
};

