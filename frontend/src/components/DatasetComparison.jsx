import './DatasetComparison.css';

function DatasetComparison({ dataset1, dataset2, uploadInfo1, uploadInfo2 }) {
    // Debug logging
    console.log('DatasetComparison received:', { dataset1, dataset2, uploadInfo1, uploadInfo2 });

    // Validate that datasets have the required structure
    if (!dataset1 || !dataset1.statistics || !dataset1.statistics.overview || !dataset1.preview || !dataset1.cleaning_report) {
        return (
            <div className="dataset-comparison">
                <div className="comparison-header">
                    <h2>⚠️ Error Loading Dataset 1</h2>
                    <p>The first dataset is missing required data. Please try re-analyzing.</p>
                </div>
            </div>
        );
    }

    if (!dataset2 || !dataset2.statistics || !dataset2.statistics.overview || !dataset2.preview || !dataset2.cleaning_report) {
        return (
            <div className="dataset-comparison">
                <div className="comparison-header">
                    <h2>⚠️ Error Loading Dataset 2</h2>
                    <p>The second dataset is missing required data. Please try re-analyzing.</p>
                </div>
            </div>
        );
    }

    // Extract data for comparison
    const stats1 = dataset1.statistics.overview;
    const stats2 = dataset2.statistics.overview;
    const preview1 = dataset1.preview;
    const preview2 = dataset2.preview;

    // Find common and different columns
    const columns1 = new Set(preview1.columns);
    const columns2 = new Set(preview2.columns);
    const commonColumns = preview1.columns.filter(col => columns2.has(col));
    const uniqueToDataset1 = preview1.columns.filter(col => !columns2.has(col));
    const uniqueToDataset2 = preview2.columns.filter(col => !columns1.has(col));

    // Calculate similarity percentage
    const totalUniqueColumns = new Set([...preview1.columns, ...preview2.columns]).size;
    const similarityPercentage = ((commonColumns.length / totalUniqueColumns) * 100).toFixed(1);

    return (
        <div className="dataset-comparison">
            <div className="comparison-header">
                <h2>📊 Dataset Comparison Analysis</h2>
                <p>Comprehensive comparison of both datasets</p>
            </div>

            {/* Overview Cards */}
            <div className="comparison-overview">
                <div className="overview-card">
                    <div className="card-icon">📁</div>
                    <h3>Dataset 1</h3>
                    <p className="dataset-name">{uploadInfo1.filename}</p>
                    <div className="dataset-stats">
                        <span>{stats1.total_rows.toLocaleString()} rows</span>
                        <span>×</span>
                        <span>{stats1.total_columns} columns</span>
                    </div>
                </div>

                <div className="overview-card similarity-card">
                    <div className="card-icon">🔗</div>
                    <h3>Similarity</h3>
                    <div className="similarity-percentage">{similarityPercentage}%</div>
                    <p className="similarity-text">Column Match</p>
                </div>

                <div className="overview-card">
                    <div className="card-icon">📁</div>
                    <h3>Dataset 2</h3>
                    <p className="dataset-name">{uploadInfo2.filename}</p>
                    <div className="dataset-stats">
                        <span>{stats2.total_rows.toLocaleString()} rows</span>
                        <span>×</span>
                        <span>{stats2.total_columns} columns</span>
                    </div>
                </div>
            </div>

            {/* Column Comparison */}
            <div className="comparison-section">
                <h3>📋 Column Comparison</h3>
                <div className="column-comparison-grid">
                    <div className="column-group common-columns">
                        <h4>✅ Common Columns ({commonColumns.length})</h4>
                        <div className="column-list">
                            {commonColumns.length > 0 ? (
                                commonColumns.map((col, idx) => (
                                    <span key={idx} className="column-badge common">{col}</span>
                                ))
                            ) : (
                                <p className="no-data">No common columns</p>
                            )}
                        </div>
                    </div>

                    <div className="column-group unique-columns">
                        <h4>🔵 Only in Dataset 1 ({uniqueToDataset1.length})</h4>
                        <div className="column-list">
                            {uniqueToDataset1.length > 0 ? (
                                uniqueToDataset1.map((col, idx) => (
                                    <span key={idx} className="column-badge unique-1">{col}</span>
                                ))
                            ) : (
                                <p className="no-data">All columns are common</p>
                            )}
                        </div>
                    </div>

                    <div className="column-group unique-columns">
                        <h4>🟣 Only in Dataset 2 ({uniqueToDataset2.length})</h4>
                        <div className="column-list">
                            {uniqueToDataset2.length > 0 ? (
                                uniqueToDataset2.map((col, idx) => (
                                    <span key={idx} className="column-badge unique-2">{col}</span>
                                ))
                            ) : (
                                <p className="no-data">All columns are common</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistical Comparison */}
            <div className="comparison-section">
                <h3>📊 Statistical Comparison</h3>
                <div className="stats-comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Dataset 1</th>
                                <th>Dataset 2</th>
                                <th>Difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Total Rows</td>
                                <td>{stats1.total_rows.toLocaleString()}</td>
                                <td>{stats2.total_rows.toLocaleString()}</td>
                                <td className={stats1.total_rows > stats2.total_rows ? 'positive' : 'negative'}>
                                    {stats1.total_rows > stats2.total_rows ? '+' : ''}
                                    {(stats1.total_rows - stats2.total_rows).toLocaleString()}
                                </td>
                            </tr>
                            <tr>
                                <td>Total Columns</td>
                                <td>{stats1.total_columns}</td>
                                <td>{stats2.total_columns}</td>
                                <td className={stats1.total_columns > stats2.total_columns ? 'positive' : 'negative'}>
                                    {stats1.total_columns > stats2.total_columns ? '+' : ''}
                                    {stats1.total_columns - stats2.total_columns}
                                </td>
                            </tr>
                            <tr>
                                <td>Numeric Columns</td>
                                <td>{stats1.numeric_columns}</td>
                                <td>{stats2.numeric_columns}</td>
                                <td className={stats1.numeric_columns > stats2.numeric_columns ? 'positive' : 'negative'}>
                                    {stats1.numeric_columns > stats2.numeric_columns ? '+' : ''}
                                    {stats1.numeric_columns - stats2.numeric_columns}
                                </td>
                            </tr>
                            <tr>
                                <td>Categorical Columns</td>
                                <td>{stats1.categorical_columns}</td>
                                <td>{stats2.categorical_columns}</td>
                                <td className={stats1.categorical_columns > stats2.categorical_columns ? 'positive' : 'negative'}>
                                    {stats1.categorical_columns > stats2.categorical_columns ? '+' : ''}
                                    {stats1.categorical_columns - stats2.categorical_columns}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Data Quality Comparison */}
            <div className="comparison-section">
                <h3>🧹 Data Quality Comparison</h3>
                <div className="quality-comparison-grid">
                    <div className="quality-card">
                        <h4>Dataset 1</h4>
                        <div className="quality-metrics">
                            <div className="metric">
                                <span className="metric-label">Duplicates Removed</span>
                                <span className="metric-value">{dataset1.cleaning_report.duplicates_removed || 0}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Missing Values Filled</span>
                                <span className="metric-value">{dataset1.cleaning_report.missing_filled || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="quality-card">
                        <h4>Dataset 2</h4>
                        <div className="quality-metrics">
                            <div className="metric">
                                <span className="metric-label">Duplicates Removed</span>
                                <span className="metric-value">{dataset2.cleaning_report.duplicates_removed || 0}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Missing Values Filled</span>
                                <span className="metric-value">{dataset2.cleaning_report.missing_filled || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Insights Comparison */}
            <div className="comparison-section">
                <h3>💡 Key Insights</h3>
                <div className="insights-comparison">
                    <div className="insight-card">
                        <div className="insight-icon">📈</div>
                        <div className="insight-content">
                            <h4>Size Comparison</h4>
                            <p>
                                {stats1.total_rows > stats2.total_rows
                                    ? `Dataset 1 has ${((stats1.total_rows / stats2.total_rows - 1) * 100).toFixed(1)}% more rows`
                                    : stats2.total_rows > stats1.total_rows
                                        ? `Dataset 2 has ${((stats2.total_rows / stats1.total_rows - 1) * 100).toFixed(1)}% more rows`
                                        : 'Both datasets have the same number of rows'}
                            </p>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">🔗</div>
                        <div className="insight-content">
                            <h4>Column Overlap</h4>
                            <p>
                                {commonColumns.length > 0
                                    ? `${commonColumns.length} common columns found (${similarityPercentage}% match)`
                                    : 'No common columns between datasets'}
                            </p>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">📊</div>
                        <div className="insight-content">
                            <h4>Data Types</h4>
                            <p>
                                Dataset 1: {stats1.numeric_columns} numeric, {stats1.categorical_columns} categorical<br />
                                Dataset 2: {stats2.numeric_columns} numeric, {stats2.categorical_columns} categorical
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DatasetComparison;
