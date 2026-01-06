import './Charts.css';

function Charts({ charts }) {
    if (!charts || Object.keys(charts).length === 0) return null;

    const chartTitles = {
        bar: '📊 Category Distribution',
        line: '📈 Trend Analysis',
        pie: '🥧 Proportion Breakdown'
    };

    return (
        <div className="charts-container">
            <div className="section-header">
                <h2>📉 Visualizations</h2>
            </div>

            <div className="charts-grid">
                {Object.entries(charts).map(([chartType, chartData]) => (
                    <div key={chartType} className="chart-card">
                        <h3>{chartTitles[chartType]}</h3>
                        <div className="chart-image-container">
                            <img src={chartData} alt={`${chartType} chart`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Charts;
