import { useState } from 'react';
import './FileUpload.css';

function FileUpload({ onUploadSuccess }) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        handleFileSelect(droppedFile);
    };

    const handleFileInput = (e) => {
        const selectedFile = e.target.files[0];
        handleFileSelect(selectedFile);
    };

    const handleFileSelect = (selectedFile) => {
        if (selectedFile) {
            const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
                alert('Please upload a CSV or Excel file');
                return;
            }

            setFile(selectedFile);
            uploadFile(selectedFile);
        }
    };

    const uploadFile = async (fileToUpload) => {
        setUploading(true);
        try {
            await onUploadSuccess(fileToUpload);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="file-upload-container">
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-input"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />

                {uploading ? (
                    <div className="upload-status">
                        <div className="upload-loader">
                            <div className="loader-ring"></div>
                            <div className="loader-ring"></div>
                            <div className="loader-ring"></div>
                            <div className="loader-icon">📤</div>
                        </div>
                        <p className="upload-text">Uploading your file...</p>
                        <p className="upload-subtext">This may take a few seconds</p>
                    </div>
                ) : file ? (
                    <div className="file-info">
                        <div className="file-icon">📄</div>
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <div className="upload-icon">📊</div>
                        <h3>Drop your data file here</h3>
                        <p>or</p>
                        <label htmlFor="file-input" className="upload-button">
                            Choose File
                        </label>
                        <p className="file-types">Supports CSV, Excel (.xlsx, .xls)</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FileUpload;
