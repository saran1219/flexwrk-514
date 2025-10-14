// src/components/EnhancedChatPanel.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import {
  searchUsers,
  getUserConnections,
  createOrGetChat,
  sendMessage,
  uploadMessageAttachment,
  subscribeToMessages,
  subscribeToUserChats,
  markMessagesAsRead,
  getOtherParticipant,
  formatFileSize,
  isFileTypeAllowed
} from '../utils/messagingApi.js';

// =============================================
// Icon Components
// =============================================

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="21 21l-4.35-4.35"></path>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
  </svg>
);

const AttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const OnlineIcon = () => (
  <div style={{
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    border: '2px solid #ffffff'
  }} />
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// =============================================
// Sub-components
// =============================================

const MessageAttachment = ({ attachment, isOwn }) => {
  const isImage = attachment.type?.startsWith('image/');
  
  return (
    <div style={{
      backgroundColor: isOwn ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
      padding: '0.75rem',
      borderRadius: '8px',
      marginTop: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      {isImage ? <ImageIcon /> : <FileIcon />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: '500',
          color: isOwn ? '#ffffff' : '#334155',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {attachment.name}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: isOwn ? 'rgba(255,255,255,0.8)' : '#64748b'
        }}>
          {formatFileSize(attachment.size)}
        </div>
      </div>
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '0.25rem',
          borderRadius: '4px',
          color: isOwn ? '#ffffff' : '#4f46e5',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <DownloadIcon />
      </a>
    </div>
  );
};

const FileUploadPreview = ({ files, onRemove }) => {
  if (!files || files.length === 0) return null;

  return (
    <div style={{
      padding: '0.75rem',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      {files.map((file, index) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#ffffff',
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          fontSize: '0.85rem'
        }}>
          {file.type.startsWith('image/') ? <ImageIcon /> : <FileIcon />}
          <span>{file.name}</span>
          <span style={{ color: '#64748b' }}>({formatFileSize(file.size)})</span>
          <button
            onClick={() => onRemove(index)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '0.125rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <XIcon />
          </button>
        </div>
      ))}
    </div>
  );
};

const UserSearchModal = ({ isOpen, onClose, onSelectUser, userType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSearchResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsers(searchTerm, userType, 15);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
      setIsSearching(false);
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, userType]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
            Start New Conversation
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <XIcon />
          </button>
        </div>
        
        <div style={{ padding: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${userType === 'freelancer' ? 'freelancers' : 'clients'}...`}
              style={{
                width: '100%',
                padding: '0.75rem 2.5rem 0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            <div style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280'
            }}>
              <SearchIcon />
            </div>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 1rem 1rem'
        }}>
          {isSearching && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              Searching...
            </div>
          )}

          {!isSearching && searchTerm.length >= 2 && searchResults.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              No users found
            </div>
          )}

          {searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <img
                src={user.photoUrl || 'https://via.placeholder.com/40'}
                alt={user.name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                  {user.name || user.email || 'Unknown User'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  {user.title || user.email || ''}
                </div>
                {user.skills && user.skills.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    {user.skills.slice(0, 3).join(', ')}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '0.75rem',
                textTransform: 'capitalize',
                backgroundColor: user.userType === 'freelancer' ? '#dbeafe' : '#fef3c7',
                color: user.userType === 'freelancer' ? '#1e40af' : '#92400e',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px'
              }}>
                {user.userType}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================
// Main Enhanced Chat Panel Component
// =============================================

export default function EnhancedChatPanel() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [chats, setChats] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [otherUserCache, setOtherUserCache] = useState({});

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Get user type
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserType(userDoc.data().userType);
          }
        } catch (error) {
          console.error('Failed to get user type:', error);
        }
      } else {
        setUser(null);
        setUserType(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user's chats
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserChats((userChats) => {
      setChats(userChats);
      if (!activeChatId && userChats.length > 0) {
        setActiveChatId(userChats[0].id);
      }
    });

    return () => unsubscribe();
  }, [user, activeChatId]);

  // Subscribe to user's connections
  useEffect(() => {
    if (!user) return;

    const unsubscribe = getUserConnections((userConnections) => {
      setConnections(userConnections);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to messages of active chat
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(activeChatId, (chatMessages) => {
      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [activeChatId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when chat becomes active
  useEffect(() => {
    if (activeChatId && user) {
      markMessagesAsRead(activeChatId);
    }
  }, [activeChatId, user]);

  // Cache other user information
  useEffect(() => {
    const loadOtherUserInfo = async () => {
      const cache = {};
      for (const chat of chats) {
        const otherUserId = getOtherParticipant(chat, user?.uid);
        if (otherUserId && !otherUserCache[otherUserId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            if (userDoc.exists()) {
              cache[otherUserId] = userDoc.data();
            }
          } catch (error) {
            console.error('Failed to load user info:', error);
          }
        }
      }
      if (Object.keys(cache).length > 0) {
        setOtherUserCache(prev => ({ ...prev, ...cache }));
      }
    };

    if (user && chats.length > 0) {
      loadOtherUserInfo();
    }
  }, [user, chats]);

  const activeChat = useMemo(() => {
    return chats.find(c => c.id === activeChatId) || null;
  }, [chats, activeChatId]);

  const otherUser = useMemo(() => {
    if (!activeChat || !user) return null;
    const otherUserId = getOtherParticipant(activeChat, user.uid);
    return otherUserCache[otherUserId] || { name: otherUserId };
  }, [activeChat, user, otherUserCache]);

  const handleStartChat = async (selectedUser) => {
    try {
      const chatId = await createOrGetChat(selectedUser.id);
      setActiveChatId(chatId);
      setIsSearchModalOpen(false);
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      if (!isFileTypeAllowed(file)) {
        alert(`File "${file.name}" is not allowed. Please upload images, documents, or archives under 10MB.`);
        return false;
      }
      return true;
    });

    setPendingFiles(prev => [...prev, ...validFiles]);
    event.target.value = ''; // Reset input
  };

  const removePendingFile = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!activeChatId || (!newMessage.trim() && pendingFiles.length === 0)) return;
    if (isSending) return;

    setIsSending(true);
    let attachments = [];

    try {
      // Upload files if any
      if (pendingFiles.length > 0) {
        setIsUploading(true);
        
        for (const file of pendingFiles) {
          try {
            const attachment = await uploadMessageAttachment(file, activeChatId);
            attachments.push(attachment);
          } catch (error) {
            console.error('Failed to upload file:', error);
            alert(`Failed to upload "${file.name}". Please try again.`);
          }
        }
        
        setIsUploading(false);
      }

      // Send message
      await sendMessage(activeChatId, newMessage, attachments);
      
      // Clear input and files
      setNewMessage('');
      setPendingFiles([]);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
    
    setIsSending(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    },
    
    sidebar: {
      width: '350px',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8fafc'
    },
    
    sidebarHeader: {
      padding: '1.25rem',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff'
    },
    
    headerTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#0f172a',
      margin: '0 0 0.5rem 0'
    },
    
    headerActions: {
      display: 'flex',
      gap: '0.5rem'
    },
    
    newChatBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.875rem',
      backgroundColor: '#4f46e5',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    
    connectionsSection: {
      padding: '1rem 1.25rem',
      borderBottom: '1px solid #e2e8f0'
    },
    
    sectionTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#6b7280',
      margin: '0 0 0.75rem 0',
      textTransform: 'uppercase',
      letterSpacing: '0.025em'
    },
    
    connectionsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    
    connectionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    
    chatsSection: {
      flex: 1,
      overflowY: 'auto'
    },
    
    chatItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1.25rem',
      cursor: 'pointer',
      backgroundColor: isActive ? '#ffffff' : 'transparent',
      borderLeft: isActive ? '4px solid #4f46e5' : '4px solid transparent',
      borderBottom: '1px solid #f1f5f9',
      transition: 'all 0.2s'
    }),
    
    avatarContainer: {
      position: 'relative'
    },
    
    avatar: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      objectFit: 'cover'
    },
    
    onlineIndicator: {
      position: 'absolute',
      bottom: '2px',
      right: '2px'
    },
    
    chatInfo: {
      flex: 1,
      minWidth: 0
    },
    
    chatName: {
      fontWeight: '600',
      fontSize: '0.95rem',
      color: '#0f172a',
      margin: '0 0 0.25rem 0'
    },
    
    lastMessage: {
      fontSize: '0.8rem',
      color: '#64748b',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    
    chatMeta: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.25rem'
    },
    
    chatMessageTime: {
      fontSize: '0.75rem',
      color: '#9ca3af'
    },
    
    // Main chat area
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    
    chatHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff'
    },
    
    chatHeaderTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#0f172a',
      margin: 0
    },
    
    chatHeaderSubtitle: {
      fontSize: '0.875rem',
      color: '#64748b'
    },
    
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      backgroundColor: '#fafafa'
    },
    
    messageBubble: (isOwn) => ({
      alignSelf: isOwn ? 'flex-end' : 'flex-start',
      maxWidth: '75%',
      backgroundColor: isOwn ? '#4f46e5' : '#ffffff',
      color: isOwn ? '#ffffff' : '#0f172a',
      padding: '0.875rem 1rem',
      borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      fontSize: '0.9rem',
      lineHeight: '1.4'
    }),
    
    messageTime: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      textAlign: 'center',
      margin: '0.5rem 0',
      padding: '0.25rem'
    },
    
    // Message input
    messageInput: {
      borderTop: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    },
    
    inputContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '0.75rem',
      padding: '1rem'
    },
    
    textareaContainer: {
      flex: 1,
      position: 'relative'
    },
    
    textarea: {
      width: '100%',
      minHeight: '40px',
      maxHeight: '120px',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '20px',
      resize: 'none',
      fontFamily: 'inherit',
      fontSize: '0.95rem',
      lineHeight: '1.4',
      boxSizing: 'border-box',
      outline: 'none'
    },
    
    attachButton: {
      padding: '0.625rem',
      backgroundColor: 'transparent',
      border: '1px solid #d1d5db',
      borderRadius: '50%',
      cursor: 'pointer',
      color: '#6b7280',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    sendButton: (disabled) => ({
      padding: '0.625rem',
      backgroundColor: disabled ? '#9ca3af' : '#4f46e5',
      color: '#ffffff',
      border: 'none',
      borderRadius: '50%',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    
    emptyState: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280',
      gap: '1rem'
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatChatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div>Please log in to access messaging</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.container}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Header */}
          <div style={styles.sidebarHeader}>
            <h3 style={styles.headerTitle}>Messages</h3>
            <div style={styles.headerActions}>
              <button
                style={styles.newChatBtn}
                onClick={() => setIsSearchModalOpen(true)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
              >
                <PlusIcon />
                New Chat
              </button>
            </div>
          </div>

          {/* Connected Users */}
          {connections.length > 0 && (
            <div style={styles.connectionsSection}>
              <h4 style={styles.sectionTitle}>Connected</h4>
              <div style={styles.connectionsList}>
                {connections.slice(0, 3).map((connection) => (
                  <div
                    key={connection.id}
                    style={styles.connectionItem}
                    onClick={async () => {
                      try {
                        const chatId = await createOrGetChat(connection.userId);
                        setActiveChatId(chatId);
                      } catch (error) {
                        console.error('Failed to start chat:', error);
                      }
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div style={styles.avatarContainer}>
                      <img
                        src={connection.photoUrl || 'https://via.placeholder.com/32'}
                        alt={connection.name}
                        style={{ ...styles.avatar, width: '32px', height: '32px' }}
                      />
                      <div style={styles.onlineIndicator}>
                        <OnlineIcon />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {connection.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {connection.userType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chats List */}
          <div style={styles.chatsSection}>
            {chats.map((chat) => {
              const otherUserId = getOtherParticipant(chat, user.uid);
              const otherUserInfo = otherUserCache[otherUserId] || { name: 'Loading...' };
              const isActive = chat.id === activeChatId;

              return (
                <div
                  key={chat.id}
                  style={styles.chatItem(isActive)}
                  onClick={() => setActiveChatId(chat.id)}
                  onMouseEnter={(e) => !isActive && (e.target.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => !isActive && (e.target.style.backgroundColor = 'transparent')}
                >
                  <div style={styles.avatarContainer}>
                    <img
                      src={otherUserInfo.photoUrl || 'https://via.placeholder.com/44'}
                      alt={otherUserInfo.name}
                      style={styles.avatar}
                    />
                  </div>
                  <div style={styles.chatInfo}>
                    <div style={styles.chatName}>
                      {otherUserInfo.name || otherUserId}
                    </div>
                    <div style={styles.lastMessage}>
                      {chat.lastMessage || 'Start the conversation...'}
                    </div>
                  </div>
                  <div style={styles.chatMeta}>
                    <div style={styles.chatMessageTime}>
                      {formatChatTime(chat.lastMessageAt)}
                    </div>
                  </div>
                </div>
              );
            })}

            {chats.length === 0 && (
              <div style={{
                padding: '2rem 1.25rem',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                No conversations yet. Start by searching for someone to message!
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={styles.chatArea}>
          {activeChatId && otherUser ? (
            <>
              {/* Chat Header */}
              <div style={styles.chatHeader}>
                <div style={styles.avatarContainer}>
                  <img
                    src={otherUser.photoUrl || 'https://via.placeholder.com/40'}
                    alt={otherUser.name}
                    style={{ ...styles.avatar, width: '40px', height: '40px' }}
                  />
                </div>
                <div>
                  <h3 style={styles.chatHeaderTitle}>
                    {otherUser.name || 'Unknown User'}
                  </h3>
                  <div style={styles.chatHeaderSubtitle}>
                    {otherUser.title || otherUser.userType || ''}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={styles.messagesContainer}>
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user.uid;
                  const showTime = index === 0 || 
                    (messages[index - 1] && 
                     Math.abs(
                       (message.createdAt?.toMillis?.() || 0) - 
                       (messages[index - 1].createdAt?.toMillis?.() || 0)
                     ) > 5 * 60 * 1000); // Show time if more than 5 minutes apart

                  return (
                    <React.Fragment key={message.id}>
                      {showTime && (
                        <div style={styles.messageTime}>
                          {formatMessageTime(message.createdAt)}
                        </div>
                      )}
                      <div style={styles.messageBubble(isOwn)}>
                        {message.text}
                        {message.attachments && message.attachments.map((attachment, idx) => (
                          <MessageAttachment
                            key={idx}
                            attachment={attachment}
                            isOwn={isOwn}
                          />
                        ))}
                      </div>
                    </React.Fragment>
                  );
                })}
                
                {messages.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    padding: '2rem'
                  }}>
                    Say hello to start the conversation! 👋
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* File Upload Preview */}
              <FileUploadPreview
                files={pendingFiles}
                onRemove={removePendingFile}
              />

              {/* Message Input */}
              <div style={styles.messageInput}>
                <div style={styles.inputContainer}>
                  <button
                    style={styles.attachButton}
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    <AttachIcon />
                  </button>
                  
                  <div style={styles.textareaContainer}>
                    <textarea
                      style={styles.textarea}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      disabled={isSending}
                    />
                  </div>
                  
                  <button
                    style={styles.sendButton(isSending || isUploading || (!newMessage.trim() && pendingFiles.length === 0))}
                    onClick={handleSendMessage}
                    disabled={isSending || isUploading || (!newMessage.trim() && pendingFiles.length === 0)}
                  >
                    <SendIcon />
                  </button>
                </div>
                
                {(isSending || isUploading) && (
                  <div style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    {isUploading ? 'Uploading files...' : 'Sending message...'}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                Select a conversation
              </div>
              <div>Choose a conversation from the sidebar or start a new one</div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z,.js,.html,.css,.json,.xml"
      />

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectUser={handleStartChat}
        userType={userType === 'client' ? 'freelancer' : 'client'}
      />
    </>
  );
}