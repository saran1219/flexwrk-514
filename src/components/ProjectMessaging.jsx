// src/components/ProjectMessaging.jsx

import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { 
  createOrGetChat, 
  sendMessage, 
  subscribeToMessages, 
  markMessagesAsRead,
  uploadMessageAttachment,
  formatFileSize,
  isFileTypeAllowed
} from '../utils/messagingApi.js';

// Icon Components
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
  </svg>
);

const AttachIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
);

const ProjectMessageBubble = ({ message, isOwn, senderInfo }) => {
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: isOwn ? 'row-reverse' : 'row',
      gap: '0.75rem',
      marginBottom: '1rem',
      alignItems: 'flex-start'
    }}>
      {/* Avatar */}
      <img
        src={senderInfo?.photoUrl || 'https://via.placeholder.com/32'}
        alt={senderInfo?.name || 'User'}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
      
      {/* Message content */}
      <div style={{
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start'
      }}>
        {/* Sender name and time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.25rem',
          fontSize: '0.75rem',
          color: '#6b7280'
        }}>
          {!isOwn && <span style={{ fontWeight: '600' }}>{senderInfo?.name || 'Unknown'}</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ClockIcon />
            {formatMessageTime(message.createdAt)}
          </div>
        </div>
        
        {/* Message bubble */}
        <div style={{
          backgroundColor: isOwn ? '#6366F1' : '#ffffff',
          color: isOwn ? '#ffffff' : '#0f172a',
          padding: '0.75rem 1rem',
          borderRadius: isOwn ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
          border: isOwn ? 'none' : '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontSize: '0.9rem',
          lineHeight: '1.4'
        }}>
          {message.text}
          
          {/* Attachments */}
          {message.attachments && message.attachments.map((attachment, idx) => (
            <div key={idx} style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: isOwn ? 'rgba(255,255,255,0.1)' : '#f8fafc',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: '1rem' }}>📎</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {attachment.name}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  {formatFileSize(attachment.size)}
                </div>
              </div>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: isOwn ? '#ffffff' : '#6366F1',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectMessagingPanel = ({ project, isCollapsed = false, onToggle }) => {
  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [participantInfo, setParticipantInfo] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  // Initialize chat for project participants
  useEffect(() => {
    const initializeProjectChat = async () => {
      if (!user || !project) return;

      try {
        let otherUserId;
        
        // Determine the other participant
        if (project.clientId && project.clientId !== user.uid) {
          otherUserId = project.clientId;
        } else if (project.freelancerId && project.freelancerId !== user.uid) {
          otherUserId = project.freelancerId;
        } else if (project.participants) {
          otherUserId = project.participants.find(p => p !== user.uid);
        }

        if (otherUserId) {
          const projectChatId = await createOrGetChat(otherUserId, 'project');
          setChatId(projectChatId);

          // Load participant info
          const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', otherUserId)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            setParticipantInfo(prev => ({
              ...prev,
              [otherUserId]: userData
            }));
          }
        }
      } catch (error) {
        console.error('Failed to initialize project chat:', error);
      }
    };

    initializeProjectChat();
  }, [user, project]);

  // Subscribe to messages
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeToMessages(chatId, (chatMessages) => {
      setMessages(chatMessages);
      
      // Count unread messages
      const unreadMessages = chatMessages.filter(msg => 
        msg.senderId !== user?.uid && 
        (!msg.readBy || !msg.readBy[user?.uid])
      );
      setUnreadCount(unreadMessages.length);

      // Mark messages as read when panel is open
      if (!isCollapsed && user) {
        markMessagesAsRead(chatId);
        setUnreadCount(0);
      }
    });

    return unsubscribe;
  }, [chatId, user, isCollapsed]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isCollapsed]);

  const handleSendMessage = async () => {
    if (!chatId || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(chatId, newMessage.trim());
      setNewMessage('');
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

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (!isFileTypeAllowed(file)) {
        alert(`File "${file.name}" is not allowed.`);
        continue;
      }

      try {
        setIsSending(true);
        const attachment = await uploadMessageAttachment(file, chatId);
        await sendMessage(chatId, `📎 ${file.name}`, [attachment]);
      } catch (error) {
        console.error('Failed to upload file:', error);
        alert(`Failed to upload "${file.name}".`);
      }
    }
    
    setIsSending(false);
    event.target.value = '';
  };

  if (isCollapsed) {
    return (
      <div
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#6366F1',
          color: '#ffffff',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
        }}
      >
        <div style={{ position: 'relative' }}>
          <MessageIcon />
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '0.7rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '500px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000,
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#6366F1',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
            Project Chat
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
            {project?.title || 'Project Discussion'}
          </p>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: '#f8fafc'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            padding: '2rem 0',
            fontSize: '0.9rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            <p>Start discussing this project!</p>
          </div>
        ) : (
          messages.map((message) => {
            const senderInfo = participantInfo[message.senderId] || {};
            return (
              <ProjectMessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.uid}
                senderInfo={senderInfo}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-end'
      }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '0.625rem',
            backgroundColor: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
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
        
        <div style={{ flex: 1 }}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            style={{
              width: '100%',
              minHeight: '40px',
              maxHeight: '80px',
              padding: '0.625rem 0.875rem',
              border: '1px solid #d1d5db',
              borderRadius: '20px',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>
        
        <button
          onClick={handleSendMessage}
          disabled={isSending || !newMessage.trim()}
          style={{
            padding: '0.625rem',
            backgroundColor: isSending || !newMessage.trim() ? '#9ca3af' : '#6366F1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            cursor: isSending || !newMessage.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
        >
          <SendIcon />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
      />
    </div>
  );
};

export default ProjectMessagingPanel;