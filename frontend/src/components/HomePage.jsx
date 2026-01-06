import './HomePage.css';

function HomePage({ onGetStarted }) {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="grid-overlay"></div>
                    <div className="glow-orb orb-1"></div>
                    <div className="glow-orb orb-2"></div>
                    <div className="glow-orb orb-3"></div>
                </div>

                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-pulse"></span>
                        <span className="badge-text">🤖 AI-Powered Data Analysis</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="title-line-1">From Zero to Insights</span>
                        <span className="title-line-2 gradient-text">In Seconds</span>
                    </h1>

                    <p className="hero-description">
                        Chat with your data using AI. No coding, no analysts, no waiting.
                        <br />
                        <strong>Just upload and ask.</strong>
                    </p>

                    <div className="hero-actions">
                        <button className="btn-hero-primary" onClick={onGetStarted}>
                            <span className="btn-text">Start Analyzing Free</span>
                            <span className="btn-icon">→</span>
                            <div className="btn-glow"></div>
                        </button>
                        <div className="hero-tagline">
                            <span className="tagline-icon">✨</span>
                            <span>No credit card required</span>
                        </div>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-value">
                                <span className="stat-number">0</span>
                                <span className="stat-unit">sec</span>
                            </div>
                            <div className="stat-label">Setup Time</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-value">
                                <span className="stat-number">∞</span>
                            </div>
                            <div className="stat-label">Insights</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-value">
                                <span className="stat-number">100</span>
                                <span className="stat-unit">%</span>
                            </div>
                            <div className="stat-label">Automated</div>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="chat-demo">
                        <div className="chat-header">
                            <div className="chat-avatar">0</div>
                            <div className="chat-title">
                                <div className="chat-name">ZeroAnalyst</div>
                                <div className="chat-status">
                                    <span className="status-dot"></span>
                                    <span>Ready to analyze</span>
                                </div>
                            </div>
                        </div>
                        <div className="chat-messages">
                            <div className="chat-message user">
                                <div className="message-bubble">Show me revenue trends</div>
                            </div>
                            <div className="chat-message ai">
                                <div className="message-bubble">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Why ZeroAnalyst?</h2>
                    <p className="section-description">
                        The fastest way from data to decisions
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <div className="feature-icon">💬</div>
                        </div>
                        <h3 className="feature-title">Conversational AI</h3>
                        <p className="feature-description">
                            Ask questions in plain English. Get instant answers with charts and insights.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <div className="feature-icon">🧹</div>
                        </div>
                        <h3 className="feature-title">Auto Data Cleaning</h3>
                        <p className="feature-description">
                            Handles missing values, duplicates, and type detection automatically.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <div className="feature-icon">📊</div>
                        </div>
                        <h3 className="feature-title">Smart Visualizations</h3>
                        <p className="feature-description">
                            AI generates the perfect charts for your data. Interactive and beautiful.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <div className="feature-icon">🔮</div>
                        </div>
                        <h3 className="feature-title">Predictive Analytics</h3>
                        <p className="feature-description">
                            Forecast trends and detect anomalies with advanced ML algorithms.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <div className="feature-icon">⚡</div>
                        </div>
                        <h3 className="feature-title">Lightning Fast</h3>
                        <p className="feature-description">
                            Powered by Gemini 2.5 Flash. Get insights in seconds, not hours.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <div className="feature-icon">🔒</div>
                        </div>
                        <h3 className="feature-title">Secure & Private</h3>
                        <p className="feature-description">
                            Your data stays on your machine. We never store or share it.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
                <div className="section-header">
                    <h2 className="section-title">Three Steps to Insights</h2>
                    <p className="section-description">
                        It's really that simple
                    </p>
                </div>

                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-number">
                            <span>1</span>
                            <div className="step-glow"></div>
                        </div>
                        <div className="step-content">
                            <h3 className="step-title">Upload</h3>
                            <p className="step-description">
                                Drop your CSV or Excel file
                            </p>
                        </div>
                    </div>

                    <div className="step-connector">
                        <div className="connector-line"></div>
                        <div className="connector-dot"></div>
                    </div>

                    <div className="step-card">
                        <div className="step-number">
                            <span>2</span>
                            <div className="step-glow"></div>
                        </div>
                        <div className="step-content">
                            <h3 className="step-title">Chat</h3>
                            <p className="step-description">
                                Ask anything about your data
                            </p>
                        </div>
                    </div>

                    <div className="step-connector">
                        <div className="connector-line"></div>
                        <div className="connector-dot"></div>
                    </div>

                    <div className="step-card">
                        <div className="step-number">
                            <span>3</span>
                            <div className="step-glow"></div>
                        </div>
                        <div className="step-content">
                            <h3 className="step-title">Decide</h3>
                            <p className="step-description">
                                Get actionable insights instantly
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-background">
                    <div className="cta-glow"></div>
                </div>
                <div className="cta-content">
                    <h2 className="cta-title">
                        Ready to Stop Guessing?
                    </h2>
                    <p className="cta-description">
                        Join the future of data analysis. Start making data-driven decisions today.
                    </p>
                    <button className="btn-cta" onClick={onGetStarted}>
                        <span>Analyze Your First Dataset</span>
                        <span className="cta-arrow">→</span>
                    </button>
                    <p className="cta-note">
                        Free forever • No credit card • No analyst required
                    </p>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
