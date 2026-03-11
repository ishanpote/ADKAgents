import React from 'react';
import './ConversationHistory.css';

function ConversationHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation
}) {
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPreview = (conversation) => {
    if (conversation.messages.length === 0) {
      return 'No messages';
    }
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '');
  };

  return (
    <div className="conversation-history">
      <h3>History</h3>
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <p className="no-conversations">No conversations yet</p>
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
                <div className="conversation-info">
                  <p className="conversation-agent">{conv.agent}</p>
                  <p className="conversation-preview">{getPreview(conv)}</p>
                </div>
                <span className="conversation-time">{formatDate(conv.timestamp)}</span>
              </button>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                title="Delete conversation"
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
