import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ChatWindow.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const REACTIONS    = ['👍', '❤️', '😄', '🔥', '🤔'];
const HINTS = [
  'What can you help me with?',
  'Tell me about yourself',
  'Give me an example',
  'What are your capabilities?',
];

const getReplyText = (data) => {
  const events = Array.isArray(data) ? data : [data];
  return events
    .flatMap(e => e?.content?.parts || [])
    .map(p => p?.text)
    .filter(Boolean)
    .join('\n')
    .trim();
};

function Message({ msg, agentAvatar, agentColor }) {
  const [reactions, setReactions] = useState({});
  const toggle = (emoji) => setReactions(r => ({ ...r, [emoji]: !r[emoji] }));
  const active = REACTIONS.filter(e => reactions[e]);

  return (
    <div className={`message ${msg.sender}`}>
      {msg.sender === 'agent' && (
        <div className="message-avatar" style={{ background: agentColor || '#059669' }}>
          {agentAvatar || '✦'}
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

          {active.length > 0 && (
            <div className="message-reactions">
              {active.map(e => (
                <button key={e} className="reaction-btn active" onClick={() => toggle(e)}>{e}</button>
              ))}
            </div>
          )}

          <div className="reaction-picker">
            {REACTIONS.map(e => (
              <button key={e} className="reaction-pick-btn" onClick={() => toggle(e)} title={e}>{e}</button>
            ))}
          </div>
        </div>
      </div>

      {msg.sender === 'user' && (
        <div className="message-avatar">👤</div>
      )}
    </div>
  );
}

function ChatWindow({ conversation, agent, onAddMessage }) {
  const [inputValue, setInputValue] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const endRef  = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [conversation.messages, scrollToBottom]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || !agent) return;

    const userMsg = { id: Date.now(), sender: 'user', content: trimmed, timestamp: new Date() };
    onAddMessage(userMsg);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      const appName   = agent.id || agent.name;
      const userId    = 'web-user';
      const sessionId = String(conversation.id);

      try {
        await axios.post(
          `${API_BASE_URL}/apps/${encodeURIComponent(appName)}/users/${encodeURIComponent(userId)}/sessions`,
          { sessionId }
        );
      } catch (e) {
        if (!String(e?.response?.data?.detail || '').includes('Session already exists')) throw e;
      }

      const res = await axios.post(`${API_BASE_URL}/run`, {
        appName, userId, sessionId,
        newMessage: { role: 'user', parts: [{ text: trimmed }] },
      });

      onAddMessage({
        id: Date.now() + 1,
        sender: 'agent',
        content: getReplyText(res.data) || 'No response from agent.',
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to send — is the ADK server running?');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(inputValue); };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-agent-avatar" style={{ background: agent?.color || '#059669' }}>
            {agent?.avatar || '✦'}
          </div>
          <div className="chat-header-info">
            <h2>{agent?.name || 'Agent'}</h2>
            <p className="agent-description">{agent?.description || 'ADK Agent'}</p>
          </div>
        </div>
        <div className="chat-header-right">
          <div className="online-chip">
            <span className="online-dot" /> Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-messages">
            <div className="empty-icon" style={{ background: agent?.color || '#059669' }}>
              {agent?.avatar || '✦'}
            </div>
            <p>Start chatting with <strong>{agent?.name}</strong></p>
            <div className="empty-hint">
              {HINTS.map(h => (
                <button key={h} className="hint-chip" onClick={() => sendMessage(h)} disabled={loading}>{h}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.map(msg => (
              <Message key={msg.id} msg={msg} agentAvatar={agent?.avatar} agentColor={agent?.color} />
            ))}

            {loading && (
              <div className="typing-indicator">
                <div className="message-avatar" style={{ background: agent?.color || '#059669' }}>
                  {agent?.avatar || '✦'}
                </div>
                <div className="typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
                <span className="typing-label">{agent?.name} is thinking…</span>
              </div>
            )}

            <div ref={endRef} />
          </>
        )}
      </div>

      {error && (
        <div className="error-message">⚠ {error}</div>
      )}

      {/* Input */}
      <div className="input-area">
        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={`Message ${agent?.name || 'agent'}…`}
              disabled={loading}
              className="message-input"
              maxLength={2000}
            />
            {inputValue.length > 80 && (
              <span className="char-count">{inputValue.length}/2000</span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="send-button"
            title="Send (Enter)"
          >
            {loading ? '…' : '→'}
          </button>
        </form>
        <p className="input-hint">Enter to send · Hover a message to react</p>
      </div>
    </div>
  );
}

export default ChatWindow;