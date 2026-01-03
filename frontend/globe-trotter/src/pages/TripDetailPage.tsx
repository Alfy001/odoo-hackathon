import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Calendar, MapPin, Edit2, Trash2, Save, X,
    Loader2, ChevronDown, ChevronUp, Globe, Lock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    getTripDetails, updateTrip, deleteTrip, deleteStop,
    type Trip, type TripStop
} from '../services/api';
import '../styles/Dashboard.css';

// Stop Card Component
const StopCard = ({
    stop,
    index,
    onDelete,
    isDeleting
}: {
    stop: TripStop;
    index: number;
    onDelete: (stopId: string) => void;
    isDeleting: boolean;
}) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not set';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
            }}
        >
            {/* Order Badge */}
            <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.875rem',
                flexShrink: 0,
            }}>
                {stop.order}
            </div>

            {/* Stop Info */}
            <div style={{ flex: 1 }}>
                <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                }}>
                    {stop.name || stop.city?.name || 'Unknown Location'}
                </h4>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                }}>
                    {stop.city?.country}
                </p>
            </div>

            {/* Dates */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
            }}>
                <Calendar size={14} />
                <span>{formatDate(stop.startDate)} - {formatDate(stop.endDate)}</span>
            </div>

            {/* Delete Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(stop.id)}
                disabled={isDeleting}
                style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.5 : 1,
                }}
            >
                {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" color="#ef4444" />
                ) : (
                    <Trash2 size={16} color="#ef4444" />
                )}
            </motion.button>
        </motion.div>
    );
};

// Main Page Component
const TripDetailPage = () => {
    const navigate = useNavigate();
    const { tripId } = useParams<{ tripId: string }>();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Delete
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingStopId, setDeletingStopId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Sections
    const [showStops, setShowStops] = useState(true);

    useEffect(() => {
        const fetchTrip = async () => {
            if (!tripId) {
                setError('Trip ID not provided');
                setIsLoading(false);
                return;
            }

            try {
                const tripData = await getTripDetails(tripId);
                setTrip(tripData);
                // Initialize edit fields
                setEditTitle(tripData.title);
                setEditDescription(tripData.description || '');
                setEditStartDate(tripData.startDate?.split('T')[0] || '');
                setEditEndDate(tripData.endDate?.split('T')[0] || '');
                setEditIsPublic(tripData.isPublic);
            } catch (err) {
                console.error('Failed to fetch trip:', err);
                setError('Failed to load trip details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrip();
    }, [tripId]);

    const handleSave = async () => {
        if (!tripId || !trip) return;

        setIsSaving(true);
        try {
            const updatedTrip = await updateTrip(tripId, {
                title: editTitle,
                description: editDescription,
                startDate: editStartDate || undefined,
                endDate: editEndDate || undefined,
                isPublic: editIsPublic,
            });
            setTrip({ ...trip, ...updatedTrip });
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update trip:', err);
            setError('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTrip = async () => {
        if (!tripId) return;

        setIsDeleting(true);
        try {
            await deleteTrip(tripId);
            navigate('/my-trips');
        } catch (err) {
            console.error('Failed to delete trip:', err);
            setError('Failed to delete trip');
            setIsDeleting(false);
        }
    };

    const handleDeleteStop = async (stopId: string) => {
        if (!tripId) return;

        setDeletingStopId(stopId);
        try {
            await deleteStop(tripId, stopId);
            setTrip(prev => prev ? {
                ...prev,
                stops: prev.stops?.filter(s => s.id !== stopId)
            } : null);
        } catch (err) {
            console.error('Failed to delete stop:', err);
            setError('Failed to delete stop');
        } finally {
            setDeletingStopId(null);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not set';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
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

    if (error || !trip) {
        return (
            <div className="dashboard-container">
                <Navbar />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(100vh - 80px)',
                    gap: '1rem',
                }}>
                    <p style={{ color: '#ef4444' }}>{error || 'Trip not found'}</p>
                    <button
                        onClick={() => navigate('/my-trips')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--primary)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        Back to My Trips
                    </button>
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
                    onClick={() => navigate('/my-trips')}
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
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', flex: 1 }}>
                    Trip Details
                </h1>
            </motion.div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '2rem 5rem',
                }}
            >
                {/* Trip Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'var(--card-bg)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid var(--border)',
                        padding: '2rem',
                        marginBottom: '2rem',
                    }}
                >
                    {isEditing ? (
                        // Edit Mode
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Trip Title"
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-main)',
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                }}
                            />
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Description"
                                rows={3}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem',
                                    resize: 'none',
                                }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editEndDate}
                                        onChange={(e) => setEditEndDate(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                        }}
                                    />
                                </div>
                            </div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={editIsPublic}
                                    onChange={(e) => setEditIsPublic(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ color: 'var(--text-muted)' }}>Make trip public</span>
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontWeight: '700',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        opacity: isSaving ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsEditing(false)}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--text-muted)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <X size={18} /> Cancel
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{trip.title}</h2>
                                        {trip.isPublic ? (
                                            <Globe size={18} color="var(--success)" />
                                        ) : (
                                            <Lock size={18} color="var(--text-muted)" />
                                        )}
                                    </div>
                                    {trip.description && (
                                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                            {trip.description}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsEditing(true)}
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
                                        <Edit2 size={16} /> Edit
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowDeleteConfirm(true)}
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
                                        <Trash2 size={16} /> Delete
                                    </motion.button>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '2rem',
                                marginTop: '1.5rem',
                                paddingTop: '1.5rem',
                                borderTop: '1px solid var(--border)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Calendar size={18} />
                                    <div>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date</p>
                                        <p style={{ color: 'var(--text-main)', fontWeight: '600' }}>{formatDate(trip.startDate)}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Calendar size={18} />
                                    <div>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End Date</p>
                                        <p style={{ color: 'var(--text-main)', fontWeight: '600' }}>{formatDate(trip.endDate)}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                    <MapPin size={18} />
                                    <div>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stops</p>
                                        <p style={{ color: 'var(--text-main)', fontWeight: '600' }}>{trip.stops?.length || 0} destinations</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Stops Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'var(--card-bg)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                    }}
                >
                    <button
                        onClick={() => setShowStops(!showStops)}
                        style={{
                            width: '100%',
                            padding: '1.5rem 2rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            Trip Stops ({trip.stops?.length || 0})
                        </h3>
                        {showStops ? (
                            <ChevronUp size={20} color="var(--text-muted)" />
                        ) : (
                            <ChevronDown size={20} color="var(--text-muted)" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showStops && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ padding: '0 2rem 2rem', overflow: 'hidden' }}
                            >
                                {trip.stops && trip.stops.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {trip.stops
                                            .sort((a, b) => a.order - b.order)
                                            .map((stop, idx) => (
                                                <StopCard
                                                    key={stop.id}
                                                    stop={stop}
                                                    index={idx}
                                                    onDelete={handleDeleteStop}
                                                    isDeleting={deletingStopId === stop.id}
                                                />
                                            ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                                        No stops added yet.
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0, 0, 0, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                            }}
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: 'var(--card-bg)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border)',
                                    padding: '2rem',
                                    maxWidth: '400px',
                                    textAlign: 'center',
                                }}
                            >
                                <Trash2 size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                    Delete Trip?
                                </h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    This action cannot be undone. All stops and activities will be deleted.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        style={{
                                            flex: 1,
                                            padding: '0.875rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteTrip}
                                        disabled={isDeleting}
                                        style={{
                                            flex: 1,
                                            padding: '0.875rem',
                                            background: '#ef4444',
                                            border: 'none',
                                            borderRadius: '10px',
                                            color: 'white',
                                            fontWeight: '600',
                                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                                            opacity: isDeleting ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                        }}
                                    >
                                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default TripDetailPage;
