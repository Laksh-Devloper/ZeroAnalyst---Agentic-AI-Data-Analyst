import './Statistics.css';

function Statistics({ stats }) {
    if (!stats) return null;

    const { overview, numeric_stats, categorical_stats } = stats;

    return (
        <div className="statistics-container">
            <div className="section-header">
                <h2>📊 Statistics</h2>
            </div>

            <div className="stats-grid">
                {/* Overview Cards */}
                <div className="stat-card overview">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <h3>{overview.total_rows.toLocaleString()}</h3>
                        <p>Total Rows</p>
                    </div>
                </div>

                <div className="stat-card overview">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <h3>{overview.total_columns}</h3>
                        <p>Total Columns</p>
                    </div>
                </div>

                <div className="stat-card overview">
                    <div className="stat-icon">🔢</div>
                    <div className="stat-content">
                        <h3>{overview.numeric_columns}</h3>
                        <p>Numeric Columns</p>
                    </div>
                </div>

                <div className="stat-card overview">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-content">
                        <h3>{overview.categorical_columns}</h3>
                        <p>Categorical Columns</p>
                    </div>
                </div>
            </div>

            {/* Numeric Statistics */}
            {Object.keys(numeric_stats).length > 0 && (
                <div className="detailed-stats">
                    <h3 className="stats-section-title">Numeric Column Statistics</h3>
                    {Object.entries(numeric_stats).map(([col, colStats]) => (
                        <div key={col} className="stat-detail-card">
                            <h4>{col}</h4>
                            <div className="stat-metrics">
                                <div className="metric">
                                    <span className="metric-label">Mean</span>
                                    <span className="metric-value">{colStats.mean.toFixed(2)}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Median</span>
                                    <span className="metric-value">{colStats.median.toFixed(2)}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Std Dev</span>
                                    <span className="metric-value">{colStats.std.toFixed(2)}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Min</span>
                                    <span className="metric-value">{colStats.min.toFixed(2)}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Max</span>
                                    <span className="metric-value">{colStats.max.toFixed(2)}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Sum</span>
                                    <span className="metric-value">{colStats.sum.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Categorical Statistics */}
            {Object.keys(categorical_stats).length > 0 && (
                <div className="detailed-stats">
                    <h3 className="stats-section-title">Categorical Column Statistics</h3>
                    {Object.entries(categorical_stats).map(([col, colStats]) => (
                        <div key={col} className="stat-detail-card">
                            <h4>{col}</h4>
                            <div className="stat-metrics">
                                <div className="metric">
                                    <span className="metric-label">Unique Values</span>
                                    <span className="metric-value">{colStats.unique_values}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Most Common</span>
                                    <span className="metric-value">{colStats.most_common}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Frequency</span>
                                    <span className="metric-value">{colStats.most_common_count}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Statistics;
