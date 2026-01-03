import { Search, Bell, Settings, Compass, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Dashboard.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navLinks = [
        { path: '/home', label: 'Explore', icon: Compass },
        { path: '/my-trips', label: 'My Trips', icon: null },
    ];

    return (
        <nav className="navbar glass">
            <div
                className="nav-brand"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/home')}
            >
                GlobalTrotter
            </div>

            {/* Nav Links */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
            }}>
                {navLinks.map(link => (
                    <motion.button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: location.pathname === link.path ? '700' : '500',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0',
                            borderBottom: location.pathname === link.path ? '2px solid var(--primary)' : '2px solid transparent',
                        }}
                    >
                        {link.icon && <link.icon size={18} />}
                        {link.label}
                    </motion.button>
                ))}
            </div>

            <div className="nav-actions">
                <div className="search-container" style={{ maxWidth: '300px' }}>
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                        style={{ padding: '0.75rem 1rem 0.75rem 2.75rem' }}
                    />
                </div>

                <Bell
                    size={22}
                    className="nav-icon"
                    style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                />
                <Settings
                    size={22}
                    className="nav-icon"
                    style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                />

                <motion.div
                    className="user-profile"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/profile')}
                    style={{
                        background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <User size={20} color="white" />
                </motion.div>
            </div>
        </nav>
    );
};

export default Navbar;

