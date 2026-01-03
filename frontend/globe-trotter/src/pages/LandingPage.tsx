import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, LayoutGrid, ListFilter, Calendar, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

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
            >
                <Plus size={24} /> Plan a trip
            </motion.button>
        </div>
    );
};

export default LandingPage;
