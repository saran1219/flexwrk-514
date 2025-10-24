// src/components/ConnectionMap.jsx

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { 
  getUserConnections, 
  getConnectionStatus, 
  getChatHistorySummary 
} from '../utils/messagingApi.js';

// Icon components
const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
  </svg>
);

const ProjectIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ConnectionItem = ({ connection, onStartChat, chatHistory }) => {
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    // Count shared projects
    const loadProjectCount = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Query projects where both users are involved
        const projectsQuery = query(
          collection(db, 'projects'),
          where('participants', 'array-contains', currentUser.uid)
        );

        const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
          const sharedProjects = snapshot.docs.filter(doc => {
            const data = doc.data();
            return data.participants?.includes(connection.userId) || 
                   data.freelancerId === connection.userId ||
                   data.clientId === connection.userId;
          });
          setProjectCount(sharedProjects.length);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Failed to load project count:', error);
      }
    };

    loadProjectCount();
  }, [connection.userId]);

  const formatLastActivity = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getConnectionTypeColor = (types) => {
    if (types?.includes('project')) return '#10B981';
    if (types?.includes('portfolio_inquiry')) return '#6366F1';
    return '#8B5CF6';
  };

  const getConnectionTypeBadge = (types) => {
    if (types?.includes('project')) return 'Project Partner';
    if (types?.includes('portfolio_inquiry')) return 'Portfolio Inquiry';
    return 'Connection';
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '2px solid #F1F5F9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      e.currentTarget.style.borderColor = '#6366F1';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.borderColor = '#F1F5F9';
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ position: 'relative' }}>
          <img
            src={connection.photoUrl || 'https://via.placeholder.com/60'}
            alt={connection.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #F0F9FF'
            }}
          />
          {/* Online indicator */}
          <div style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '16px',
            height: '16px',
            backgroundColor: '#10B981',
            borderRadius: '50%',
            border: '2px solid #FFFFFF'
          }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 0.25rem 0',
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#0F172A'
          }}>
            {connection.name || 'Unknown User'}
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.8rem',
              backgroundColor: getConnectionTypeColor(connection.connectionTypes),
              color: '#FFFFFF',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontWeight: '600'
            }}>
              {getConnectionTypeBadge(connection.connectionTypes)}
            </span>
            
            <span style={{
              fontSize: '0.8rem',
              color: '#64748B',
              textTransform: 'capitalize'
            }}>
              {connection.userType}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: '#F8FAFC',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '0.25rem',
            color: '#6366F1'
          }}>
            <MessageIcon />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A' }}>
            {chatHistory?.messageCount || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
            Messages
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '0.25rem',
            color: '#10B981'
          }}>
            <ProjectIcon />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0F172A' }}>
            {projectCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
            Projects
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '0.25rem',
            color: '#F59E0B'
          }}>
            <ClockIcon />
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0F172A' }}>
            {formatLastActivity(connection.lastInteraction)}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
            Last Active
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '0.75rem'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartChat(connection);
          }}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <MessageIcon />
          Message
        </button>
        
        <button
          style={{
            padding: '0.75rem',
            background: 'transparent',
            color: '#6366F1',
            border: '2px solid #6366F1',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F0F9FF';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <UserIcon />
        </button>
      </div>
    </div>
  );
};

export default function ConnectionMap({ onStartChat }) {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [chatHistories, setChatHistories] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setConnections([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = getUserConnections((userConnections) => {
      setConnections(userConnections);
      
      // Load chat histories for each connection
      const loadChatHistories = async () => {
        const histories = {};
        for (const connection of userConnections) {
          try {
            const history = await getChatHistorySummary(connection.userId);
            if (history) {
              histories[connection.userId] = history;
            }
          } catch (error) {
            console.error('Failed to load chat history:', error);
          }
        }
        setChatHistories(histories);
        setLoading(false);
      };

      loadChatHistories();
    });

    return unsubscribe;
  }, [user]);

  const filteredConnections = connections.filter(connection => {
    if (filterType === 'all') return true;
    if (filterType === 'projects') return connection.connectionTypes?.includes('project');
    if (filterType === 'messages') return chatHistories[connection.userId]?.messageCount > 0;
    return true;
  });

  const connectionTypeStats = {
    total: connections.length,
    projects: connections.filter(c => c.connectionTypes?.includes('project')).length,
    messages: Object.values(chatHistories).filter(h => h.messageCount > 0).length
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <div>Loading connections...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: '#0F172A',
          margin: '0 0 0.5rem 0'
        }}>
          Your Network
        </h2>
        <p style={{
          color: '#64748B',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Manage your professional connections and communication history
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {connectionTypeStats.total}
          </div>
          <div style={{ opacity: 0.9 }}>Total Connections</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #10B981, #059669)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {connectionTypeStats.projects}
          </div>
          <div style={{ opacity: 0.9 }}>Project Partners</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {connectionTypeStats.messages}
          </div>
          <div style={{ opacity: 0.9 }}>Active Chats</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem'
      }}>
        {[
          { key: 'all', label: 'All Connections', count: connectionTypeStats.total },
          { key: 'projects', label: 'Project Partners', count: connectionTypeStats.projects },
          { key: 'messages', label: 'Active Chats', count: connectionTypeStats.messages }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setFilterType(filter.key)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: filterType === filter.key ? '#6366F1' : '#FFFFFF',
              color: filterType === filter.key ? '#FFFFFF' : '#64748B',
              border: `2px solid ${filterType === filter.key ? '#6366F1' : '#E5E7EB'}`,
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (filterType !== filter.key) {
                e.target.style.backgroundColor = '#F9FAFB';
                e.target.style.borderColor = '#6366F1';
              }
            }}
            onMouseLeave={(e) => {
              if (filterType !== filter.key) {
                e.target.style.backgroundColor = '#FFFFFF';
                e.target.style.borderColor = '#E5E7EB';
              }
            }}
          >
            {filter.label}
            <span style={{
              backgroundColor: filterType === filter.key ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
              color: filterType === filter.key ? '#FFFFFF' : '#6B7280',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Connections Grid */}
      {filteredConnections.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
          <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>
            No connections found
          </h3>
          <p>
            {filterType === 'all' 
              ? 'Start messaging freelancers or clients to build your network!'
              : `No connections match the "${filterType}" filter.`
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredConnections.map((connection) => (
            <ConnectionItem
              key={connection.id}
              connection={connection}
              onStartChat={onStartChat}
              chatHistory={chatHistories[connection.userId]}
            />
          ))}
        </div>
      )}
    </div>
  );
}