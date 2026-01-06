import Plot from 'react-plotly.js';
import './InteractiveChart.css';

function InteractiveChart({ chartData, title }) {
    if (!chartData) {
        return (
            <div className="chart-error">
                <p>No chart data available</p>
            </div>
        );
    }

    // Plotly configuration
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        displaylogo: false,
        toImageButtonOptions: {
            format: 'png',
            filename: title || 'chart',
            height: 800,
            width: 1200,
            scale: 2
        }
    };

    return (
        <div className="interactive-chart">
            <Plot
                data={chartData.data}
                layout={{
                    ...chartData.layout,
                    autosize: true,
                    margin: { t: 60, r: 40, b: 60, l: 60 }
                }}
                config={config}
                style={{ width: '100%', height: '100%' }}
                useResizeHandler={true}
            />
        </div>
    );
}

export default InteractiveChart;
