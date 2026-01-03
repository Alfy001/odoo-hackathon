import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Calendar, MapPin, Edit2,
    ArrowRight, Loader2, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserTrips, type Trip } from '../services/api';
import '../styles/Dashboard.css';

// Trip Preview Card
const TripPreviewCard = ({
    trip,
    delay,
    onView
}: {
    trip: Trip;
    delay: number;
    onView: (tripId: string) => void;
}) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'TBD';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            style={{
                background: 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            }}
            whileHover={{
                y: -5,
                borderColor: 'var(--primary)',
            }}
            onClick={() => onView(trip.id)}
        >
            {/* Placeholder image area */}
            <div style={{
                height: '120px',
                background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(99, 102, 241, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <MapPin size={32} color="var(--primary)" style={{ opacity: 0.5 }} />
            </div>

            <div style={{ padding: '1rem' }}>
                <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {trip.title}
                </h4>
                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.75rem',
                }}>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
                <button
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'rgba(129, 140, 248, 0.1)',
                        border: '1px solid rgba(129, 140, 248, 0.2)',
                        borderRadius: '8px',
                        color: 'var(--primary)',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                    }}
                >
                    View <ArrowRight size={14} />
                </button>
            </div>
        </motion.div>
    );
};

// Main Profile Page
const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const userStr = localStorage.getItem('user');
                const userData = userStr ? JSON.parse(userStr) : null;

                if (!userData?.id) {
                    navigate('/login');
                    return;
                }

                setUser(userData);
                const userTrips = await getUserTrips(userData.id);
                setTrips(userTrips);
            } catch (err) {
                console.error('Failed to load profile data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    // Categorize trips
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const preplannedTrips = trips.filter(trip => {
        const start = trip.startDate ? new Date(trip.startDate) : null;
        return start && now < start;
    });

    const previousTrips = trips.filter(trip => {
        const end = trip.endDate ? new Date(trip.endDate) : null;
        return end && now > end;
    });

    const handleViewTrip = (tripId: string) => {
        navigate(`/trip/${tripId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
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

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '2rem 5rem',
                }}
            >
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '2rem',
                        padding: '2rem',
                        background: 'var(--card-bg)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid var(--border)',
                        marginBottom: '2rem',
                    }}
                >
                    {/* Avatar */}
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <User size={48} color="white" />
                    </div>

                    {/* User Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                        }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                                {user?.name || 'User'}
                            </h1>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsEditing(!isEditing)}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: 'rgba(129, 140, 248, 0.1)',
                                        border: '1px solid rgba(129, 140, 248, 0.2)',
                                        borderRadius: '10px',
                                        color: 'var(--primary)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <Edit2 size={16} /> Edit Profile
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        borderRadius: '10px',
                                        color: '#ef4444',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <LogOut size={16} /> Logout
                                </motion.button>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: 'var(--text-muted)',
                            }}>
                                <Mail size={18} />
                                <span>{user?.email || 'No email'}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: 'var(--text-muted)',
                            }}>
                                <Calendar size={18} />
                                <span>{trips.length} trips planned</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Preplanned Trips */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ marginBottom: '2.5rem' }}
                >
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        Preplanned Trips
                        <span style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)',
                            fontWeight: '400',
                        }}>
                            ({preplannedTrips.length})
                        </span>
                    </h2>

                    {preplannedTrips.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1.25rem',
                        }}>
                            {preplannedTrips.slice(0, 4).map((trip, idx) => (
                                <TripPreviewCard
                                    key={trip.id}
                                    trip={trip}
                                    delay={idx * 0.05}
                                    onView={handleViewTrip}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '2rem',
                            background: 'var(--card-bg)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                        }}>
                            No upcoming trips. Plan your next adventure!
                        </div>
                    )}
                </motion.section>

                {/* Previous Trips */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        Previous Trips
                        <span style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)',
                            fontWeight: '400',
                        }}>
                            ({previousTrips.length})
                        </span>
                    </h2>

                    {previousTrips.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1.25rem',
                        }}>
                            {previousTrips.slice(0, 4).map((trip, idx) => (
                                <TripPreviewCard
                                    key={trip.id}
                                    trip={trip}
                                    delay={idx * 0.05}
                                    onView={handleViewTrip}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '2rem',
                            background: 'var(--card-bg)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                        }}>
                            No completed trips yet.
                        </div>
                    )}
                </motion.section>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
