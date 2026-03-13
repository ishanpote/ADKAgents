import React, { useState, useEffect } from 'react';
import './App.css';
import ChatWindow from './components/ChatWindow';
import AgentSelector from './components/AgentSelector';
import ConversationHistory from './components/ConversationHistory';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Emoji avatars for agents
const AGENT_AVATARS = ['🤖', '🧠', '⚡', '🔮', '🛸', '💎', '🌊', '🔥'];
const AGENT_COLORS = [
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #34d399, #3b82f6)',
  'linear-gradient(135deg, #f97316, #f59e0b)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
];

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      let parsedAgents = [];
      try {
        const response = await axios.get(`${API_BASE_URL}/list-apps`);
        const appNames = Array.isArray(response.data) ? response.data : [];
        parsedAgents = appNames.map((name, i) => ({
          id: name,
          name,
          description: 'ADK agent',
          avatar: AGENT_AVATARS[i % AGENT_AVATARS.length],
          color: AGENT_COLORS[i % AGENT_COLORS.length],
        }));
      } catch (_) {
        const response = await axios.get(`${API_BASE_URL}/agents`);
        const raw = response.data.agents || [];
        parsedAgents = raw.map((a, i) => ({
          ...a,
          avatar: AGENT_AVATARS[i % AGENT_AVATARS.length],
          color: AGENT_COLORS[i % AGENT_COLORS.length],
        }));
      }
      setAgents(parsedAgents);
      if (parsedAgents.length > 0) setSelectedAgent(parsedAgents[0]);
      setError(null);
    } catch (err) {
      const fallback = [
        { id: 'Agent1/basicagent', name: 'basicagent', description: 'Greeting agent' },
        { id: 'Agent2/assisstant_agent', name: 'assisstant_agent', description: 'Assistant agent' },
        { id: 'Structuredagent/email_agent', name: 'email_agent', description: 'Email agent' },
        { id: 'Tool_agent/basic_agent', name: 'basic_agent', description: 'Tool agent' },
      ].map((a, i) => ({
        ...a,
        avatar: AGENT_AVATARS[i % AGENT_AVATARS.length],
        color: AGENT_COLORS[i % AGENT_COLORS.length],
      }));
      setAgents(fallback);
      setSelectedAgent(fallback[0]);
      setError('Demo mode — start ADK server to connect.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setCurrentConversation(null);
    setConversations([]);
  };

  const handleNewConversation = () => {
    const newConv = {
      id: Date.now(),
      agent: selectedAgent?.name || 'Unknown',
      agentObj: selectedAgent,
      timestamp: new Date(),
      messages: [],
    };
    setCurrentConversation(newConv);
    setConversations((prev) => [newConv, ...prev]);
  };

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
  };

  const handleAddMessage = (message) => {
    setCurrentConversation((prevCurrent) => {
      if (!prevCurrent) return prevCurrent;
      const updatedConv = { ...prevCurrent, messages: [...prevCurrent.messages, message] };
      setConversations((prev) =>
        prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
      );
      return updatedConv;
    });
  };

  const handleDeleteConversation = (conversationId) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (currentConversation?.id === conversationId) setCurrentConversation(null);
  };

  // Stats
  const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);

  return (
    <div className="app">
      <div className="app-bg-grid" />

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-content">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="header-logo">
            <div className="logo-mark">🤖</div>
            <h1>ADK Agent Chat</h1>
            <span className="header-pill">LIVE</span>
          </div>
          <div className="header-status">
            {loading && <span className="status loading">Connecting…</span>}
            {error   && <span className="status error" title={error}>⚠️</span>}
            {selectedAgent && (
              <span className="agent-badge">
                <span className="badge-dot" />
                {selectedAgent.name}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="app-container">
        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">

            {/* Stats */}
            <div className="sidebar-stats">
              <div className="stat-card">
                <div className="stat-value">{agents.length}</div>
                <div className="stat-label">Agents</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{conversations.length}</div>
                <div className="stat-label">Chats</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalMessages}</div>
                <div className="stat-label">Messages</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{selectedAgent ? '●' : '○'}</div>
                <div className="stat-label">Status</div>
              </div>
            </div>

            {/* Agent Selector */}
            <AgentSelector
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={handleSelectAgent}
            />

            {/* New Chat */}
            <div className="new-chat-btn-container">
              <button className="new-chat-btn" onClick={handleNewConversation} disabled={!selectedAgent}>
                <span className="btn-icon">✦</span>
                <span className="btn-text">New Conversation</span>
              </button>
            </div>

            {/* History */}
            <ConversationHistory
              conversations={conversations}
              currentConversationId={currentConversation?.id}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-content">
          {currentConversation ? (
            <ChatWindow
              conversation={currentConversation}
              agent={selectedAgent}
              onAddMessage={handleAddMessage}
            />
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">🤖</div>
                <h2>ADK Agent Platform</h2>
                {selectedAgent ? (
                  <>
                    <p>Connected to <strong>{selectedAgent.name}</strong></p>
                    <p className="description">{selectedAgent.description}</p>
                    <button className="welcome-btn" onClick={handleNewConversation}>
                      Start Conversation →
                    </button>
                  </>
                ) : (
                  <>
                    <p>Select an agent from the sidebar to get started</p>
                    <div className="agent-list">
                      {agents.map((agent) => (
                        <div key={agent.id} className="agent-card" onClick={() => handleSelectAgent(agent)}>
                          <h3>{agent.name}</h3>
                          <p>{agent.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;