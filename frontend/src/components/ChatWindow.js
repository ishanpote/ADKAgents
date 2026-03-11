import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatWindow.css';

const API_BASE_URL = 'http://localhost:8000';

function ChatWindow({ conversation, agent, onAddMessage }) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !agent) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    onAddMessage(userMessage);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      // Simulate agent response for now
      // In production, you'd call the actual ADK API
      setTimeout(() => {
        const agentMessage = {
          id: Date.now() + 1,
          sender: 'agent',
          content: `Message received by ${agent.name}. This is a demo response.`,
          timestamp: new Date()
        };
        onAddMessage(agentMessage);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{agent?.name || 'Agent'}</h2>
        <p className="agent-description">{agent?.description || ''}</p>
      </div>

      <div className="messages-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-messages">
            <p>Start a conversation with {agent?.name}</p>
          </div>
        ) : (
          <>
            {conversation.messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <p className="message-text">{msg.content}</p>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message agent">
                <div className="message-content">
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="message-input"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="send-button"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
