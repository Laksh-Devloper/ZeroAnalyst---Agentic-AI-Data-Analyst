import { useState } from 'react';
import './S3Upload.css';

function S3Upload({ onS3FileSelect }) {
    const [s3Url, setS3Url] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!s3Url.trim()) {
            setError('Please enter an S3 URL');
            return;
        }

        // Validate S3 URL format
        const s3Pattern = /^https?:\/\/.*\.s3.*\.amazonaws\.com\/.*|^s3:\/\/.*/;
        if (!s3Pattern.test(s3Url)) {
            setError('Invalid S3 URL format. Use: https://bucket.s3.region.amazonaws.com/file or s3://bucket/file');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:5001/api/upload-from-s3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ s3_url: s3Url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to fetch file from S3');
            }

            // Call parent callback with full file info
            if (onS3FileSelect) {
                onS3FileSelect(data);
            }

            setS3Url('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="s3-upload">
            <div className="s3-upload-header">
                <h3>📦 Import from AWS S3</h3>
                <p>Provide your S3 file URL to analyze</p>
            </div>

            <form onSubmit={handleSubmit} className="s3-upload-form">
                <div className="s3-input-group">
                    <input
                        type="text"
                        className="s3-input"
                        placeholder="https://bucket.s3.region.amazonaws.com/file.csv"
                        value={s3Url}
                        onChange={(e) => setS3Url(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="s3-submit-btn"
                        disabled={loading || !s3Url.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Fetching...
                            </>
                        ) : (
                            <>
                                <span>🔗</span>
                                Import
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="s3-error">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                <div className="s3-examples">
                    <p className="s3-examples-title">Supported formats:</p>
                    <code>https://mybucket.s3.us-east-1.amazonaws.com/data.csv</code>
                    <code>s3://mybucket/data.xlsx</code>
                </div>
            </form>
        </div>
    );
}

export default S3Upload;
