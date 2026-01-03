import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, ExternalLink } from 'lucide-react';
import type { Place } from '../services/api';
import { getPlacePhotoUrl } from '../services/api';

interface PlaceCardProps {
    place: Place;
    delay?: number;
    onClick?: (place: Place) => void;
}

const PlaceCard = ({ place, delay = 0, onClick }: PlaceCardProps) => {
    const [imageError, setImageError] = useState(false);
    const isOpen = place.opening_hours?.open_now;

    // Format the type for display
    const formatType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Get primary type (first meaningful one)
    const primaryType = place.types?.find(t =>
        !['point_of_interest', 'establishment'].includes(t)
    ) || place.types?.[0] || 'Place';

    // Get a placeholder image based on place type
    const getPlaceholderImage = () => {
        if (place.types?.includes('tourist_attraction')) return '/banner.png';
        if (place.types?.includes('lodging')) return '/tokyo.png';
        if (place.types?.includes('restaurant')) return '/paris.png';
        return '/alps.png';
    };

    // Get photo URL from Google Places API
    const photoUrl = getPlacePhotoUrl(place, 800);
    const imageSource = (!imageError && photoUrl) ? photoUrl : getPlaceholderImage();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="place-card"
            onClick={() => onClick?.(place)}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.3s ease',
            }}
        >
            {/* Image Container */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '180px',
                overflow: 'hidden',
            }}>
                <img
                    src={imageSource}
                    alt={place.name}
                    onError={() => setImageError(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />

                {/* Open/Closed Badge */}
                {place.opening_hours !== undefined && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: isOpen
                            ? 'rgba(34, 197, 94, 0.9)'
                            : 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        <Clock size={12} />
                        {isOpen ? 'Open' : 'Closed'}
                    </div>
                )}

                {/* Type Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: '500',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    textTransform: 'capitalize',
                }}>
                    {formatType(primaryType)}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem' }}>
                {/* Name */}
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4',
                }}>
                    {place.name}
                </h3>

                {/* Rating */}
                {place.rating && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '0.75rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            padding: '4px 8px',
                            borderRadius: '8px',
                        }}>
                            <Star size={14} fill="white" color="white" />
                            <span style={{
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '0.875rem',
                            }}>
                                {place.rating.toFixed(1)}
                            </span>
                        </div>
                        {place.user_ratings_total && (
                            <span style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem'
                            }}>
                                ({place.user_ratings_total.toLocaleString()} reviews)
                            </span>
                        )}
                    </div>
                )}

                {/* Address */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                }}>
                    <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>
                        {place.formatted_address}
                    </span>
                </div>

                {/* View Details Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #4f46e5))',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                    }}
                >
                    View Details <ExternalLink size={14} />
                </motion.button>
            </div>
        </motion.div>
    );
};

export default PlaceCard;
