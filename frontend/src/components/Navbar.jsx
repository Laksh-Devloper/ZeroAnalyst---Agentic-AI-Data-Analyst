import { useState } from 'react';
import './Navbar.css';

function Navbar({ onNavigate, currentPage }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-brand" onClick={() => onNavigate('home')}>
                    <div className="logo-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                            <path d="M8 20L12 16L16 18L20 12L24 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#2563EB" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="logo-text">InsightFlow</span>
                </div>

                {/* Desktop Navigation */}
                <div className="navbar-menu">
                    <button
                        className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                        onClick={() => onNavigate('home')}
                    >
                        Home
                    </button>
                    <button
                        className={`nav-link ${currentPage === 'analyze' ? 'active' : ''}`}
                        onClick={() => onNavigate('analyze')}
                    >
                        Analyze
                    </button>
                    <button
                        className={`nav-link ${currentPage === 'features' ? 'active' : ''}`}
                        onClick={() => onNavigate('features')}
                    >
                        Features
                    </button>
                </div>

                {/* CTA Button */}
                <div className="navbar-actions">
                    <button
                        className="btn-primary"
                        onClick={() => onNavigate('analyze')}
                    >
                        Get Started
                    </button>
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
                        className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`}
                        onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                    >
                        Home
                    </button>
                    <button
                        className={`mobile-nav-link ${currentPage === 'analyze' ? 'active' : ''}`}
                        onClick={() => { onNavigate('analyze'); setMobileMenuOpen(false); }}
                    >
                        Analyze
                    </button>
                    <button
                        className={`mobile-nav-link ${currentPage === 'features' ? 'active' : ''}`}
                        onClick={() => { onNavigate('features'); setMobileMenuOpen(false); }}
                    >
                        Features
                    </button>
                    <button
                        className="btn-primary mobile"
                        onClick={() => { onNavigate('analyze'); setMobileMenuOpen(false); }}
                    >
                        Get Started
                    </button>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
