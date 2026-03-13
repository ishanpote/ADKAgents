import React from 'react';
import './AgentSelector.css';

function AgentSelector({ agents, selectedAgent, onSelectAgent }) {
  return (
    <div className="agent-selector">
      <div className="agent-selector-header">
        <h3>Agents</h3>
        <span className="agent-count">{agents.length}</span>
      </div>
      <div className="agents-list">
        {agents.map((agent, i) => (
          <button
            key={agent.id}
            className={`agent-item ${selectedAgent?.id === agent.id ? 'active' : ''}`}
            onClick={() => onSelectAgent(agent)}
            title={agent.description}
          >
            <div
              className="agent-avatar"
              style={{ background: agent.color || 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {agent.avatar || '🤖'}
            </div>
            <div className="agent-info">
              <span className="agent-name">{agent.name}</span>
              <span className="agent-desc">{agent.description || 'ADK agent'}</span>
            </div>
            <span className="agent-status" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default AgentSelector;