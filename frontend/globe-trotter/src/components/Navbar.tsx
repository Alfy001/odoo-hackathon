import { Search, Bell, Settings } from 'lucide-react';
import '../styles/Dashboard.css';

const Navbar = () => {
    return (
        <nav className="navbar glass">
            <div className="nav-brand">GlobalTrotter</div>

            <div className="nav-actions">
                <div className="search-container">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search your next adventure..."
                        className="search-input"
                    />
                </div>

                <Bell size={24} className="nav-icon" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
                <Settings size={24} className="nav-icon" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />

                <div className="user-profile">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        alt="Profile"
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
