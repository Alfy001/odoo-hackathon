import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, LayoutGrid, ListFilter, Calendar, ArrowRight, Search, X, Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PlaceCard from '../components/PlaceCard';
import { searchPlaces, type Place } from '../services/api';
import '../styles/Dashboard.css';

// --- Local Components ---

const RegionCard = ({ name, image, delay }: { name: string, image: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -5 }}
        className="region-card"
    >
        <img src={image} alt={name} />
        <div className="region-name">{name}</div>
    </motion.div>
);

const TripCard = ({ title, status, date, image, delay }: { title: string, status: string, date: string, image: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="trip-card"
    >
        <img src={image} alt={title} className="trip-image" />
        <div className="trip-content">
            <div className="trip-header">
                <h3 className="trip-title">{title}</h3>
                <span className={`trip-status status-${status.toLowerCase()}`}>{status}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Calendar size={14} />
                <span>{date}</span>
            </div>
            <button style={{ marginTop: '1.5rem', background: 'transparent', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                View Details <ArrowRight size={16} />
            </button>
        </div>
    </motion.div>
);

// --- Main Page ---

const LandingPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchError(null);
        setHasSearched(true);

        try {
            const results = await searchPlaces(searchQuery, {
                type: 'tourist_attraction',
                sortBy: 'rating',
            });
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchError('Failed to search places. Please try again.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
        setSearchError(null);
    };

    const handlePlaceClick = (place: Place) => {
        console.log('Selected place:', place);
        // TODO: Navigate to place details or add to trip
    };

    const regions = [
        { name: 'Tokyo', image: '/tokyo.png' },
        { name: 'Paris', image: '/paris.png' },
        { name: 'Swiss Alps', image: '/alps.png' },
        { name: 'Safari', image: '/safari.png' },
        { name: 'Santorini', image: '/banner.png' },
    ];

    const trips = [
        { title: 'Summer in Kyoto', status: 'Completed', date: 'June 2025', image: '/tokyo.png' },
        { title: 'Parisian Escape', status: 'Upcoming', date: 'Dec 2025', image: '/paris.png' },
        { title: 'Swiss Adventure', status: 'Upcoming', date: 'Jan 2026', image: '/alps.png' },
    ];

    if (isLoading) {
        return (
            <div className="dashboard-container">
                <Navbar />
                <div style={{ padding: '2rem 5rem' }}>
                    <div className="skeleton" style={{ width: '100%', height: '450px', borderRadius: '32px', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Navbar />

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-section"
            >
                <div className="hero-banner">
                    <img src="/banner.png" alt="Featured Trip" />
                    <div className="hero-overlay">
                        <span style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Adventure</span>
                        <h2>Santorini Dream</h2>
                        <p style={{ maxWidth: '600px', color: 'var(--text-muted)' }}>
                            Experience the breathtaking views and crystal clear waters of the Mediterranean's most iconic destination.
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Search Bar */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ padding: '0 5rem', marginTop: '1.5rem' }}
            >
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
                            placeholder="Search tourist attractions, hotels, restaurants..."
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
                        {searchQuery && (
                            <motion.button
                                type="button"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={clearSearch}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={16} color="var(--text-muted)" />
                            </motion.button>
                        )}
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
                            <>
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                Search
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.section>

            {/* Control Bar */}
            <section className="control-bar">
                <div className="btn-filter">
                    <LayoutGrid size={20} /> Group by
                </div>
                <div className="btn-filter">
                    <Filter size={20} /> Filter
                </div>
                <div className="btn-filter">
                    <ListFilter size={20} /> Sort by...
                </div>
            </section>

            {/* Search Results */}
            <AnimatePresence>
                {hasSearched && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 5rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1.5rem',
                            }}>
                                <h2 className="section-title" style={{ margin: 0 }}>
                                    Search Results
                                    {searchResults.length > 0 && (
                                        <span style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-muted)',
                                            fontWeight: '400',
                                            marginLeft: '0.75rem',
                                        }}>
                                            ({searchResults.length} places found)
                                        </span>
                                    )}
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={clearSearch}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Clear Results
                                </motion.button>
                            </div>

                            {/* Error State */}
                            {searchError && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        padding: '2rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '16px',
                                        textAlign: 'center',
                                        color: '#ef4444',
                                    }}
                                >
                                    {searchError}
                                </motion.div>
                            )}

                            {/* Loading State */}
                            {isSearching && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '1.5rem',
                                }}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            style={{
                                                height: '380px',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: '20px',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Results Grid */}
                            {!isSearching && searchResults.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '1.5rem',
                                }}>
                                    {searchResults.map((place, index) => (
                                        <PlaceCard
                                            key={place.place_id}
                                            place={place}
                                            delay={index * 0.1}
                                            onClick={handlePlaceClick}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!isSearching && !searchError && searchResults.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        padding: '4rem 2rem',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '1.1rem' }}>No places found for "{searchQuery}"</p>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Try a different search term</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Top Regional Selections */}
            <section>
                <h2 className="section-title">Top Regional Selections</h2>
                <div className="region-scroll">
                    {regions.map((region, idx) => (
                        <RegionCard key={region.name} {...region} delay={0.2 + idx * 0.1} />
                    ))}
                </div>
            </section>

            {/* Previous Trips */}
            <section style={{ marginTop: '2rem' }}>
                <h2 className="section-title">Previous Trips</h2>
                <div className="trips-grid">
                    {trips.map((trip, idx) => (
                        <TripCard key={trip.title} {...trip} delay={0.4 + idx * 0.1} />
                    ))}
                </div>
            </section>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fab-trip"
                onClick={() => navigate('/plan-trip')}
            >
                <Plus size={24} /> Plan a trip
            </motion.button>
        </div>
    );
};

export default LandingPage;
