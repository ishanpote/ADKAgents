import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ChatWindow.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const REACTIONS = ['👍', '❤️', '😂', '🔥', '🤔'];

const HINT_PROMPTS = [
  'What can you help me with?',
  'Tell me about yourself',
  'Show me an example',
  'What are your capabilities?',
];

const getAgentReplyText = (data) => {
  const events = Array.isArray(data) ? data : [data];
  const texts = events
    .flatMap((event) => event?.content?.parts || [])
    .map((part) => part?.text)
    .filter(Boolean);
  return texts.join('\n').trim();
};

function Message({ msg, agentAvatar, agentColor }) {
  const [reactions, setReactions] = useState({});

  const toggleReaction = (emoji) => {
    setReactions((prev) => ({ ...prev, [emoji]: !prev[emoji] }));
  };

  const activeReactions = REACTIONS.filter((e) => reactions[e]);

  return (
    <div className={`message ${msg.sender}`}>
      {msg.sender === 'agent' && (
        <div
          className="message-avatar"
          style={{ background: agentColor || 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}
        >
          {agentAvatar || '🤖'}
        </div>
      )}

      <div className="message-bubble-wrap">
        <div className="message-content">
          <p className="message-text">{msg.content}</p>
        </div>

        <div className="message-footer">
          <span className="message-time">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {/* Active reactions */}
          {activeReactions.length > 0 && (
            <div className="message-reactions">
              {activeReactions.map((e) => (
                <button key={e} className="reaction-btn active" onClick={() => toggleReaction(e)}>
                  {e}
                </button>
              ))}
            </div>
          )}

          {/* Reaction picker (shown on hover via CSS) */}
          <div className="reaction-picker">
            {REACTIONS.map((e) => (
              <button key={e} className="reaction-pick-btn" onClick={() => toggleReaction(e)} title={e}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {msg.sender === 'user' && (
        <div
          className="message-avatar"
          style={{ background: 'linear-gradient(135deg,#1e293b,#334155)' }}
        >
          👤
        </div>
      )}
    </div>
  );
}

function ChatWindow({ conversation, agent, onAddMessage }) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [conversation.messages, scrollToBottom]);

  const sendMessage = async (text) => {
    if (!text.trim() || !agent) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date(),
    };

    onAddMessage(userMessage);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      const appName = agent.id || agent.name;
      const userId = 'web-user';
      const sessionId = String(conversation.id);

      try {
        await axios.post(
          `${API_BASE_URL}/apps/${encodeURIComponent(appName)}/users/${encodeURIComponent(userId)}/sessions`,
          { sessionId }
        );
      } catch (sessionErr) {
        const detail = sessionErr?.response?.data?.detail || '';
        if (!String(detail).includes('Session already exists')) throw sessionErr;
      }

      const response = await axios.post(`${API_BASE_URL}/run`, {
        appName,
        userId,
        sessionId,
        newMessage: { role: 'user', parts: [{ text }] },
      });

      const replyText = getAgentReplyText(response.data) || 'No response from agent.';
      const agentMessage = {
        id: Date.now() + 1,
        sender: 'agent',
        content: replyText,
        timestamp: new Date(),
      };
      onAddMessage(agentMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err?.response?.data?.detail || 'Failed to send message. Is the ADK server running?');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="chat-window">
      {/* ── Header ── */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div
            className="chat-agent-avatar"
            style={{ background: agent?.color || 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}
          >
            {agent?.avatar || '🤖'}
          </div>
          <div className="chat-header-info">
            <h2>{agent?.name || 'Agent'}</h2>
            <p className="agent-description">{agent?.description || 'ADK Agent'}</p>
          </div>
        </div>
        <div className="chat-header-right">
          <div className="online-chip">
            <span className="online-dot" />
            Online
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="messages-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-messages">
            <div className="empty-icon">{agent?.avatar || '💬'}</div>
            <p>Start a conversation with <strong>{agent?.name}</strong></p>
            <div className="empty-hint">
              {HINT_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="hint-chip"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.map((msg) => (
              <Message
                key={msg.id}
                msg={msg}
                agentAvatar={agent?.avatar}
                agentColor={agent?.color}
              />
            ))}

            {loading && (
              <div className="typing-indicator">
                <div
                  className="message-avatar"
                  style={{ background: agent?.color || 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}
                >
                  {agent?.avatar || '🤖'}
                </div>
                <div className="typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
                <span className="typing-label">{agent?.name} is thinking…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* ── Input ── */}
      <div className="input-area">
        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Message ${agent?.name || 'agent'}…`}
              disabled={loading}
              className="message-input"
              maxLength={2000}
            />
            {inputValue.length > 100 && (
              <span className="char-count">{inputValue.length}/2000</span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="send-button"
            title="Send message"
          >
            {loading ? '⏳' : '➤'}
          </button>
        </form>
        <p className="input-hint">Press Enter to send · Hover messages to react</p>
      </div>
    </div>
  );
}

export default ChatWindow;