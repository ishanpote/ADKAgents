import React from 'react';
import './ConversationHistory.css';

function ConversationHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
}) {
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getPreview = (conversation) => {
    if (conversation.messages.length === 0) return 'No messages yet…';
    const last = conversation.messages[conversation.messages.length - 1];
    const prefix = last.sender === 'user' ? 'You: ' : '';
    const text = last.content.substring(0, 36) + (last.content.length > 36 ? '…' : '');
    return prefix + text;
  };

  return (
    <div className="conversation-history">
      <div className="conv-history-header">
        <h3>History</h3>
        {conversations.length > 0 && (
          <button
            className="conv-clear-btn"
            onClick={() => conversations.forEach((c) => onDeleteConversation(c.id))}
          >
            Clear all
          </button>
        )}
      </div>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <span className="no-conv-icon">💬</span>
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
            >
              <button
                className="conversation-button"
                onClick={() => onSelectConversation(conv)}
              >
                <div className="conv-top">
                  <span className="conversation-agent">{conv.agent}</span>
                  <span className="conversation-time">{formatDate(conv.timestamp)}</span>
                </div>
                <div className="conv-top">
                  <span className="conversation-preview">{getPreview(conv)}</span>
                  {conv.messages.length > 0 && (
                    <span className="conv-msg-count">{conv.messages.length}</span>
                  )}
                </div>
              </button>
              <button
                className="delete-btn"
                onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ConversationHistory;