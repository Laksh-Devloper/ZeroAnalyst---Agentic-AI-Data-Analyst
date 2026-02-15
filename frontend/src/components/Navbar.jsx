import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-brand" onClick={() => navigate('/')}>
                    <div className="logo-icon">0</div>
                    <span className="logo-text">ZeroAnalyst</span>
                </div>

                {/* Desktop Navigation */}
                <div className="navbar-menu">
                    <button className="nav-link" onClick={() => navigate('/')}>
                        Home
                    </button>
                    <button className="nav-link" onClick={() => navigate('/features')}>
                        Features
                    </button>
                    {user && (
                        <>
                            <button className="nav-link" onClick={() => navigate('/analyze')}>
                                Analyze
                            </button>
                            <button className="nav-link" onClick={() => navigate('/history')}>
                                History
                            </button>
                        </>
                    )}
                </div>

                {/* User Actions */}
                <div className="navbar-actions">
                    {user ? (
                        <>
                            <div className="user-info">
                                <div className="user-avatar">
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="user-email">{user.email}</span>
                            </div>
                            <button className="btn-secondary" onClick={onLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn-ghost" onClick={() => navigate('/login')}>
                                Sign In
                            </button>
                            <button className="btn-primary" onClick={() => navigate('/register')}>
                                Get Started
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu">
                    <button
                        className="mobile-nav-link"
                        onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                    >
                        Home
                    </button>
                    <button
                        className="mobile-nav-link"
                        onClick={() => { navigate('/features'); setMobileMenuOpen(false); }}
                    >
                        Features
                    </button>
                    {user && (
                        <>
                            <button
                                className="mobile-nav-link"
                                onClick={() => { navigate('/analyze'); setMobileMenuOpen(false); }}
                            >
                                Analyze
                            </button>
                            <button
                                className="mobile-nav-link"
                                onClick={() => { navigate('/history'); setMobileMenuOpen(false); }}
                            >
                                History
                            </button>
                        </>
                    )}
                    {user ? (
                        <>
                            <div className="mobile-user-info">
                                <div className="user-avatar">
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span>{user.email}</span>
                            </div>
                            <button
                                className="btn-secondary mobile"
                                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn-ghost mobile"
                                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                            >
                                Sign In
                            </button>
                            <button
                                className="btn-primary mobile"
                                onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;
