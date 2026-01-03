// API Configuration
const API_BASE_URL = 'https://mv1z79jg-3000.inc1.devtunnels.ms/api';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

// Types
export interface PlacePhoto {
    height: number;
    width: number;
    photo_reference: string;
    html_attributions: string[];
}

export interface PlaceGeometry {
    location: {
        lat: number;
        lng: number;
    };
}

export interface Place {
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
    types: string[];
    geometry: PlaceGeometry;
    photos?: PlacePhoto[];
    opening_hours?: {
        open_now: boolean;
    };
    icon?: string;
    icon_background_color?: string;
    business_status?: string;
}

// API Functions

/**
 * Search for places/tourist attractions
 */
export const searchPlaces = async (query: string, options?: {
    type?: string;
    sortBy?: string;
    groupBy?: string;
}): Promise<Place[]> => {
    const params = new URLSearchParams({ query });

    if (options?.type) params.append('type', options.type);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.groupBy) params.append('groupBy', options.groupBy);

    const response = await fetch(`${API_BASE_URL}/trips/places/search?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to search places');
    }

    return response.json();
};

/**
 * Get place details by ID
 */
export const getPlaceDetails = async (placeId: string): Promise<Place> => {
    const response = await fetch(`${API_BASE_URL}/trips/places/details/${placeId}`);

    if (!response.ok) {
        throw new Error('Failed to get place details');
    }

    return response.json();
};

/**
 * Get nearby places
 */
export const getNearbyPlaces = async (lat: number, lng: number, options?: {
    radius?: number;
    type?: string;
}): Promise<Place[]> => {
    const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
    });

    if (options?.radius) params.append('radius', options.radius.toString());
    if (options?.type) params.append('type', options.type);

    const response = await fetch(`${API_BASE_URL}/trips/places/nearby?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to get nearby places');
    }

    return response.json();
};

/**
 * Get photo URL from photo reference using Google Places Photo API
 * @param photoReference - The photo_reference from the Places API response
 * @param maxWidth - Maximum width of the image (default: 800)
 * @returns The full URL to the photo
 */
export const getPhotoUrl = (photoReference: string, maxWidth: number = 800): string => {
    if (!photoReference || !GOOGLE_API_KEY) {
        return '';
    }
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
};

/**
 * Get the first photo URL from a place, or null if not available
 * @param place - The place object from the API
 * @param maxWidth - Maximum width of the image (default: 800)
 * @returns The photo URL or null
 */
export const getPlacePhotoUrl = (place: Place, maxWidth: number = 800): string | null => {
    if (place.photos && place.photos.length > 0 && place.photos[0].photo_reference) {
        return getPhotoUrl(place.photos[0].photo_reference, maxWidth);
    }
    return null;
};

// Trip Types
export interface Trip {
    id: string;
    userId: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isPublic: boolean;
    createdAt: string;
    stops?: TripStop[];
    budget?: TripBudget;
}

export interface TripStop {
    id: string;
    tripId: string;
    cityId: number;
    startDate?: string;
    endDate?: string;
    order: number;
    city?: {
        id: number;
        name: string;
        country: string;
    };
    name?: string;
    activities?: TripActivity[];
}

export interface TripActivity {
    id: string;
    tripStopId: string;
    activityId: number;
    scheduledDate?: string;
    customCost?: string;
    activity?: {
        id: number;
        name: string;
        type: string;
        avgCost?: string;
        durationHours?: number;
    };
}

export interface TripBudget {
    tripId: string;
    transportCost?: string;
    stayCost?: string;
    foodCost?: string;
    activityCost?: string;
}

// User Profile Types
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    city?: string;
    createdAt?: string;
    profilePicture?: string;
}

// User Authentication Types
export interface SignupData {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    city: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        phoneNumber?: string;
        city?: string;
    };
    token?: string;
}

// Password Recovery Types
export interface ForgotPasswordResponse {
    success: boolean;
    message?: string;
}

export interface ResetPasswordData {
    email: string;
    otp: string;
    newPassword: string;
}

export interface Region {
    id: number;
    name: string;
    country: string;
    costIndex?: number;
    popularityScore?: number;
    imageUrl?: string;
}

// Trip API Functions

/**
 * Get top regional selections
 */
export const getTopRegions = async (limit: number = 5, filter?: string): Promise<Region[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (filter) params.append('filter', filter);

    const response = await fetch(`${API_BASE_URL}/trips/regions/top?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to get top regions');
    }

    return response.json();
};

/**
 * Create a new trip
 */
export const createTrip = async (tripData: {
    userId: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
}): Promise<Trip> => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
    });

    if (!response.ok) {
        throw new Error('Failed to create trip');
    }

    return response.json();
};

/**
 * Get user's trips
 */
export const getUserTrips = async (userId: string, options?: {
    sortBy?: string;
    limit?: number;
    filter?: string;
}): Promise<Trip[]> => {
    const params = new URLSearchParams();
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.filter) params.append('filter', options.filter);

    const response = await fetch(`${API_BASE_URL}/trips/user/${userId}?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to get user trips');
    }

    return response.json();
};

/**
 * Get trip details by ID
 */
export const getTripDetails = async (tripId: string): Promise<Trip> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`);

    if (!response.ok) {
        throw new Error('Failed to get trip details');
    }

    return response.json();
};

/**
 * Update a trip
 */
export const updateTrip = async (tripId: string, tripData: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
}): Promise<Trip> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
    });

    if (!response.ok) {
        throw new Error('Failed to update trip');
    }

    return response.json();
};

/**
 * Delete a trip
 */
export const deleteTrip = async (tripId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete trip');
    }

    return response.json();
};

/**
 * Update a stop
 */
export const updateStop = async (tripId: string, stopId: string, stopData: {
    startDate?: string;
    endDate?: string;
    order?: number;
}): Promise<TripStop> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/stops/${stopId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(stopData),
    });

    if (!response.ok) {
        throw new Error('Failed to update stop');
    }

    return response.json();
};

/**
 * Delete a stop
 */
export const deleteStop = async (tripId: string, stopId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/stops/${stopId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete stop');
    }

    return response.json();
};

/**
 * Add a city to get a cityId for stops
 */
export const addCity = async (cityData: {
    name: string;
    country: string;
    costIndex?: number;
    popularityScore?: number;
}): Promise<{ message: string; cityId: number }> => {
    const response = await fetch(`${API_BASE_URL}/trips/city-add/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cityData),
    });

    if (!response.ok) {
        throw new Error('Failed to add city');
    }

    return response.json();
};

/**
 * Add multiple stops to a trip in bulk
 */
export const addTripStopsBulk = async (tripId: string, stops: Array<{
    cityId: number;
    name?: string;
    startDate: string;
    endDate: string;
    order: number;
}>): Promise<TripStop[]> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/stops`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stops }),
    });

    if (!response.ok) {
        throw new Error('Failed to add trip stops');
    }

    return response.json();
};

/**
 * Add a stop to a trip
 */
export const addTripStop = async (tripId: string, stopData: {
    cityId?: number;
    placeId?: string;
    name?: string;
    placeName?: string;
    startDate?: string;
    endDate?: string;
    order: number;
}): Promise<TripStop> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/stops`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(stopData),
    });

    if (!response.ok) {
        throw new Error('Failed to add trip stop');
    }

    return response.json();
};

/**
 * Add an activity to a trip stop
 */
export const addTripActivity = async (tripId: string, stopId: string, activityData: {
    activityId: number;
    scheduledDate?: string;
    customCost?: number;
}): Promise<TripActivity> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/stops/${stopId}/activities`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
    });

    if (!response.ok) {
        throw new Error('Failed to add activity');
    }

    return response.json();
};

/**
 * Delete trip activity
 */
export const deleteTripActivity = async (tripId: string, stopId: string, activityId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/stops/${stopId}/activities/${activityId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete activity');
    }
};

/**
 * Register a new user
 */
export const signup = async (userData: SignupData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
    }

    return data;
};

/**
 * Login an existing user
 */
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
    }

    return data;
};

/**
 * Request OTP for password recovery
 */
export const requestForgotPasswordOtp = async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/forgot-password-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
};

/**
 * Reset password using OTP
 */
export const resetPasswordWithOtp = async (resetData: ResetPasswordData): Promise<ForgotPasswordResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/reset-password-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
    }

    return data;
};

/**
 * Get user profile by UUID
 */
export const getUserProfile = async (uuid: string): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/me/${uuid}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to get user profile');
    }

    return data;
};

export default {
    searchPlaces,
    getPlaceDetails,
    getNearbyPlaces,
    getPhotoUrl,
    getPlacePhotoUrl,
    getTopRegions,
    createTrip,
    getUserTrips,
    getTripDetails,
    updateTrip,
    deleteTrip,
    addCity,
    addTripStop,
    addTripStopsBulk,
    updateStop,
    deleteStop,
    addTripActivity,
    deleteTripActivity,
    signup,
    login,
    requestForgotPasswordOtp,
    resetPasswordWithOtp,
    getUserProfile,
};
