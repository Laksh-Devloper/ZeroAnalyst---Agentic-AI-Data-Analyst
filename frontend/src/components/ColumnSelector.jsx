import { useState } from 'react';
import { generatePlotlyChart } from '../api/client';
import InteractiveChart from './InteractiveChart';
import './ColumnSelector.css';

function ColumnSelector({ filepath, columns, columnTypes }) {
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [chartType, setChartType] = useState('line');
    const [loading, setLoading] = useState(false);
    const [generatedChart, setGeneratedChart] = useState(null);
    const [error, setError] = useState(null);

    // Get numeric and categorical columns
    const numericColumns = Object.entries(columnTypes)
        .filter(([_, type]) => type === 'numeric')
        .map(([name, _]) => name);

    const categoricalColumns = Object.entries(columnTypes)
        .filter(([_, type]) => type === 'categorical')
        .map(([name, _]) => name);

    const handleGenerateChart = async (column) => {
        setLoading(true);
        setError(null);
        setSelectedColumn(column);

        // Auto-select appropriate chart type based on column type
        const columnType = columnTypes[column];
        let selectedChartType = chartType;

        if (columnType === 'numeric') {
            // For numeric: line, histogram, or box
            if (!['line', 'histogram', 'box'].includes(chartType)) {
                selectedChartType = 'line';
                setChartType('line');
            }
        } else if (columnType === 'categorical') {
            // For categorical: bar or pie
            if (!['bar', 'pie'].includes(chartType)) {
                selectedChartType = 'bar';
                setChartType('bar');
            }
        }

        console.log('DEBUG: filepath:', filepath);
        console.log('DEBUG: column:', column);
        console.log('DEBUG: chartType:', selectedChartType);

        try {
            const result = await generatePlotlyChart(filepath, column, selectedChartType);
            setGeneratedChart(result.chart);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to generate chart';
            setError(errorMsg);
            console.error('Chart generation error:', err);
            console.error('Error response:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleChartTypeChange = (type) => {
        setChartType(type);
        if (selectedColumn) {
            handleGenerateChart(selectedColumn);
        }
    };

    // Determine which chart types are available based on selected column
    const getAvailableChartTypes = () => {
        if (!selectedColumn) return { line: true, histogram: true, box: true, bar: true, pie: true };

        const columnType = columnTypes[selectedColumn];

        if (columnType === 'numeric') {
            return { line: true, histogram: true, box: true, bar: false, pie: false };
        } else if (columnType === 'categorical') {
            return { line: false, histogram: false, box: false, bar: true, pie: true };
        }

        return { line: true, histogram: true, box: true, bar: true, pie: true };
    };

    const availableCharts = getAvailableChartTypes();

    return (
        <div className="column-selector-container">
            <div className="section-header">
                <h2>🎨 Interactive Visualizations</h2>
                <p className="section-subtitle">Click any column to generate interactive charts with zoom, pan, and hover</p>
            </div>

            {/* Chart Type Selector */}
            <div className="chart-type-selector">
                <button
                    className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                    onClick={() => handleChartTypeChange('line')}
                    disabled={!availableCharts.line}
                >
                    📈 Line
                </button>
                <button
                    className={`chart-type-btn ${chartType === 'histogram' ? 'active' : ''}`}
                    onClick={() => handleChartTypeChange('histogram')}
                    disabled={!availableCharts.histogram}
                >
                    📊 Histogram
                </button>
                <button
                    className={`chart-type-btn ${chartType === 'box' ? 'active' : ''}`}
                    onClick={() => handleChartTypeChange('box')}
                    disabled={!availableCharts.box}
                >
                    📦 Box Plot
                </button>
                <button
                    className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                    onClick={() => handleChartTypeChange('bar')}
                    disabled={!availableCharts.bar}
                >
                    📊 Bar Chart
                </button>
                <button
                    className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                    onClick={() => handleChartTypeChange('pie')}
                    disabled={!availableCharts.pie}
                >
                    🥧 Pie Chart
                </button>
            </div>

            {/* Numeric Columns */}
            {numericColumns.length > 0 && (
                <div className="column-group">
                    <h3>Numeric Columns</h3>
                    <div className="column-buttons">
                        {numericColumns.map((column) => (
                            <button
                                key={column}
                                className={`column-btn numeric ${selectedColumn === column ? 'selected' : ''}`}
                                onClick={() => handleGenerateChart(column)}
                                disabled={loading}
                            >
                                <span className="column-icon">🔢</span>
                                <span className="column-name">{column}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Categorical Columns */}
            {categoricalColumns.length > 0 && (
                <div className="column-group">
                    <h3>Categorical Columns</h3>
                    <div className="column-buttons">
                        {categoricalColumns.map((column) => (
                            <button
                                key={column}
                                className={`column-btn categorical ${selectedColumn === column ? 'selected' : ''}`}
                                onClick={() => handleGenerateChart(column)}
                                disabled={loading}
                            >
                                <span className="column-icon">🏷️</span>
                                <span className="column-name">{column}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="chart-loading">
                    <div className="spinner"></div>
                    <p>Generating chart for <strong>{selectedColumn}</strong>...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="chart-error">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                </div>
            )}

            {/* Generated Chart */}
            {generatedChart && !loading && (
                <div className="generated-chart-container">
                    <div className="chart-header">
                        <h3>
                            {chartType === 'line' ? '📈' :
                                chartType === 'histogram' ? '📊' :
                                    chartType === 'box' ? '📦' :
                                        chartType === 'pie' ? '🥧' : '📊'}
                            {' '}{selectedColumn} - {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Analysis
                        </h3>
                        <p className="chart-subtitle">Interactive chart - zoom, pan, and hover for details</p>
                    </div>
                    <InteractiveChart
                        chartData={generatedChart}
                        title={`${selectedColumn}_${chartType}`}
                    />
                </div>
            )}
        </div>
    );
}

export default ColumnSelector;
