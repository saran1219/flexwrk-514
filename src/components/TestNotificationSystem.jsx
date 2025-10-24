// src/components/TestNotificationSystem.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TestNotificationSystem = () => {
  const [testUser, setTestUser] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from the notification system.');
  const [isCreating, setIsCreating] = useState(false);
  const [log, setLog] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prev => [...prev, { message, type, timestamp }]);
  };

  const createTestNotification = async () => {
    if (!auth.currentUser || !testUser.trim() || !testMessage.trim()) {
      addLog('❌ Please fill in all fields and ensure you are logged in', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const notificationData = {
        userId: testUser.trim(),
        type: 'message',
        text: testMessage,
        senderName: auth.currentUser.displayName || auth.currentUser.email || 'Test User',
        senderPhotoUrl: auth.currentUser.photoURL || null,
        createdAt: serverTimestamp(),
        read: false
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      addLog('✅ Test notification created successfully!', 'success');
      setTestMessage('Hello! This is a test message from the notification system.');
    } catch (error) {
      console.error('Failed to create test notification:', error);
      addLog(`❌ Failed to create notification: ${error.message}`, 'error');
    }
    setIsCreating(false);
  };

  const createTestMessage = async () => {
    if (!auth.currentUser || !testUser.trim()) {
      addLog('❌ Please fill in user ID and ensure you are logged in', 'error');
      return;
    }

    setIsCreating(true);
    try {
      // Create a test chat ID (deterministic)
      const currentUserId = auth.currentUser.uid;
      const [user1, user2] = [currentUserId, testUser.trim()].sort();
      const testChatId = `${user1}_${user2}`;

      // Create a test message
      const messageData = {
        senderId: currentUserId,
        text: testMessage,
        createdAt: serverTimestamp(),
        readBy: [currentUserId],
        readAt: { [currentUserId]: serverTimestamp() },
        status: 'sent'
      };

      await addDoc(collection(db, 'chats', testChatId, 'messages'), messageData);
      addLog(`✅ Test message sent to chat ${testChatId}`, 'success');
    } catch (error) {
      console.error('Failed to create test message:', error);
      addLog(`❌ Failed to send test message: ${error.message}`, 'error');
    }
    setIsCreating(false);
  };

  const clearLog = () => {
    setLog([]);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      backgroundColor: '#ffffff',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1rem',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      display: process.env.NODE_ENV === 'development' ? 'block' : 'none' // Only show in development
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
          🧪 Notification System Test
        </h3>
        <button 
          onClick={clearLog}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
          title="Clear log"
        >
          Clear
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.25rem',
          color: '#374151'
        }}>
          Target User ID:
        </label>
        <input
          type="text"
          value={testUser}
          onChange={(e) => setTestUser(e.target.value)}
          placeholder="Enter user ID to send test notification"
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.25rem',
          color: '#374151'
        }}>
          Test Message:
        </label>
        <textarea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Enter test message content"
          rows={3}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={createTestNotification}
          disabled={isCreating}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: isCreating ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: isCreating ? 'not-allowed' : 'pointer'
          }}
        >
          {isCreating ? 'Creating...' : 'Test Notification'}
        </button>
        
        <button
          onClick={createTestMessage}
          disabled={isCreating}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: isCreating ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: isCreating ? 'not-allowed' : 'pointer'
          }}
        >
          {isCreating ? 'Sending...' : 'Test Message'}
        </button>
      </div>

      {log.length > 0 && (
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          fontSize: '0.8rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.5rem'
        }}>
          {log.map((entry, index) => (
            <div key={index} style={{
              marginBottom: '0.25rem',
              color: entry.type === 'error' ? '#ef4444' : 
                     entry.type === 'success' ? '#10b981' : '#6b7280'
            }}>
              <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>[{entry.timestamp}]</span> {entry.message}
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        padding: '0.5rem',
        backgroundColor: '#fef3c7',
        border: '1px solid #fcd34d',
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: '#92400e'
      }}>
        💡 <strong>Instructions:</strong><br/>
        1. Enter the User ID of another user<br/>
        2. Test Notification creates a direct notification<br/>
        3. Test Message sends a chat message (triggers notification system)<br/>
        4. Check if notifications appear properly
      </div>
    </div>
  );
};

export default TestNotificationSystem;