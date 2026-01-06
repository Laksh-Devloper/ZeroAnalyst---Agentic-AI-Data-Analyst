import './Insights.css';

function Insights({ insights }) {
    if (!insights || insights.length === 0) return null;

    return (
        <div className="insights-container">
            <div className="section-header">
                <h2>💡 Key Insights</h2>
            </div>

            <div className="insights-list">
                {insights.map((insight, index) => (
                    <div key={index} className="insight-card" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="insight-number">{index + 1}</div>
                        <p className="insight-text">{insight}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Insights;
