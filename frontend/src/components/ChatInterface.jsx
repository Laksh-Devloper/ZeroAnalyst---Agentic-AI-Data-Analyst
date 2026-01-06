import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatInterface.css';
import { initChat, sendChatMessage, createChatWebSocket } from '../api/client';
import { toast } from 'react-toastify';

const ChatInterface = ({ filepath, filename, dataContext, onClose }) => {
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [useWebSocket, setUseWebSocket] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize chat session
    useEffect(() => {
        const initialize = async () => {
            try {
                setIsLoading(true);
                const response = await initChat(filepath);

                setSessionId(response.session_id);
                setSuggestions(response.suggestions || []);

                // Add AI greeting message
                setMessages([{
                    role: 'assistant',
                    content: response.message,
                    timestamp: new Date().toISOString()
                }]);

                // Initialize WebSocket if enabled
                if (useWebSocket && response.session_id) {
                    initializeWebSocket(response.session_id);
                }

                toast.success('Chat initialized! Ask me anything about your data.');
            } catch (error) {
                console.error('Error initializing chat:', error);
                toast.error('Failed to initialize chat. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (filepath) {
            initialize();
        }

        return () => {
            // Cleanup WebSocket on unmount
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [filepath]);

    // Initialize WebSocket connection
    const initializeWebSocket = (sid) => {
        wsRef.current = createChatWebSocket(sid, {
            onOpen: () => {
                console.log('WebSocket connected');
            },
            onMessage: (message, timestamp) => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: message,
                    timestamp
                }]);
                setIsTyping(false);
            },
            onTyping: () => {
                setIsTyping(true);
            },
            onSuggestions: (newSuggestions) => {
                setSuggestions(newSuggestions);
            },
            onError: (error) => {
                console.error('WebSocket error:', error);
                toast.error('Connection error. Falling back to HTTP.');
                setUseWebSocket(false);
            },
            onClose: () => {
                console.log('WebSocket closed');
            }
        });
    };

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Send message
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !sessionId) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        try {
            if (useWebSocket && wsRef.current) {
                // Send via WebSocket
                wsRef.current.send(inputMessage);
                setIsTyping(true);
            } else {
                // Send via HTTP
                setIsLoading(true);
                const response = await sendChatMessage(sessionId, inputMessage);

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.message,
                    timestamp: response.timestamp
                }]);

                if (response.suggestions) {
                    setSuggestions(response.suggestions);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
        inputRef.current?.focus();
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat-interface">
            {/* Sidebar */}
            <div className={`chat-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">0</div>
                        <span>ZeroAnalyst</span>
                    </div>
                </div>

                <div className="sidebar-content">
                    <div className="data-summary-card">
                        <div className="data-summary-title">Dataset Info</div>
                        <div className="data-summary-item">
                            <span className="data-summary-label">File:</span>
                            <span className="data-summary-value">{filename}</span>
                        </div>
                        {dataContext && (
                            <>
                                <div className="data-summary-item">
                                    <span className="data-summary-label">Rows:</span>
                                    <span className="data-summary-value">{dataContext.rows?.toLocaleString()}</span>
                                </div>
                                <div className="data-summary-item">
                                    <span className="data-summary-label">Columns:</span>
                                    <span className="data-summary-value">{dataContext.columns?.length}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {suggestions.length > 0 && (
                        <div className="data-summary-card">
                            <div className="data-summary-title">Suggested Questions</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {suggestions.slice(0, 5).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="btn-ghost"
                                        style={{ textAlign: 'left', fontSize: '0.8rem', padding: '0.5rem' }}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-main">
                <div className="chat-header">
                    <div>
                        <div className="chat-header-title">
                            <span>💬</span>
                            <span>Chat with AI</span>
                        </div>
                        <div className="chat-status">
                            <div className="status-dot"></div>
                            <span>AI is ready</span>
                        </div>
                    </div>

                    <div className="chat-header-actions">
                        <button
                            className="btn-ghost"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            title="Toggle sidebar"
                        >
                            {sidebarCollapsed ? '→' : '←'}
                        </button>
                        {onClose && (
                            <button className="btn-ghost" onClick={onClose}>
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.length === 0 && !isLoading && (
                        <div className="chat-empty-state">
                            <div className="empty-state-icon">🤖</div>
                            <h3 className="empty-state-title">Ready to Analyze!</h3>
                            <p className="empty-state-description">
                                Ask me anything about your data. I can help you find insights, create visualizations, and answer questions.
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message-bubble ${message.role}`}
                        >
                            <div className="message-header">
                                <div className={`message-avatar ${message.role}`}>
                                    {message.role === 'user' ? 'U' : '0'}
                                </div>
                                <span className="message-author">
                                    {message.role === 'user' ? 'You' : 'ZeroAnalyst'}
                                </span>
                                <span className="message-time">
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="message-content">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message-bubble assistant">
                            <div className="message-header">
                                <div className="message-avatar assistant">0</div>
                                <span className="message-author">ZeroAnalyst</span>
                            </div>
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            placeholder="Ask me anything about your data..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading || !sessionId}
                            rows={1}
                        />
                        <button
                            className="chat-send-button"
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading || !sessionId}
                        >
                            {isLoading ? '⏳' : '➤'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
