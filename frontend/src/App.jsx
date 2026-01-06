import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import FeaturesPage from './components/FeaturesPage';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import Statistics from './components/Statistics';
import Charts from './components/Charts';
import Insights from './components/Insights';
import ColumnSelector from './components/ColumnSelector';
import DatasetComparison from './components/DatasetComparison';
import ChatInterface from './components/ChatInterface';
import { uploadFile, analyzeData, exportPDF, downloadCleanedData } from './api/client';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [uploadInfo2, setUploadInfo2] = useState(null); // Second dataset
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisResults2, setAnalysisResults2] = useState(null); // Second dataset results
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [chatMode, setChatMode] = useState(false);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);

    toast.info('📤 Uploading file...', { autoClose: 2000 });

    try {
      const uploadResponse = await uploadFile(file);
      setUploadInfo(uploadResponse);
      toast.success('✅ File uploaded! Click "Analyze" to process.', { autoClose: 3000 });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 5000 });
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload2 = async (file) => {
    setLoading(true);
    setError(null);

    toast.info('📤 Uploading second dataset...', { autoClose: 2000 });

    try {
      const uploadResponse = await uploadFile(file);
      setUploadInfo2(uploadResponse);
      toast.success('✅ Second dataset uploaded!', { autoClose: 3000 });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, { autoClose: 5000 });
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadInfo) {
      toast.error('Please upload a file first!', { autoClose: 3000 });
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResults(null);

    toast.info('🔍 Analyzing data...', { autoClose: false, toastId: 'analyzing' });

    try {
      const analysisResponse = await analyzeData(uploadInfo.filepath);
      setAnalysisResults(analysisResponse);

      toast.dismiss('analyzing');
      toast.success('🎉 Analysis complete!', { autoClose: 3000 });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.dismiss('analyzing');
      toast.error(`❌ ${errorMsg}`, { autoClose: 5000 });
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!uploadInfo || !uploadInfo2) {
      toast.error('Please upload both datasets first!', { autoClose: 3000 });
      return;
    }

    setLoading(true);
    setError(null);

    toast.info('🔍 Analyzing both datasets...', { autoClose: false, toastId: 'comparing' });

    try {
      // Analyze both datasets
      const [analysis1, analysis2] = await Promise.all([
        analyzeData(uploadInfo.filepath),
        analyzeData(uploadInfo2.filepath)
      ]);

      console.log('Analysis 1:', analysis1);
      console.log('Analysis 2:', analysis2);

      setAnalysisResults(analysis1);
      setAnalysisResults2(analysis2);

      toast.dismiss('comparing');
      toast.success('🎉 Comparison complete!', { autoClose: 3000 });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.dismiss('comparing');
      toast.error(`❌ ${errorMsg}`, { autoClose: 5000 });
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page === 'home') {
      // Reset all state when going home
      setUploadInfo(null);
      setUploadInfo2(null);
      setAnalysisResults(null);
      setAnalysisResults2(null);
      setError(null);
      setCompareMode(false);
    }
  };

  const handleReset = () => {
    setUploadInfo(null);
    setUploadInfo2(null);
    setAnalysisResults(null);
    setAnalysisResults2(null);
    setError(null);
    setCompareMode(false);
    setCurrentPage('analyze');
    toast.info('🔄 Ready for new analysis', { autoClose: 2000 });
  };

  const handleExportPDF = async () => {
    if (!analysisResults || !uploadInfo) {
      toast.error('No analysis results to export!', { autoClose: 3000 });
      return;
    }

    setExporting(true);
    toast.info('📄 Generating PDF report...', { autoClose: false, toastId: 'exporting' });

    try {
      const pdfBlob = await exportPDF(uploadInfo.filepath, analysisResults);

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss('exporting');
      toast.success('✅ PDF downloaded successfully!', { autoClose: 3000 });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to export PDF';
      toast.dismiss('exporting');
      toast.error(`❌ ${errorMsg}`, { autoClose: 5000 });
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadCleaned = async () => {
    if (!uploadInfo) {
      toast.error('No data to download!', { autoClose: 3000 });
      return;
    }

    setDownloading(true);
    toast.info('📥 Downloading cleaned data...', { autoClose: false, toastId: 'downloading' });

    try {
      await downloadCleanedData(uploadInfo.filepath);

      toast.dismiss('downloading');
      toast.success('✅ Cleaned CSV downloaded!', { autoClose: 3000 });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to download cleaned data';
      toast.dismiss('downloading');
      toast.error(`❌ ${errorMsg}`, { autoClose: 5000 });
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Home Page */}
      {currentPage === 'home' && (
        <HomePage onGetStarted={() => setCurrentPage('analyze')} />
      )}

      {/* Features Page */}
      {currentPage === 'features' && (
        <FeaturesPage />
      )}

      {/* Analyze Page */}
      {currentPage === 'analyze' && (
        <>
          {/* Header */}
          <header className="app-header">
            <div className="logo">
              <span className="logo-icon">0</span>
              <h1>ZeroAnalyst</h1>
            </div>
            <p className="tagline">From Zero to Insights in Seconds</p>

            {/* Action Buttons */}
            {(uploadInfo || analysisResults) && (
              <div className="header-actions">
                <button className="action-btn reset-btn" onClick={handleReset}>
                  🏠 Back to Home
                </button>

                {uploadInfo && !analysisResults && !compareMode && (
                  <>
                    <button className="action-btn analyze-btn" onClick={handleAnalyze} disabled={loading}>
                      {loading ? '⏳ Analyzing...' : '🔍 Analyze'}
                    </button>
                    <button className="action-btn compare-btn" onClick={() => setCompareMode(true)}>
                      📊 Compare Datasets
                    </button>
                  </>
                )}

                {analysisResults && !compareMode && (
                  <>
                    <button
                      className="action-btn"
                      onClick={() => setChatMode(!chatMode)}
                      style={{
                        background: chatMode ? 'linear-gradient(135deg, #00ff88, #00d4ff)' : 'var(--bg-tertiary)',
                        color: chatMode ? '#0a0a0f' : 'var(--text-primary)'
                      }}
                    >
                      {chatMode ? '📊 View Analysis' : '💬 Chat with AI'}
                    </button>
                    <button
                      className="action-btn export-btn"
                      onClick={handleExportPDF}
                      disabled={exporting}
                    >
                      {exporting ? '⏳ Generating...' : '📄 Export PDF'}
                    </button>
                    <button
                      className="action-btn download-btn"
                      onClick={handleDownloadCleaned}
                      disabled={downloading}
                    >
                      {downloading ? '⏳ Downloading...' : '📥 Download Cleaned CSV'}
                    </button>
                  </>
                )}

                {compareMode && uploadInfo2 && (
                  <button className="action-btn analyze-btn" onClick={handleCompare} disabled={loading}>
                    {loading ? '⏳ Comparing...' : '🔍 Compare Both'}
                  </button>
                )}
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="app-main">
            <div className="container">
              {/* File Upload Section */}
              {!analysisResults && !compareMode && (
                <section className="upload-section">
                  <FileUpload onUploadSuccess={handleFileUpload} />
                </section>
              )}

              {/* Compare Mode: Two File Uploads */}
              {compareMode && !analysisResults && (
                <div className="compare-upload-section">
                  <div className="compare-header">
                    <h2>📊 Compare Two Datasets</h2>
                    <p>Upload two datasets to compare their statistics and insights</p>
                  </div>
                  <div className="compare-uploads">
                    <div className="upload-card">
                      <h3>Dataset 1 {uploadInfo && '✅'}</h3>
                      {!uploadInfo ? (
                        <FileUpload onUploadSuccess={handleFileUpload} />
                      ) : (
                        <div className="uploaded-file-info">
                          <p className="file-name">📄 {uploadInfo.filename}</p>
                          <p className="file-stats">{uploadInfo.rows} rows × {uploadInfo.columns} columns</p>
                        </div>
                      )}
                    </div>
                    <div className="upload-card">
                      <h3>Dataset 2 {uploadInfo2 && '✅'}</h3>
                      {!uploadInfo2 ? (
                        <FileUpload onUploadSuccess={handleFileUpload2} />
                      ) : (
                        <div className="uploaded-file-info">
                          <p className="file-name">📄 {uploadInfo2.filename}</p>
                          <p className="file-stats">{uploadInfo2.rows} rows × {uploadInfo2.columns} columns</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>{compareMode ? 'Comparing datasets...' : 'Analyzing your data...'}</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Single Dataset Results */}
              {analysisResults && !analysisResults2 && !loading && (
                <>
                  {chatMode ? (
                    <ChatInterface
                      filepath={uploadInfo.filepath}
                      filename={uploadInfo.filename}
                      dataContext={analysisResults.statistics}
                      onClose={() => setChatMode(false)}
                    />
                  ) : (
                    <div className="results-container">
                      <DataPreview
                        preview={analysisResults.preview}
                        cleaningReport={analysisResults.cleaning_report}
                      />

                      <Statistics stats={analysisResults.statistics} />

                      <Charts charts={analysisResults.charts} />

                      <Insights insights={analysisResults.insights} />

                      <ColumnSelector
                        filepath={uploadInfo.filepath}
                        columns={analysisResults.preview.columns}
                        columnTypes={analysisResults.cleaning_report.column_types}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Comparison Results */}
              {analysisResults && analysisResults2 && !loading && (
                <DatasetComparison
                  dataset1={analysisResults}
                  dataset2={analysisResults2}
                  uploadInfo1={uploadInfo}
                  uploadInfo2={uploadInfo2}
                />
              )}

              {/* Empty State */}
              {!loading && !analysisResults && !error && (
                <div className="empty-state">
                  <div className="empty-icon">🎯</div>
                  <h2>Ready to Unlock Insights?</h2>
                  <p>Upload your CSV or Excel file to get started</p>
                  <div className="features">
                    <div className="feature">
                      <span>🧹</span>
                      <p>Automatic Data Cleaning</p>
                    </div>
                    <div className="feature">
                      <span>📊</span>
                      <p>Beautiful Visualizations</p>
                    </div>
                    <div className="feature">
                      <span>💡</span>
                      <p>AI-Powered Insights</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="app-footer">
            <p>Built with ❤️ using Python + React</p>
          </footer>
        </>
      )}

      {/* Toast Notifications - Global */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
