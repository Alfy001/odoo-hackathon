import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const RegistrationScreen = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        country: '',
        password: '',
        confirmPassword: '',
        additionalInfo: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        console.log('Registering user:', formData);
        const DUMMY_API_URL = 'https://api.example.com/v1/auth/register';
        console.log('Sending request to:', DUMMY_API_URL);
        alert('Registration successful! (Dummy Request)');
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.2,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="auth-container">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="auth-card glass wide"
            >
                <div className="auth-header">
                    <motion.div variants={itemVariants} className="photo-placeholder">
                        <Camera size={44} />
                    </motion.div>
                    <motion.h1 variants={itemVariants}>Create Account</motion.h1>
                    <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)' }}>
                        Join our global community today
                    </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <motion.div variants={itemVariants} className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="John"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-row">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <div className="input-wrapper">
                                <input
                                    type="tel"
                                    placeholder="+91 9876543210"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="New York"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="United States"
                                    required
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-row">
                        <div className="form-group">
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
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-group">
                        <label>Additional Information ....</label>
                        <div className="input-wrapper">
                            <textarea
                                rows={3}
                                placeholder="Tell us more about yourself..."
                                value={formData.additionalInfo}
                                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                            ></textarea>
                        </div>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary"
                        style={{ width: '240px', alignSelf: 'center', marginTop: '1.5rem' }}
                    >
                        Register
                    </motion.button>
                </form>

                <motion.div variants={itemVariants} className="auth-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default RegistrationScreen;
