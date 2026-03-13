import React, { useState, useEffect } from 'react';
import './App.css';
import ChatWindow from './components/ChatWindow';
import AgentSelector from './components/AgentSelector';
import ConversationHistory from './components/ConversationHistory';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const AGENT_AVATARS = ['✦', '◈', '⬡', '◎', '⊕', '❋', '◐', '⬢'];
const AGENT_COLORS  = [
  '#059669','#0284c7','#7c3aed','#b45309',
  '#be185d','#0f766e','#4338ca','#c2410c',
];

function App() {
  const [agents,              setAgents]              = useState([]);
  const [selectedAgent,       setSelectedAgent]       = useState(null);
  const [conversations,       setConversations]       = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading,             setLoading]             = useState(true);
  const [error,               setError]               = useState(null);
  const [sidebarOpen,         setSidebarOpen]         = useState(true);

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      let parsed = [];
      try {
        const res = await axios.get(`${API_BASE_URL}/list-apps`);
        const names = Array.isArray(res.data) ? res.data : [];
        parsed = names.map((name, i) => ({
          id: name, name, description: 'ADK agent',
          avatar: AGENT_AVATARS[i % AGENT_AVATARS.length],
          color:  AGENT_COLORS[i  % AGENT_COLORS.length],
        }));
      } catch {
        const res = await axios.get(`${API_BASE_URL}/agents`);
        parsed = (res.data.agents || []).map((a, i) => ({
          ...a,
          avatar: AGENT_AVATARS[i % AGENT_AVATARS.length],
          color:  AGENT_COLORS[i  % AGENT_COLORS.length],
        }));
      }
      setAgents(parsed);
      if (parsed.length) setSelectedAgent(parsed[0]);
      setError(null);
    } catch {
      const fallback = [
        { id:'Agent1/basicagent',          name:'basicagent',      description:'Greeting agent'   },
        { id:'Agent2/assisstant_agent',     name:'assistant_agent', description:'Assistant agent'  },
        { id:'Structuredagent/email_agent', name:'email_agent',     description:'Email agent'      },
        { id:'Tool_agent/basic_agent',      name:'basic_agent',     description:'Tool agent'       },
      ].map((a, i) => ({
        ...a,
        avatar: AGENT_AVATARS[i % AGENT_AVATARS.length],
        color:  AGENT_COLORS[i  % AGENT_COLORS.length],
      }));
      setAgents(fallback);
      setSelectedAgent(fallback[0]);
      setError('Demo mode — connect the ADK server to go live.');
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
    const conv = {
      id: Date.now(),
      agent: selectedAgent?.name || 'Unknown',
      agentObj: selectedAgent,
      timestamp: new Date(),
      messages: [],
    };
    setCurrentConversation(conv);
    setConversations(prev => [conv, ...prev]);
  };

  const handleSelectConversation = (conv) => setCurrentConversation(conv);

  const handleAddMessage = (message) => {
    setCurrentConversation(prev => {
      if (!prev) return prev;
      const updated = { ...prev, messages: [...prev.messages, message] };
      setConversations(all => all.map(c => c.id === updated.id ? updated : c));
      return updated;
    });
  };

  const handleDeleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation?.id === id) setCurrentConversation(null);
  };

  const totalMessages = conversations.reduce((n, c) => n + c.messages.length, 0);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div className="header-logo">
            <div className="logo-mark">🤖</div>
            <h1>ADK Agent Chat</h1>
            <span className="header-tagline">Intelligent agents, simply</span>
          </div>
          <div className="header-status">
            {loading  && <span className="status loading">Connecting…</span>}
            {error    && <span className="status error" title={error}>⚠ Demo</span>}
            {selectedAgent && (
              <span className="agent-badge">
                <span className="badge-dot" />{selectedAgent.name}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="app-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
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
                <div className="stat-value" style={{ color: selectedAgent ? 'var(--emerald)' : 'var(--ink-3)' }}>
                  {selectedAgent ? 'Live' : 'Idle'}
                </div>
                <div className="stat-label">Status</div>
              </div>
            </div>

            <AgentSelector agents={agents} selectedAgent={selectedAgent} onSelectAgent={handleSelectAgent} />

            <div className="new-chat-btn-container">
              <button className="new-chat-btn" onClick={handleNewConversation} disabled={!selectedAgent}>
                <span className="btn-icon">+</span>
                <span className="btn-text">New Conversation</span>
              </button>
            </div>

            <ConversationHistory
              conversations={conversations}
              currentConversationId={currentConversation?.id}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
        </aside>

        {/* Main */}
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
                <span className="welcome-overline">ADK Platform</span>
                <h2>Your agents, <em>ready to work</em></h2>
                {selectedAgent ? (
                  <>
                    <p>Talking to <strong>{selectedAgent.name}</strong></p>
                    <p className="description">{selectedAgent.description}</p>
                    <button className="welcome-btn" onClick={handleNewConversation}>
                      Start a conversation →
                    </button>
                  </>
                ) : (
                  <>
                    <p>Pick an agent from the sidebar to begin.</p>
                    <div className="agent-list">
                      {agents.map(a => (
                        <div key={a.id} className="agent-card" onClick={() => handleSelectAgent(a)}>
                          <h3>{a.name}</h3>
                          <p>{a.description}</p>
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