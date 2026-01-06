import './DataPreview.css';

function DataPreview({ preview, cleaningReport }) {
    if (!preview) return null;

    return (
        <div className="data-preview-container">
            <div className="section-header">
                <h2>📋 Data Preview</h2>
                <div className="data-stats">
                    <span className="stat-badge">{preview.shape[0]} rows</span>
                    <span className="stat-badge">{preview.shape[1]} columns</span>
                </div>
            </div>

            {cleaningReport && cleaningReport.actions.length > 0 && (
                <div className="cleaning-report">
                    <h3>🧹 Cleaning Actions</h3>
                    <ul>
                        {cleaningReport.actions.map((action, index) => (
                            <li key={index}>{action}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {preview.columns.map((col, index) => (
                                <th key={index}>
                                    <div className="column-header">
                                        <span className="column-name">{col}</span>
                                        <span className={`type-badge ${cleaningReport?.column_types[col]}`}>
                                            {cleaningReport?.column_types[col] || 'unknown'}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {preview.data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {preview.columns.map((col, colIndex) => (
                                    <td key={colIndex}>{row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataPreview;
