// src/components/NotificationPopup.jsx

import React, { useState, useEffect } from 'react';

// Icon components
const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const NotificationPopup = ({ notification, onClose, onView }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    // Entry animation
    setTimeout(() => setIsAnimating(true), 10);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleView = () => {
    onView(notification);
    handleClose();
  };

  if (!isVisible || !notification) return null;

  return (
    <>
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-100px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        
        @keyframes slideOutUp {
          from {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
          to {
            opacity: 0;
            transform: translateY(-100px) translateX(-50%);
          }
        }
        
        .notification-popup {
          animation: ${isAnimating ? 'slideInDown' : 'slideOutUp'} 0.3s ease-out forwards;
        }
      `}</style>
      
      <div
        className="notification-popup"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          maxWidth: '400px',
          width: '90%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          border: '2px solid #e0f2fe',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <MessageIcon />
            <span style={{
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              New Message
            </span>
          </div>
          
          <button
            onClick={handleClose}
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
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <img
              src={notification.senderPhotoUrl || 'https://via.placeholder.com/40'}
              alt={notification.senderName}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #f0f9ff'
              }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '0.25rem'
              }}>
                {notification.senderName || 'Unknown User'}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                {notification.timestamp}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              color: '#374151',
              lineHeight: '1.5',
              fontSize: '0.95rem'
            }}>
              {notification.messagePreview}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '0.75rem'
          }}>
            <button
              onClick={handleView}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
              }}
            >
              View Message
            </button>
            
            <button
              onClick={handleClose}
              style={{
                padding: '0.75rem 1rem',
                background: 'transparent',
                color: '#64748b',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.borderColor = '#cbd5e0';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#e2e8f0';
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPopup;