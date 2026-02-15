import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import FeaturesPage from './components/FeaturesPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HistoryPage from './components/HistoryPage';
import FileUpload from './components/FileUpload';
import S3Upload from './components/S3Upload';
import DataPreview from './components/DataPreview';
import Statistics from './components/Statistics';
import Charts from './components/Charts';
import Insights from './components/Insights';
import ColumnSelector from './components/ColumnSelector';
import DatasetComparison from './components/DatasetComparison';
import ChatInterface from './components/ChatInterface';
import { uploadFile, analyzeData, exportPDF, downloadCleanedData } from './api/client';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [uploadInfo2, setUploadInfo2] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisResults2, setAnalysisResults2] = useState(null);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [chatMode, setChatMode] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }

    setAuthLoading(false);
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    toast.success(`Welcome back, ${userData.email}!`, { autoClose: 3000 });
  };

  // Handle register
  const handleRegister = (userData) => {
    setUser(userData);
    toast.success(`Welcome to ZeroAnalyst, ${userData.email}!`, { autoClose: 3000 });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setUploadInfo(null);
    setAnalysisResults(null);
    toast.info('Logged out successfully', { autoClose: 2000 });
    navigate('/');
  };

  // File upload handler
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

  // S3 upload handler
  const handleS3Upload = (previewData) => {
    setUploadInfo(previewData);
    toast.success('✅ File imported from S3! Click "Analyze" to process.', { autoClose: 3000 });
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
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || 'An error occurred. Please try again.';
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
      const [analysis1, analysis2] = await Promise.all([
        analyzeData(uploadInfo.filepath),
        analyzeData(uploadInfo2.filepath)
      ]);

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

  const handleReset = () => {
    setUploadInfo(null);
    setUploadInfo2(null);
    setAnalysisResults(null);
    setAnalysisResults2(null);
    setError(null);
    setCompareMode(false);
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

  if (authLoading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><Navbar user={user} onLogout={handleLogout} /><HomePage onGetStarted={() => navigate(user ? '/analyze' : '/login')} /></>} />
        <Route path="/features" element={<><Navbar user={user} onLogout={handleLogout} /><FeaturesPage /></>} />
        <Route path="/login" element={user ? <Navigate to="/analyze" replace /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={user ? <Navigate to="/analyze" replace /> : <RegisterPage onRegister={handleRegister} />} />

        {/* Protected Routes */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <>
                <Navbar user={user} onLogout={handleLogout} />
                <HistoryPage />
              </>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <>
                <Navbar user={user} onLogout={handleLogout} />
                <header className="app-header">
                  <div className="logo">
                    <span className="logo-icon">0</span>
                    <h1>ZeroAnalyst</h1>
                  </div>
                  <p className="tagline">From Zero to Insights in Seconds</p>

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
                          <button className="action-btn export-btn" onClick={handleExportPDF} disabled={exporting}>
                            {exporting ? '⏳ Generating...' : '📄 Export PDF'}
                          </button>
                          <button className="action-btn download-btn" onClick={handleDownloadCleaned} disabled={downloading}>
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

                <main className="app-main">
                  <div className="container">
                    {!analysisResults && !compareMode && (
                      <section className="upload-section">
                        <FileUpload onUploadSuccess={handleFileUpload} />
                        <div className="upload-divider">
                          <span>OR</span>
                        </div>
                        <S3Upload onS3FileSelect={handleS3Upload} />
                      </section>
                    )}

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

                    {loading && (
                      <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>{compareMode ? 'Comparing datasets...' : 'Analyzing your data...'}</p>
                      </div>
                    )}

                    {error && (
                      <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
                      </div>
                    )}

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

                    {analysisResults && analysisResults2 && !loading && (
                      <DatasetComparison
                        dataset1={analysisResults}
                        dataset2={analysisResults2}
                        uploadInfo1={uploadInfo}
                        uploadInfo2={uploadInfo2}
                      />
                    )}

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

                <footer className="app-footer">
                  <p>Built with ❤️ using Python + React</p>
                </footer>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>

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
        theme="dark"
      />
    </div>
  );
}

export default App;
