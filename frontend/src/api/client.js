import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const analyzeData = async (filepath) => {
    const response = await axios.post(`${API_BASE_URL}/analyze`, {
        filepath,
    });

    return response.data;
};

export const deleteFile = async (filepath) => {
    const response = await axios.post(`${API_BASE_URL}/delete`, {
        filepath,
    });

    return response.data;
};

export const generateChart = async (filepath, columnName, chartType = 'trend') => {
    const response = await axios.post(`${API_BASE_URL}/generate-chart`, {
        filepath,
        column_name: columnName,
        chart_type: chartType,
    });

    return response.data;
};

export const generatePlotlyChart = async (filepath, columnName, chartType = 'line') => {
    const response = await axios.post(`${API_BASE_URL}/generate-plotly-chart`, {
        filepath,
        column_name: columnName,
        chart_type: chartType,
    });

    return response.data;
};

export const exportPDF = async (filepath, analysisResults) => {
    const response = await axios.post(`${API_BASE_URL}/export-pdf`, {
        filepath,
        analysis_results: analysisResults,
    }, {
        responseType: 'blob', // Important for file download
    });

    return response.data;
};

export const downloadCleanedData = async (filepath) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/download-cleaned-data`,
            { filepath },
            { responseType: 'blob' }  // Important for file download
        );

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cleaned_${filepath.split('/').pop()}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error downloading cleaned data:', error);
        throw error;
    }
};

export const healthCheck = async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
};

// ==================== AI Chat Functions ====================

/**
 * Initialize a chat session with the AI agent
 */
export const initChat = async (filepath) => {
    const response = await axios.post(`${API_BASE_URL}/chat/init`, {
        filepath,
    });
    return response.data;
};

/**
 * Send a message to the AI agent (HTTP)
 */
export const sendChatMessage = async (sessionId, message) => {
    const response = await axios.post(`${API_BASE_URL}/chat/message`, {
        session_id: sessionId,
        message,
    });
    return response.data;
};

/**
 * Get chat history for a session
 */
export const getChatHistory = async (sessionId) => {
    const response = await axios.get(`${API_BASE_URL}/chat/history/${sessionId}`);
    return response.data;
};

/**
 * Delete a chat session
 */
export const deleteChatSession = async (sessionId) => {
    const response = await axios.delete(`${API_BASE_URL}/chat/${sessionId}`);
    return response.data;
};

/**
 * Create WebSocket connection for real-time chat
 */
export const createChatWebSocket = (sessionId, callbacks = {}) => {
    const wsUrl = API_BASE_URL.replace('http', 'ws').replace('/api', '');
    const ws = new WebSocket(`${wsUrl}/ws/chat/${sessionId}`);

    ws.onopen = () => {
        console.log('WebSocket connected');
        if (callbacks.onOpen) callbacks.onOpen();
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'typing') {
            if (callbacks.onTyping) callbacks.onTyping();
        } else if (data.type === 'message') {
            if (callbacks.onMessage) callbacks.onMessage(data.message, data.timestamp);
        } else if (data.type === 'suggestions') {
            if (callbacks.onSuggestions) callbacks.onSuggestions(data.suggestions);
        } else if (data.type === 'error') {
            if (callbacks.onError) callbacks.onError(data.error);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (callbacks.onError) callbacks.onError(error);
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        if (callbacks.onClose) callbacks.onClose();
    };

    return {
        send: (message) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ message }));
            }
        },
        close: () => ws.close(),
        ws
    };
};
