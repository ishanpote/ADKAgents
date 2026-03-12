import React, { useState, useEffect } from 'react';
import './App.css';
import ChatWindow from './components/ChatWindow';
import AgentSelector from './components/AgentSelector';
import ConversationHistory from './components/ConversationHistory';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch available agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      // ADK api_server exposes /list-apps. Keep /agents fallback for compatibility.
      let parsedAgents = [];
      try {
        const response = await axios.get(`${API_BASE_URL}/list-apps`);
        const appNames = Array.isArray(response.data) ? response.data : [];
        parsedAgents = appNames.map((name) => ({
          id: name,
          name,
          description: 'ADK agent'
        }));
      } catch (_) {
        const response = await axios.get(`${API_BASE_URL}/agents`);
        parsedAgents = response.data.agents || [];
      }

      setAgents(parsedAgents);
      if (parsedAgents.length > 0) {
        setSelectedAgent(parsedAgents[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching agents:', err);
      // Fallback to hardcoded agents if API not available
      const fallbackAgents = [
        { id: 'Agent1/basicagent', name: 'basicagent', description: 'Greeting agent' },
        { id: 'Agent2/assisstant_agent', name: 'assisstant_agent', description: 'Assistant agent' },
        { id: 'Structuredagent/email_agent', name: 'email_agent', description: 'Email agent' },
        { id: 'Tool_agent/basic_agent', name: 'basic_agent', description: 'Tool agent' }
      ];
      setAgents(fallbackAgents);
      setSelectedAgent(fallbackAgents[0]);
      setError('Note: Using demo agents. Make sure ADK server is running.');
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
      timestamp: new Date(),
      messages: []
    };
    setCurrentConversation(newConv);
    setConversations([newConv, ...conversations]);
  };

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
  };

  const handleAddMessage = (message) => {
    if (currentConversation) {
      const updatedConv = {
        ...currentConversation,
        messages: [...currentConversation.messages, message]
      };
      setCurrentConversation(updatedConv);
      
      // Update in conversations list
      const updatedConversations = conversations.map(conv =>
        conv.id === updatedConv.id ? updatedConv : conv
      );
      setConversations(updatedConversations);
    }
  };

  const handleDeleteConversation = (conversationId) => {
    const filtered = conversations.filter(conv => conv.id !== conversationId);
    setConversations(filtered);
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>ADK Agent Chat</h1>
          <div className="header-status">
            {loading && <span className="status loading">Loading...</span>}
            {error && <span className="status error" title={error}>⚠️</span>}
            {selectedAgent && <span className="agent-badge">{selectedAgent.name}</span>}
          </div>
        </div>
      </header>

      <div className="app-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
            <AgentSelector
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={handleSelectAgent}
            />
            
            <div className="new-chat-btn-container">
              <button
                className="new-chat-btn"
                onClick={handleNewConversation}
                disabled={!selectedAgent}
              >
                + New Chat
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

        {/* Main Chat Area */}
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
                <h2>Welcome to ADK Agent Chat</h2>
                {selectedAgent ? (
                  <>
                    <p>You're chatting with <strong>{selectedAgent.name}</strong></p>
                    <p className="description">{selectedAgent.description}</p>
                    <button className="welcome-btn" onClick={handleNewConversation}>
                      Start a new conversation
                    </button>
                  </>
                ) : (
                  <>
                    <p>Select an agent from the sidebar to begin</p>
                    <div className="agent-list">
                      {agents.map(agent => (
                        <div key={agent.id} className="agent-card">
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
