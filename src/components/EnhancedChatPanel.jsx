// src/components/EnhancedChatPanel.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  isFileTypeAllowed,
  getConnectionStatus,
  getChatHistorySummary,
  getUnreadMessageCount,
  subscribeToUserPresence,
  startChatFromPortfolio,
  deleteMessage
} from '../utils/messagingApi.js';

// =============================================
// Utility Functions
// =============================================

const getDefaultAvatar = (name = 'User') => {
  const cleanName = name.trim() || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&size=200&background=3B82F6&color=fff&bold=true`;
};

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

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const ForwardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 17 20 12 15 7"></polyline>
    <path d="M4 18v-2a4 4 0 0 1 4-4h12"></path>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const UnsendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="8 12 12 12 12 8"></polyline>
  </svg>
);

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, title, message, type = 'alert', onConfirm, confirmLabel }) => {
  if (!isOpen) return null;

  const palette = {
    info: '#3b82f6',
    confirm: '#ef4444',
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#ef4444'
  };
  const color = palette[type] || '#334155';
  const computedConfirmLabel = confirmLabel || (/delete|unsend/i.test(title || '') ? 'Delete' : 'Confirm');

  const modalContent = (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: '#fff', padding: '1.25rem 1.5rem', borderRadius: 10,
        width: '100%', maxWidth: 420, boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
      }}>
        {title && (
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: 600, color: '#0f172a' }}>{title}</h3>
        )}
        {message && (
          <p style={{ margin: 0, marginBottom: 16, fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{message}</p>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 12px', fontSize: 14, borderRadius: 6, background: '#f1f5f9',
            border: '1px solid #e2e8f0', color: '#0f172a', cursor: 'pointer'
          }}>Cancel</button>
          {type === 'confirm' ? (
            <button onClick={() => { onConfirm?.(); onClose(); }} style={{
              padding: '8px 12px', fontSize: 14, borderRadius: 6, border: '1px solid transparent',
              background: color, color: '#fff', cursor: 'pointer'
            }}>{computedConfirmLabel}</button>
          ) : (
            <button onClick={onClose} style={{
              padding: '8px 12px', fontSize: 14, borderRadius: 6, border: '1px solid transparent',
              background: color, color: '#fff', cursor: 'pointer'
            }}>OK</button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const MessageContextMenu = ({ messageId, chatId, messageText, isOwn, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  
  const showModal = (type, title, message, onConfirm = null) => {
    setModalState({ isOpen: true, type, title, message, onConfirm });
  };
  
  const closeModal = () => {
    setModalState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    showModal('success', 'Copied!', 'Message copied to clipboard successfully! ✨');
    onClose();
  };
  
  const handleUnsend = async (e) => {
    try {
      e?.preventDefault?.();
      e?.stopPropagation?.();
    } catch {}
    showModal(
      'confirm',
      'Unsend Message?',
      'This action cannot be undone. The message will be permanently deleted.',
      async () => {
        setIsDeleting(true);
        try {
          await deleteMessage(chatId, messageId);
          onClose();
        } catch (error) {
          console.error('Failed to delete message:', error);
          showModal('error', 'Oops!', `Failed to unsend message: ${error.message}`);
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };
  
  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1f2937',
    transition: 'background-color 0.15s',
    borderRadius: '6px'
  };
  
  return (
    <>
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
      />
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: isOwn ? '0' : 'auto',
          left: isOwn ? 'auto' : '0',
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 1000,
          minWidth: '180px',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease'
        }}
      >
      <button
        onClick={handleCopy}
        style={{
          ...menuItemStyle,
          color: '#ffffff',
          borderBottom: isOwn ? '1px solid rgba(255,255,255,0.1)' : 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <CopyIcon />
        Copy
      </button>
      
      {isOwn && (
        <button
          onClick={(e) => handleUnsend(e)}
          disabled={isDeleting}
          style={{
            ...menuItemStyle,
            color: '#ef4444'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <UnsendIcon />
          {isDeleting ? 'Unsending...' : 'Unsend'}
        </button>
      )}
      </div>
    </>
  );
};

const MessageDeleteButton = ({ messageId, chatId, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  
  const showModal = (type, title, message, onConfirm = null) => {
    setModalState({ isOpen: true, type, title, message, onConfirm });
  };
  
  const closeModal = () => {
    setModalState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  };
  
  const handleDelete = async () => {
    showModal(
      'confirm',
      'Delete Message?',
      'This action cannot be undone. The message will be permanently deleted.',
      async () => {
        setIsDeleting(true);
        try {
          await deleteMessage(chatId, messageId);
          if (onDelete) onDelete();
          showModal('success', 'Deleted!', 'Message has been successfully deleted.');
        } catch (error) {
          console.error('Failed to delete message:', error);
          showModal('error', 'Oops!', `Failed to delete message: ${error.message}`);
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };
  
  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete message"
      style={{
        background: 'rgba(239, 68, 68, 0.9)',
        border: 'none',
        borderRadius: '4px',
        padding: '6px 8px',
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.75rem',
        fontWeight: '500',
        opacity: isDeleting ? 0.6 : 1,
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => !isDeleting && (e.target.style.background = 'rgba(220, 38, 38, 1)')}
      onMouseLeave={(e) => !isDeleting && (e.target.style.background = 'rgba(239, 68, 68, 0.9)')}
    >
      <TrashIcon />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
};

const TypingIndicator = ({ userName }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.875rem 1rem',
      maxWidth: '75%',
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 16px 4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      fontSize: '0.875rem',
      color: '#6b7280'
    }}>
      <div style={{
        display: 'flex',
        gap: '0.25rem'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#9ca3af',
              animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite both`
            }}
          />
        ))}
      </div>
      <span>{userName || 'Someone'} is typing...</span>
    </div>
  );
};

const MessageStatusIcon = ({ status }) => {
  switch (status) {
    case 'sending':
      return (
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#9ca3af'
        }} />
      );
    case 'sent':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      );
    case 'delivered':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
          <polyline points="16 10 9 17 4 12" strokeDasharray="2,2"></polyline>
        </svg>
      );
    case 'read':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
          <polyline points="16 10 9 17 4 12"></polyline>
        </svg>
      );
    default:
      return null;
  }
};

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

const FileUploadPreview = ({ files, onRemove, uploadProgress = {} }) => {
  if (!files || files.length === 0) return null;

  return (
    <div style={{
      padding: '0.75rem',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div style={{
        fontSize: '0.8rem',
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: '0.25rem'
      }}>
        {files.length} file{files.length === 1 ? '' : 's'} ready to send
      </div>
      
      {files.map((file, index) => {
        const progress = uploadProgress[index] || 0;
        const isImage = file.type.startsWith('image/');
        const isUploading = progress > 0 && progress < 100;
        
        return (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: '#ffffff',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* File icon/preview */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              backgroundColor: isImage ? '#f0f9ff' : '#f3f4f6',
              color: isImage ? '#0369a1' : '#6b7280'
            }}>
              {isImage ? <ImageIcon /> : <FileIcon />}
            </div>
            
            {/* File info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: '500',
                color: '#374151',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {file.name}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.25rem'
              }}>
                {formatFileSize(file.size)}
                {isUploading && ` • ${progress}% uploaded`}
              </div>
              
              {/* Progress bar */}
              {isUploading && (
                <div style={{
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '1px',
                  marginTop: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    borderRadius: '1px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              )}
            </div>
            
            {/* Remove button */}
            {!isUploading && (
              <button
                onClick={() => onRemove(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <XIcon />
              </button>
            )}
          </div>
        );
      })}
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
      zIndex: 3000
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
              placeholder={`Search ${userType ? (userType === 'freelancer' ? 'freelancers' : 'clients') : 'users'}...`}
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
          {!isSearching && searchTerm.length < 2 && (
            <div style={{ textAlign: 'center', padding: '1rem 2rem', color: '#6b7280' }}>
              Type at least 2 characters to search users
            </div>
          )}

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
                src={user.photoUrl || getDefaultAvatar(user.name)}
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
                  {user.email || 'Freelancer'}
                </div>
                {user.skills && user.skills.length > 0 && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#4f46e5', 
                    marginTop: '0.25rem',
                    fontWeight: '500'
                  }}>
                    Skills: {user.skills.slice(0, 3).join(', ')}{user.skills.length > 3 ? '...' : ''}
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

export default function EnhancedChatPanel({ initialChatId = null, onChatChange = null }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [chats, setChats] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activeChatId, setActiveChatId] = useState(initialChatId);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [otherUserCache, setOtherUserCache] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [presenceStatus, setPresenceStatus] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [contextMenuMessageId, setContextMenuMessageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalModal, setGlobalModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const showGlobalModal = (type, title, message, onConfirm = null) => {
    setGlobalModal({ isOpen: true, type, title, message, onConfirm });
  };
  
  const closeGlobalModal = () => {
    setGlobalModal({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  };

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

  // Handle initialChatId prop changes
  useEffect(() => {
    if (initialChatId && initialChatId !== activeChatId) {
      setActiveChatId(initialChatId);
    }
  }, [initialChatId]);

  // Subscribe to user's chats
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserChats((userChats) => {
      setChats(userChats);
      if (!activeChatId && userChats.length > 0) {
        setActiveChatId(userChats[0].id);
        if (onChatChange) onChatChange(userChats[0].id);
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

  // Mark messages as read when chat becomes active and when new messages arrive
  useEffect(() => {
    if (activeChatId && user) {
      markMessagesAsRead(activeChatId);
    }
  }, [activeChatId, user, messages]); // Added messages dependency for real-time read receipts

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

  // Load connection status and unread counts
  useEffect(() => {
    const loadEnhancedChatData = async () => {
      if (!user || chats.length === 0) return;
      
      const connectionStatusData = {};
      const unreadCountsData = {};
      
      for (const chat of chats) {
        const otherUserId = getOtherParticipant(chat, user.uid);
        if (otherUserId) {
          try {
            // Load connection status
            const status = await getConnectionStatus(otherUserId);
            if (status) {
              connectionStatusData[otherUserId] = status;
            }
            
            // Load unread count
            const unreadCount = await getUnreadMessageCount(chat.id);
            if (unreadCount > 0) {
              unreadCountsData[chat.id] = unreadCount;
            }
          } catch (error) {
            console.error('Failed to load enhanced chat data:', error);
          }
        }
      }
      
      setConnectionStatus(connectionStatusData);
      setUnreadCounts(unreadCountsData);
    };
    
    loadEnhancedChatData();
  }, [user, chats]);
  
  // Subscribe to presence status of chat participants and connections
  useEffect(() => {
    if (!user) return;
    
    // Get user IDs from both chats and connections
    const chatUserIds = chats.map(chat => getOtherParticipant(chat, user.uid)).filter(Boolean);
    const connectionUserIds = connections.map(conn => conn.userId).filter(Boolean);
    const allUserIds = [...new Set([...chatUserIds, ...connectionUserIds])];
    
    if (allUserIds.length === 0) return;
    
    const unsubscribe = subscribeToUserPresence(allUserIds, (presenceData) => {
      setPresenceStatus(prev => ({
        ...prev,
        [presenceData.userId]: presenceData
      }));
    });
    
    return unsubscribe;
  }, [user, chats, connections]);

  const activeChat = useMemo(() => {
    return chats.find(c => c.id === activeChatId) || null;
  }, [chats, activeChatId]);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => {
      const otherUserId = getOtherParticipant(chat, user?.uid);
      const otherUserInfo = otherUserCache[otherUserId];
      const name = otherUserInfo?.name || '';
      const email = otherUserInfo?.email || '';
      const lastMessage = chat.lastMessage || '';
      
      return name.toLowerCase().includes(query) || 
             email.toLowerCase().includes(query) ||
             lastMessage.toLowerCase().includes(query);
    });
  }, [chats, searchQuery, user, otherUserCache]);

  const otherUser = useMemo(() => {
    if (!activeChat || !user) return null;
    const otherUserId = getOtherParticipant(activeChat, user.uid);
    return otherUserCache[otherUserId] || { name: otherUserId };
  }, [activeChat, user, otherUserCache]);

  const handleStartChat = async (selectedUser) => {
    try {
      const chatId = await createOrGetChat(selectedUser.id);
      setActiveChatId(chatId);
      if (onChatChange) onChatChange(chatId);
      setIsSearchModalOpen(false);
    } catch (error) {
      console.error('Failed to start chat:', error);
      showGlobalModal('error', 'Connection Error', 'Failed to start chat. Please try again.');
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      if (!isFileTypeAllowed(file)) {
        showGlobalModal('warning', 'Invalid File', `File "${file.name}" is not allowed. Please upload images, documents, or archives under 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...validFiles]);
      // Initialize progress tracking for new files
      const newProgress = {};
      validFiles.forEach((_, index) => {
        newProgress[pendingFiles.length + index] = 0;
      });
      setUploadProgress(prev => ({ ...prev, ...newProgress }));
    }
    
    event.target.value = ''; // Reset input
  };

  const removePendingFile = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
    // Clean up progress state
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      // Reindex remaining progress entries
      const reindexed = {};
      Object.keys(newProgress).forEach(key => {
        const oldIndex = parseInt(key);
        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
        reindexed[newIndex] = newProgress[key];
      });
      return reindexed;
    });
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
            showGlobalModal('error', 'Upload Failed', `Failed to upload "${file.name}". Please try again.`);
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
      showGlobalModal('error', 'Message Failed', 'Failed to send message. Please try again.');
    }
    
    setIsSending(false);
  };

  // Typing indicator logic
  const typingTimeoutRef = useRef(null);
  
  const handleTyping = () => {
    if (!activeChatId || !user) return;
    
    // Set typing status
    if (!isTyping) {
      setIsTyping(true);
      // In a real app, you'd send this to other participants
      // sendTypingIndicator(activeChatId, true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // sendTypingIndicator(activeChatId, false);
    }, 1000);
  };
  
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '0',
      boxShadow: 'none',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    },
    
    sidebar: {
      width: '350px',
      borderRight: '1px solid #dbdbdb',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff'
    },
    
    sidebarHeader: {
      padding: '1.25rem 1rem',
      borderBottom: '1px solid #dbdbdb',
      backgroundColor: '#ffffff'
    },
    
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#262626',
      margin: '0 0 1rem 0'
    },
    
    headerActions: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    
    newChatBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.875rem',
      backgroundColor: '#0095f6',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    
    searchBox: {
      width: '100%',
      padding: '0.5rem 1rem',
      backgroundColor: '#efefef',
      border: '1px solid #dbdbdb',
      borderRadius: '8px',
      color: '#262626',
      fontSize: '0.875rem',
      outline: 'none'
    },
    
    storiesSection: {
      padding: '0.75rem 0',
      borderBottom: '1px solid #dbdbdb',
      overflowX: 'auto',
      display: 'flex',
      gap: '1rem',
      paddingLeft: '1rem',
      paddingRight: '1rem'
    },
    
    storyItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.25rem',
      minWidth: '60px',
      cursor: 'pointer'
    },
    
    storyAvatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      border: '2px solid #dd2a7b',
      padding: '2px',
      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
    },
    
    storyAvatarInner: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '2px solid #ffffff',
      objectFit: 'cover'
    },
    
    storyName: {
      fontSize: '0.75rem',
      color: '#262626',
      maxWidth: '64px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    
    connectionsSection: {
      padding: '1rem 0',
      borderBottom: '1px solid #dbdbdb'
    },
    
    sectionTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#8e8e8e',
      margin: '0 0 0.75rem 1rem',
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
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      backgroundColor: isActive ? '#efefef' : 'transparent',
      borderLeft: 'none',
      borderBottom: 'none',
      transition: 'all 0.2s',
      borderRadius: '8px',
      margin: '0 0.5rem'
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
      fontWeight: '400',
      fontSize: '0.875rem',
      color: '#262626',
      margin: '0 0 0.25rem 0'
    },
    
    lastMessage: {
      fontSize: '0.875rem',
      color: '#8e8e8e',
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
      color: '#8e8e8e'
    },
    
    // Main chat area
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    },
    
    chatHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #dbdbdb',
      backgroundColor: '#ffffff'
    },
    
    chatHeaderTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#262626',
      margin: 0
    },
    
    chatHeaderSubtitle: {
      fontSize: '0.75rem',
      color: '#8e8e8e'
    },
    
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      backgroundColor: '#ffffff'
    },
    
    messageBubble: (isOwn) => ({
      alignSelf: isOwn ? 'flex-end' : 'flex-start',
      maxWidth: '75%',
      backgroundColor: isOwn ? '#0095f6' : '#efefef',
      color: isOwn ? '#ffffff' : '#000000',
      padding: '0.75rem 1rem',
      borderRadius: '18px',
      boxShadow: 'none',
      fontSize: '0.9375rem',
      lineHeight: '1.3333',
      wordWrap: 'break-word'
    }),
    
    messageTime: {
      fontSize: '0.6875rem',
      color: '#8e8e8e',
      textAlign: 'center',
      margin: '0.5rem 0',
      padding: '0.25rem'
    },
    
    // Message input
    messageInput: {
      borderTop: '1px solid #dbdbdb',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
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
      border: '1px solid #dbdbdb',
      borderRadius: '22px',
      resize: 'none',
      fontFamily: 'inherit',
      fontSize: '0.875rem',
      lineHeight: '1.4',
      boxSizing: 'border-box',
      outline: 'none',
      backgroundColor: '#fafafa',
      color: '#262626'
    },
    
    attachButton: {
      padding: '0.625rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      color: '#262626',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    sendButton: (disabled) => ({
      padding: '0.5rem',
      backgroundColor: 'transparent',
      color: disabled ? '#385185' : '#0095f6',
      border: 'none',
      borderRadius: '50%',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '0.875rem'
    }),
    
    emptyState: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#8e8e8e',
      gap: '1rem',
      backgroundColor: '#ffffff'
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
      <CustomModal
        isOpen={globalModal.isOpen}
        onClose={closeGlobalModal}
        type={globalModal.type}
        title={globalModal.title}
        message={globalModal.message}
        onConfirm={globalModal.onConfirm}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        .freelancer-card {
          animation: slideInUp 0.6s ease both;
        }
      `}</style>
      <div style={styles.container}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Header */}
          <div style={styles.sidebarHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={styles.headerTitle}>Messages</h3>
              <button
                style={styles.newChatBtn}
                onClick={() => setIsSearchModalOpen(true)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1877f2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#0095f6'}
              >
                <PlusIcon />
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchBox}
            />
          </div>


          {/* Chats List */}
          <div style={styles.chatsSection}>
            {filteredChats.length === 0 && searchQuery && (
              <div style={{
                padding: '2rem 1.25rem',
                textAlign: 'center',
                color: '#8e8e8e'
              }}>
                No conversations found for "{searchQuery}"
              </div>
            )}
            {filteredChats.map((chat) => {
              const otherUserId = getOtherParticipant(chat, user.uid);
              const otherUserInfo = otherUserCache[otherUserId] || { name: 'Loading...' };
              const isActive = chat.id === activeChatId;
              const unreadCount = unreadCounts[chat.id] || 0;
              const isOnline = presenceStatus[otherUserId]?.isOnline || false;
              const connectionInfo = connectionStatus[otherUserId];

              return (
                <div
                  key={chat.id}
                  style={styles.chatItem(isActive)}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    if (onChatChange) onChatChange(chat.id);
                  }}
                  onMouseEnter={(e) => !isActive && (e.target.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => !isActive && (e.target.style.backgroundColor = 'transparent')}
                >
                  <div style={styles.avatarContainer}>
                    <img
                      src={otherUserInfo.photoUrl || getDefaultAvatar(otherUserInfo.name)}
                      alt={otherUserInfo.name}
                      style={styles.avatar}
                    />
                    {/* Online status indicator */}
                    {isOnline && (
                      <div style={styles.onlineIndicator}>
                        <OnlineIcon />
                      </div>
                    )}
                  </div>
                  <div style={styles.chatInfo}>
                    <div style={{
                      ...styles.chatName,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {otherUserInfo.name || otherUserId}
                      {/* Connection type badge */}
                      {connectionInfo?.connectionTypes?.includes('project') && (
                        <span style={{
                          fontSize: '0.7rem',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem',
                          fontWeight: '500'
                        }}>
                          Project
                        </span>
                      )}
                    </div>
                    <div style={{
                      ...styles.lastMessage,
                      fontWeight: unreadCount > 0 ? '600' : '400',
                      color: unreadCount > 0 ? '#0f172a' : '#64748b'
                    }}>
                      {chat.lastMessage || 'Start the conversation...'}
                    </div>
                  </div>
                  <div style={styles.chatMeta}>
                    <div style={styles.chatMessageTime}>
                      {formatChatTime(chat.lastMessageAt)}
                    </div>
                    {/* Unread count badge */}
                    {unreadCount > 0 && (
                      <div style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '0.25rem'
                      }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {chats.length === 0 && !searchQuery && (
              <div style={{
                padding: '2rem 1.25rem',
                textAlign: 'center',
                color: '#8e8e8e'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>💬</div>
                <div style={{
                  marginBottom: '1.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#262626'
                }}>No conversations yet</div>
                <div style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                  Start by clicking "New Chat" to search for freelancers or clients to message!
                </div>
                
                {/* Enhanced Features Info */}
                <div style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #262626',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginTop: '2rem',
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#0095f6',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    ✨ Enhanced Messaging Features
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    fontSize: '0.9rem',
                    color: '#a8a8a8'
                  }}>
                    <div>• Real-time messaging</div>
                    <div>• File attachments</div>
                    <div>• Typing indicators</div>
                    <div>• Online status</div>
                    <div>• Portfolio integration</div>
                    <div>• Project messaging</div>
                    <div>• Connection mapping</div>
                    <div>• Unread notifications</div>
                  </div>
                </div>
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
                    src={otherUser.photoUrl || getDefaultAvatar(otherUser.name)}
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
                      <div 
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwn ? 'flex-end' : 'flex-start',
                          gap: '0.5rem',
                          position: 'relative',
                          maxWidth: '75%',
                          alignSelf: isOwn ? 'flex-end' : 'flex-start'
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenuMessageId(message.id);
                        }}
                        onClick={(e) => {
                          if (e.detail === 2) { // Double click
                            setContextMenuMessageId(message.id);
                          } else if (contextMenuMessageId !== null) {
                            setContextMenuMessageId(null);
                          }
                        }}
                      >
                        <div style={styles.messageBubble(isOwn)}>
                          {message.text}
                          {message.attachments && message.attachments.map((attachment, idx) => (
                            <MessageAttachment
                              key={idx}
                              attachment={attachment}
                              isOwn={isOwn}
                            />
                          ))}
                          
                          {/* Enhanced message status for sender */}
                          {isOwn && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '0.25rem',
                              marginTop: '0.5rem',
                              fontSize: '0.75rem',
                              color: 'rgba(255, 255, 255, 0.7)'
                            }}>
                              {formatMessageTime(message.createdAt)}
                              <MessageStatusIcon status={message.readBy ? 'read' : 'delivered'} />
                            </div>
                          )}
                        </div>
                        
                        {/* Inline options button to open context menu (for click/touch) */}
                        <button
                          onClick={() => setContextMenuMessageId(message.id)}
                          title="Message options"
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: isOwn ? '-28px' : 'auto',
                            left: isOwn ? 'auto' : '-28px',
                            background: 'transparent',
                            border: 'none',
                            color: isOwn ? '#60a5fa' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '18px',
                            lineHeight: 1
                          }}
                        >
                          &#x22EE;
                        </button>
                        
                        {/* Context menu */}
                        {contextMenuMessageId === message.id && (
                          <MessageContextMenu
                            messageId={message.id}
                            chatId={activeChatId}
                            messageText={message.text}
                            isOwn={isOwn}
                            onClose={() => setContextMenuMessageId(null)}
                          />
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                
                {/* Typing indicator */}
                {typingUsers[activeChatId] && (
                  <TypingIndicator userName={otherUser?.name} />
                )}
                
                {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#8e8e8e',
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
                uploadProgress={uploadProgress}
              />

              {/* Message Input */}
              <div style={styles.messageInput}>
                <div style={styles.inputContainer}>
                  <button
                    style={styles.attachButton}
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <AttachIcon />
                  </button>
            
                  
                  <div style={styles.textareaContainer}>
                    <textarea
                      style={styles.textarea}
                      value={newMessage}
                      onChange={handleMessageChange}
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
                    {isSending || isUploading ? 'Sending...' : 'Send'}
                  </button>
                </div>
                
                {(isSending || isUploading) && (
                  <div style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    color: '#8e8e8e',
                    borderTop: '1px solid #dbdbdb'
                  }}>
                    {isUploading ? 'Uploading files...' : 'Sending message...'}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#262626' }}>
                Select a conversation
              </div>
              <div style={{ color: '#8e8e8e' }}>Choose a conversation from the sidebar or start a new one</div>
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