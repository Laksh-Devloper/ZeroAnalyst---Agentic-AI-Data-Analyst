import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HistoryPage.css';

function HistoryPage({ onSelectFile }) {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5001/api/history/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }

            const data = await response.json();
            setHistory(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileClick = (item) => {
        // Navigate to analyze page and trigger re-analysis
        if (onSelectFile) {
            onSelectFile(item);
        }
        navigate('/analyze');
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent file click

        if (!confirm('Delete this history item?')) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:5001/api/history/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setHistory(history.filter(item => item.id !== id));
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="history-page">
            <div className="history-container">
                <div className="history-header">
                    <h1>📊 Analysis History</h1>
                    <p>Click on any file to re-analyze it</p>
                </div>

                {loading && (
                    <div className="history-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading history...</p>
                    </div>
                )}

                {error && (
                    <div className="history-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && history.length === 0 && (
                    <div className="history-empty">
                        <div className="empty-icon">📁</div>
                        <h2>No Analysis History</h2>
                        <p>Upload and analyze your first file to see it here</p>
                        <button className="btn-primary" onClick={() => navigate('/analyze')}>
                            Start Analyzing
                        </button>
                    </div>
                )}

                {!loading && !error && history.length > 0 && (
                    <div className="history-grid">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="history-card"
                                onClick={() => handleFileClick(item)}
                            >
                                <div className="history-card-icon">📄</div>
                                <div className="history-card-content">
                                    <h3 className="history-card-title">{item.filename}</h3>
                                    <div className="history-card-meta">
                                        <span className="history-card-date">
                                            🕒 {formatDate(item.created_at)}
                                        </span>
                                        <span className="history-card-size">
                                            💾 {formatFileSize(item.file_size)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="history-card-delete"
                                    onClick={(e) => handleDelete(item.id, e)}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HistoryPage;
