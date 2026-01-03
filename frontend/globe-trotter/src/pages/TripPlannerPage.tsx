import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Calendar, MapPin, Search, Plus,
    Loader2, Check, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PlaceCard from '../components/PlaceCard';
import {
    searchPlaces, createTrip, addCity, addTripStopsBulk,
    type Place
} from '../services/api';
import '../styles/Dashboard.css';

interface SelectedActivity extends Place {
    day?: number;
    scheduledTime?: string;
}

const TripPlannerPage = () => {
    const navigate = useNavigate();

    // Form state
    const [tripTitle, setTripTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Selected activities
    const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);

    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate number of days
    const calculateDays = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return diff > 0 ? diff : 0;
        }
        return 0;
    };

    const numberOfDays = calculateDays();

    // Search for places
    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            const results = await searchPlaces(searchQuery, {
                type: 'tourist_attraction',
                sortBy: 'rating',
            });
            setSearchResults(results);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search places');
        } finally {
            setIsSearching(false);
        }
    };

    // Add activity to selected list
    const addActivity = (place: Place) => {
        if (selectedActivities.find(a => a.place_id === place.place_id)) {
            return; // Already added
        }

        // Auto-assign to a day if dates are selected
        const day = numberOfDays > 0 ? 1 : undefined;

        setSelectedActivities([...selectedActivities, { ...place, day }]);
    };

    // Remove activity from selected list
    const removeActivity = (placeId: string) => {
        setSelectedActivities(selectedActivities.filter(a => a.place_id !== placeId));
    };

    // Check if activity is selected
    const isActivitySelected = (placeId: string) => {
        return selectedActivities.some(a => a.place_id === placeId);
    };

    // Assign activity to a day
    const assignToDay = (placeId: string, day: number) => {
        setSelectedActivities(selectedActivities.map(a =>
            a.place_id === placeId ? { ...a, day } : a
        ));
    };

    // Get activities grouped by day
    const getActivitiesByDay = () => {
        const grouped: { [key: number]: SelectedActivity[] } = {};

        // Initialize all days
        for (let i = 1; i <= numberOfDays; i++) {
            grouped[i] = [];
        }

        // Add unassigned day 0
        grouped[0] = [];

        selectedActivities.forEach(activity => {
            const day = activity.day || 0;
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(activity);
        });

        return grouped;
    };

    // Create the trip
    const handleCreateTrip = async () => {
        if (!tripTitle.trim()) {
            setError('Please enter a trip title');
            return;
        }

        if (selectedActivities.length === 0) {
            setError('Please add at least one activity');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // Get user from localStorage
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user?.id) {
                setError('Please login to create a trip');
                setIsCreating(false);
                return;
            }

            // Sort activities by assigned day first, then by selection order
            const sortedActivities = [...selectedActivities].sort((a, b) => {
                const dayA = a.day || 0;
                const dayB = b.day || 0;
                return dayA - dayB;
            });

            // Step 1: Create cities for each activity and collect cityIds
            console.log('Step 1: Creating cities for activities...');
            const activityCityIds: Map<string, number> = new Map();

            for (const activity of sortedActivities) {
                // Extract city name and country from the formatted address
                // Address format is usually "Place Name, City, State, Country"
                const addressParts = activity.formatted_address?.split(',').map(p => p.trim()) || [];

                // Try to extract city and country from address
                let cityName = activity.name; // Default to activity name
                let country = 'Unknown';

                if (addressParts.length >= 2) {
                    // Last part is usually country
                    country = addressParts[addressParts.length - 1] || 'Unknown';
                    // Second to last or earlier part is usually city
                    if (addressParts.length >= 3) {
                        cityName = addressParts[addressParts.length - 3] || addressParts[0];
                    } else {
                        cityName = addressParts[0];
                    }
                }

                try {
                    const cityResponse = await addCity({
                        name: cityName,
                        country: country,
                        costIndex: 4, // Default value
                        popularityScore: activity.rating || 4.5,
                    });
                    activityCityIds.set(activity.place_id, cityResponse.cityId);
                    console.log(`City created for ${activity.name}: cityId = ${cityResponse.cityId}`);
                } catch (cityError) {
                    console.error(`Failed to create city for ${activity.name}:`, cityError);
                    // Use a default cityId or throw error
                    throw new Error(`Failed to create city for ${activity.name}`);
                }
            }

            // Step 2: Create the trip and wait for tripId
            console.log('Step 2: Creating trip...');
            const trip = await createTrip({
                userId: user.id,
                title: tripTitle,
                description,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                isPublic: false,
            });

            console.log('Trip created:', trip);
            const tripId = trip.id;

            if (!tripId) {
                throw new Error('Failed to get trip ID from response');
            }

            // Step 3: Add all stops in bulk using the tripId and cityIds
            console.log('Step 3: Adding stops in bulk...');
            const stops = sortedActivities.map((activity, index) => {
                // Calculate dates based on day assignment
                let stopStartDate = startDate;
                let stopEndDate = startDate;

                if (activity.day && startDate) {
                    const baseDate = new Date(startDate);
                    baseDate.setDate(baseDate.getDate() + (activity.day - 1));
                    stopStartDate = baseDate.toISOString().split('T')[0];
                    // End date is same as start date for now, or could be next day
                    stopEndDate = stopStartDate;
                }

                const cityId = activityCityIds.get(activity.place_id);
                if (!cityId) {
                    throw new Error(`No cityId found for activity ${activity.name}`);
                }

                return {
                    cityId: cityId,
                    name: activity.name,
                    startDate: stopStartDate || new Date().toISOString().split('T')[0],
                    endDate: stopEndDate || new Date().toISOString().split('T')[0],
                    order: index + 1,
                };
            });

            await addTripStopsBulk(tripId, stops);
            console.log('All stops added successfully!', stops);

            // Navigate to home after successful creation
            navigate('/home');
        } catch (err) {
            console.error('Create trip error:', err);
            setError('Failed to create trip. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    // Group activities by day for future use
    // const activitiesByDay = getActivitiesByDay();

    return (
        <div className="dashboard-container">
            <Navbar />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '1.5rem 5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/home')}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ArrowLeft size={20} color="var(--text-primary)" />
                </motion.button>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Plan a New Trip</h1>
            </motion.div>

            {/* Main Content */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '400px 1fr',
                gap: '2rem',
                padding: '2rem 5rem',
                height: 'calc(100vh - 160px)',
                overflow: 'hidden',
            }}>
                {/* Left Panel - Trip Details */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        overflowY: 'auto',
                    }}
                >
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                        Trip Details
                    </h2>

                    {/* Trip Title */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                        }}>
                            Trip Title *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Summer in Paris"
                            value={tripTitle}
                            onChange={(e) => setTripTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                        }}>
                            Description
                        </label>
                        <textarea
                            placeholder="Describe your trip..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                resize: 'none',
                            }}
                        />
                    </div>

                    {/* Date Range */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                    }}>
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                color: 'var(--text-muted)',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                            }}>
                                <Calendar size={14} /> Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                                color: 'var(--text-muted)',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                            }}>
                                <Calendar size={14} /> End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                }}
                            />
                        </div>
                    </div>

                    {numberOfDays > 0 && (
                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(129, 140, 248, 0.05))',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                        }}>
                            <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.5rem' }}>
                                {numberOfDays}
                            </span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                day{numberOfDays > 1 ? 's' : ''} trip
                            </span>
                        </div>
                    )}

                    {/* Selected Activities Summary */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}>
                            <MapPin size={16} />
                            Selected Activities ({selectedActivities.length})
                        </h3>

                        {selectedActivities.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Search and add activities from the right panel
                            </p>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                maxHeight: '200px',
                                overflowY: 'auto',
                            }}>
                                {selectedActivities.map((activity) => (
                                    <div
                                        key={activity.place_id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {activity.name}
                                            </p>
                                            {numberOfDays > 0 && (
                                                <select
                                                    value={activity.day || 0}
                                                    onChange={(e) => assignToDay(activity.place_id, parseInt(e.target.value))}
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        padding: '0.25rem 0.5rem',
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '6px',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '0.75rem',
                                                    }}
                                                >
                                                    <option value={0}>Assign to day...</option>
                                                    {Array.from({ length: numberOfDays }, (_, i) => (
                                                        <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeActivity(activity.place_id)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.5rem',
                                                cursor: 'pointer',
                                                marginLeft: '0.5rem',
                                            }}
                                        >
                                            <Trash2 size={14} color="#ef4444" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '10px',
                                color: '#ef4444',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Create Trip Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateTrip}
                        disabled={isCreating}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: isCreating ? 'not-allowed' : 'pointer',
                            opacity: isCreating ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Creating Trip...
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Create Trip
                            </>
                        )}
                    </motion.button>
                </motion.div>

                {/* Right Panel - Search & Activities */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        overflow: 'hidden',
                    }}
                >
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} style={{
                        display: 'flex',
                        gap: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}>
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <MapPin size={20} color="var(--primary)" />
                            <input
                                type="text"
                                placeholder="Search for places, attractions, restaurants..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={isSearching || !searchQuery.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: '0.75rem 2rem',
                                background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: isSearching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                                opacity: isSearching || !searchQuery.trim() ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            {isSearching ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Search size={18} />
                            )}
                            Search
                        </motion.button>
                    </form>

                    {/* Section Title */}
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                    }}>
                        Suggestions for Places to Visit / Activities
                        {searchResults.length > 0 && (
                            <span style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-muted)',
                                fontWeight: '400',
                            }}>
                                ({searchResults.length} results)
                            </span>
                        )}
                    </h2>

                    {/* Results Grid */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        paddingRight: '0.5rem',
                    }}>
                        {isSearching ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem',
                            }}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            height: '320px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '20px',
                                            animation: 'pulse 1.5s ease-in-out infinite',
                                        }}
                                    />
                                ))}
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem',
                            }}>
                                {searchResults.map((place, index) => (
                                    <div key={place.place_id} style={{ position: 'relative' }}>
                                        <PlaceCard
                                            place={place}
                                            delay={index * 0.05}
                                            onClick={() => addActivity(place)}
                                        />
                                        {/* Selection Indicator */}
                                        <AnimatePresence>
                                            {isActivitySelected(place.place_id) && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                                        borderRadius: '50%',
                                                        padding: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                                                    }}
                                                >
                                                    <Check size={16} color="white" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                                padding: '2rem',
                            }}>
                                <Search size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                    Search for Destinations
                                </h3>
                                <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                                    Enter a location like "Kochi tourist attractions" or "Paris restaurants" to find places to add to your trip.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TripPlannerPage;
