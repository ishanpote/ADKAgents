import React from 'react';
import './AgentSelector.css';

function AgentSelector({ agents, selectedAgent, onSelectAgent }) {
  return (
    <div className="agent-selector">
      <h3>Agents</h3>
      <div className="agents-list">
        {agents.map((agent) => (
          <button
            key={agent.id}
            className={`agent-item ${selectedAgent?.id === agent.id ? 'active' : ''}`}
            onClick={() => onSelectAgent(agent)}
            title={agent.description}
          >
            <span className="agent-name">{agent.name}</span>
            <span className="agent-indicator" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default AgentSelector;
