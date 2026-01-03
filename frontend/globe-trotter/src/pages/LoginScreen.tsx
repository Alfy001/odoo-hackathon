import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const LoginScreen = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Logging in with:', formData);
        const DUMMY_API_URL = 'https://api.example.com/v1/auth/login';
        console.log('Sending request to:', DUMMY_API_URL);
        alert('Login attempted! Check console for dummy request details.');
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
    };

    return (
        <div className="auth-container">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="auth-card glass"
            >
                <div className="auth-header">
                    <motion.div variants={itemVariants} className="photo-placeholder">
                        <User size={48} />
                    </motion.div>
                    <motion.h1 variants={itemVariants}>Welcome Back</motion.h1>
                    <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)' }}>
                        Please enter your details
                    </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <motion.div variants={itemVariants} className="form-group">
                        <label>Username</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Enter your username"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                        Login
                    </motion.button>
                </form>

                <motion.div variants={itemVariants} className="auth-footer">
                    Don't have an account? <Link to="/register">Register here</Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginScreen;
