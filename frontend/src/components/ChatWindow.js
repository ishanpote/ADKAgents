import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatWindow.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const getAgentReplyText = (data) => {
  // ADK may return a single event object or an array of events.
  const events = Array.isArray(data) ? data : [data];
  const texts = events
    .flatMap((event) => event?.content?.parts || [])
    .map((part) => part?.text)
    .filter(Boolean);
  return texts.join('\n').trim();
};

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
      const appName = agent.id || agent.name;
      const userId = 'web-user';
      const sessionId = String(conversation.id);

      // Ensure session exists for this conversation.
      try {
        await axios.post(
          `${API_BASE_URL}/apps/${encodeURIComponent(appName)}/users/${encodeURIComponent(userId)}/sessions`,
          { sessionId }
        );
      } catch (sessionErr) {
        const detail = sessionErr?.response?.data?.detail || '';
        if (!String(detail).includes('Session already exists')) {
          throw sessionErr;
        }
      }

      const response = await axios.post(`${API_BASE_URL}/run`, {
        appName,
        userId,
        sessionId,
        newMessage: {
          role: 'user',
          parts: [{ text: userMessage.content }]
        }
      });

      const replyText = getAgentReplyText(response.data) || 'No response from agent.';
      const agentMessage = {
        id: Date.now() + 1,
        sender: 'agent',
        content: replyText,
        timestamp: new Date()
      };
      onAddMessage(agentMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      const apiMessage = err?.response?.data?.detail;
      setError(apiMessage || 'Failed to send message');
    } finally {
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
