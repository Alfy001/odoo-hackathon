import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, LayoutGrid, ListFilter, Calendar,
    ArrowRight, MapPin, Loader2, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserTrips, type Trip } from '../services/api';
import '../styles/Dashboard.css';

// Trip Card Component
const TripCard = ({
    trip,
    delay,
    onView
}: {
    trip: Trip;
    delay: number;
    onView: (tripId: string) => void;
}) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not set';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStopLocations = () => {
        if (!trip.stops || trip.stops.length === 0) return 'No stops added';
        return trip.stops.map(s => s.city?.name || 'Unknown').join(' → ');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            style={{
                background: 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            }}
            whileHover={{
                y: -5,
                borderColor: 'var(--primary)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
            onClick={() => onView(trip.id)}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                }}>
                    {trip.title}
                </h3>
            </div>

            {trip.description && (
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {trip.description}
                </p>
            )}

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
            }}>
                <MapPin size={14} />
                <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {getStopLocations()}
                </span>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
            }}>
                <Calendar size={14} />
                <span>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
            </div>

            <button
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                }}
            >
                View Details <ArrowRight size={16} />
            </button>
        </motion.div>
    );
};

// Section Component
const TripSection = ({
    title,
    trips,
    onView,
    isOpen,
    onToggle,
}: {
    title: string;
    trips: Trip[];
    onView: (tripId: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}) => (
    <div style={{ marginBottom: '2rem' }}>
        <motion.button
            onClick={onToggle}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '0.75rem 0',
                cursor: 'pointer',
            }}
        >
            <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
            }}>
                {title}
                <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    fontWeight: '400',
                }}>
                    ({trips.length})
                </span>
            </h2>
            <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronDown size={20} color="var(--text-muted)" />
            </motion.div>
        </motion.button>

        <AnimatePresence>
            {isOpen && trips.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.5rem',
                        marginTop: '1rem',
                        overflow: 'hidden',
                    }}
                >
                    {trips.map((trip, idx) => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            delay={idx * 0.05}
                            onView={onView}
                        />
                    ))}
                </motion.div>
            )}
            {isOpen && trips.length === 0 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        padding: '1rem 0',
                    }}
                >
                    No trips in this category.
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

// Main Page Component
const MyTripsPage = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [openSections, setOpenSections] = useState({
        ongoing: true,
        upcoming: true,
        completed: true,
    });

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;

                if (!user?.id) {
                    navigate('/login');
                    return;
                }

                const userTrips = await getUserTrips(user.id, { sortBy });
                setTrips(userTrips);
            } catch (err) {
                console.error('Failed to fetch trips:', err);
                setError('Failed to load trips. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrips();
    }, [navigate, sortBy]);

    // Categorize trips
    const categorizedTrips = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const filtered = trips.filter(trip =>
            trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const ongoing: Trip[] = [];
        const upcoming: Trip[] = [];
        const completed: Trip[] = [];

        filtered.forEach(trip => {
            const start = trip.startDate ? new Date(trip.startDate) : null;
            const end = trip.endDate ? new Date(trip.endDate) : null;

            if (start && end) {
                if (now >= start && now <= end) {
                    ongoing.push(trip);
                } else if (now < start) {
                    upcoming.push(trip);
                } else {
                    completed.push(trip);
                }
            } else if (start && now < start) {
                upcoming.push(trip);
            } else if (end && now > end) {
                completed.push(trip);
            } else {
                upcoming.push(trip); // Default to upcoming if no dates
            }
        });

        return { ongoing, upcoming, completed };
    }, [trips, searchQuery]);

    const toggleSection = (section: 'ongoing' | 'upcoming' | 'completed') => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleViewTrip = (tripId: string) => {
        navigate(`/trip/${tripId}`);
    };

    if (isLoading) {
        return (
            <div className="dashboard-container">
                <Navbar />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(100vh - 80px)',
                }}>
                    <Loader2 size={48} className="animate-spin" color="var(--primary)" />
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Navbar />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '2rem 5rem',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>My Trips</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Manage and view all your travel adventures
                </p>
            </motion.div>

            {/* Search & Controls */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="control-bar"
            >
                <div className="search-container">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search trips..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button className="btn-filter">
                    <LayoutGrid size={20} /> Group by
                </button>
                <button className="btn-filter">
                    <Filter size={20} /> Filter
                </button>
                <button
                    className="btn-filter"
                    onClick={() => setSortBy(sortBy === 'createdAt' ? 'startDate' : 'createdAt')}
                >
                    <ListFilter size={20} /> Sort by {sortBy === 'createdAt' ? 'Date Created' : 'Start Date'}
                </button>
            </motion.section>

            {/* Error State */}
            {error && (
                <div style={{
                    padding: '1rem 5rem',
                }}>
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        color: '#ef4444',
                    }}>
                        {error}
                    </div>
                </div>
            )}

            {/* Trip Sections */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ padding: '1rem 5rem 5rem' }}
            >
                <TripSection
                    title="Ongoing"
                    trips={categorizedTrips.ongoing}
                    onView={handleViewTrip}
                    isOpen={openSections.ongoing}
                    onToggle={() => toggleSection('ongoing')}
                />

                <TripSection
                    title="Upcoming"
                    trips={categorizedTrips.upcoming}
                    onView={handleViewTrip}
                    isOpen={openSections.upcoming}
                    onToggle={() => toggleSection('upcoming')}
                />

                <TripSection
                    title="Completed"
                    trips={categorizedTrips.completed}
                    onView={handleViewTrip}
                    isOpen={openSections.completed}
                    onToggle={() => toggleSection('completed')}
                />

                {/* Empty State */}
                {trips.length === 0 && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                        }}
                    >
                        <MapPin size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                            No trips yet
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Start planning your first adventure!
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/plan-trip')}
                            style={{
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                            }}
                        >
                            Plan a Trip
                        </motion.button>
                    </motion.div>
                )}
            </motion.section>
        </div>
    );
};

export default MyTripsPage;
