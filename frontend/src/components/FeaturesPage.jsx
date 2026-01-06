import './FeaturesPage.css';

function FeaturesPage() {
    return (
        <div className="features-page">
            {/* Hero Section */}
            <section className="features-hero">
                <div className="hero-background">
                    <div className="grid-overlay"></div>
                    <div className="glow-orb orb-1"></div>
                    <div className="glow-orb orb-2"></div>
                </div>

                <div className="features-hero-content">
                    <div className="hero-badge">
                        <span className="badge-pulse"></span>
                        <span>Complete Feature Set</span>
                    </div>
                    <h1 className="features-title">
                        <span className="gradient-text">Everything You Need</span>
                        <span>To Analyze Data Like a Pro</span>
                    </h1>
                    <p className="features-description">
                        Powerful features that make data analysis effortless, fast, and insightful
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-content">
                {/* AI Chat */}
                <div className="feature-block featured">
                    <div className="feature-block-header">
                        <div className="feature-icon-large">💬</div>
                        <h2>Conversational AI Analysis</h2>
                        <p className="feature-subtitle">Ask questions, get instant answers</p>
                    </div>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="feature-card-icon">🤖</div>
                            <h3>Natural Language Queries</h3>
                            <p>Ask anything in plain English - no SQL or coding required</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">⚡</div>
                            <h3>Real-Time Responses</h3>
                            <p>Get instant answers powered by Gemini 2.5 Flash</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">💡</div>
                            <h3>Smart Suggestions</h3>
                            <p>AI suggests relevant questions based on your data</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">🔮</div>
                            <h3>Context Awareness</h3>
                            <p>Remembers conversation history for follow-up questions</p>
                        </div>
                    </div>
                </div>

                {/* Data Cleaning */}
                <div className="feature-block">
                    <div className="feature-block-header">
                        <div className="feature-icon-large">🧹</div>
                        <h2>Automated Data Cleaning</h2>
                        <p className="feature-subtitle">Perfect data, zero effort</p>
                    </div>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="feature-card-icon">✓</div>
                            <h3>Duplicate Removal</h3>
                            <p>Automatically detects and removes duplicate rows</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">✓</div>
                            <h3>Missing Values</h3>
                            <p>Intelligently fills gaps using median/mode strategies</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">✓</div>
                            <h3>Type Detection</h3>
                            <p>Auto-detects numeric, categorical, and datetime columns</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">✓</div>
                            <h3>Smart Filtering</h3>
                            <p>Removes low-quality columns automatically</p>
                        </div>
                    </div>
                </div>

                {/* Visualizations */}
                <div className="feature-block">
                    <div className="feature-block-header">
                        <div className="feature-icon-large">📊</div>
                        <h2>Interactive Visualizations</h2>
                        <p className="feature-subtitle">Beautiful charts, powerful insights</p>
                    </div>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="feature-card-icon">📈</div>
                            <h3>Line Charts</h3>
                            <p>Trend analysis with datetime support</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">📊</div>
                            <h3>Histograms</h3>
                            <p>Distribution analysis with reference lines</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">📦</div>
                            <h3>Box Plots</h3>
                            <p>Outlier detection with quartiles</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">📊</div>
                            <h3>Bar Charts</h3>
                            <p>Category frequency analysis</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">🥧</div>
                            <h3>Pie Charts</h3>
                            <p>Proportion breakdown for categories</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">🔍</div>
                            <h3>Interactive</h3>
                            <p>Zoom, pan, hover, and export</p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="feature-block">
                    <div className="feature-block-header">
                        <div className="feature-icon-large">📈</div>
                        <h2>Statistical Analysis</h2>
                        <p className="feature-subtitle">Deep insights, clear metrics</p>
                    </div>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="feature-card-icon">📊</div>
                            <h3>Descriptive Stats</h3>
                            <p>Mean, median, mode, std dev, quartiles</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">🔗</div>
                            <h3>Correlations</h3>
                            <p>Correlation matrix with top relationships</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">📋</div>
                            <h3>Distributions</h3>
                            <p>Unique values and frequency counts</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">📊</div>
                            <h3>Data Overview</h3>
                            <p>Complete quality metrics and summaries</p>
                        </div>
                    </div>
                </div>

                {/* AI Insights */}
                <div className="feature-block">
                    <div className="feature-block-header">
                        <div className="feature-icon-large">🔮</div>
                        <h2>AI-Powered Insights</h2>
                        <p className="feature-subtitle">Discover what matters</p>
                    </div>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="feature-card-icon">📈</div>
                            <h3>Trend Detection</h3>
                            <p>Identifies upward/downward patterns</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">⚠️</div>
                            <h3>Anomaly Detection</h3>
                            <p>Highlights unusual patterns and outliers</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">🔗</div>
                            <h3>Relationship Finder</h3>
                            <p>Discovers strong correlations</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">🎯</div>
                            <h3>Dominance Analysis</h3>
                            <p>Detects category dominance</p>
                        </div>
                    </div>
                </div>

                {/* Export */}
                <div className="feature-block">
                    <div className="feature-block-header">
                        <div className="feature-icon-large">📄</div>
                        <h2>Export & Share</h2>
                        <p className="feature-subtitle">Professional reports, instant delivery</p>
                    </div>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="feature-card-icon">📄</div>
                            <h3>PDF Reports</h3>
                            <p>Professional analysis reports</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">📊</div>
                            <h3>Chart Export</h3>
                            <p>Download as PNG or SVG</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">📋</div>
                            <h3>Clean Data</h3>
                            <p>Export cleaned CSV files</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default FeaturesPage;
