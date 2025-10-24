// src/components/ClientNotificationBar.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase.js';
import { FiBell, FiX, FiMessageCircle, FiExternalLink } from 'react-icons/fi';
import './NotificationBar.css';

const ClientNotificationBar = ({ onNavigateToMessages }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  // Subscribe to notifications for current user
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    console.log('Setting up notifications listener for client:', user.uid);

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        console.log(`Loaded ${notificationsList.length} notifications`);
        setNotifications(notificationsList);
        
        // Count unread notifications
        const unreadNotifications = notificationsList.filter(n => !n.read);
        setUnreadCount(unreadNotifications.length);
        console.log(`${unreadNotifications.length} unread notifications`);
        
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Handle different notification types
    if (notification.type === 'message' && notification.chatId) {
      if (onNavigateToMessages) {
        onNavigateToMessages(notification.chatId);
      }
      setIsOpen(false);
    }
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'message':
        return <FiMessageCircle className="notification-icon message" />;
      default:
        return <FiBell className="notification-icon" />;
    }
  };

  return (
    <div className="client-notification-bar">
      <div className="notification-toggle" onClick={toggleNotifications}>
        <FiBell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
        <span className="notification-text">Notifications</span>
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <FiX />
            </button>
          </div>

          <div className="notification-content">
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <FiBell className="empty-icon" />
                <p>No notifications yet</p>
                <span>You'll see new messages and updates here</span>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-item-content">
                      <div className="notification-item-header">
                        {getNotificationIcon(notification)}
                        <span className="notification-time">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      
                      <div className="notification-text">
                        {notification.type === 'message' ? (
                          <div className="message-notification">
                            <div className="sender-info">
                              {notification.senderPhotoUrl && (
                                <img 
                                  src={notification.senderPhotoUrl} 
                                  alt={notification.senderName}
                                  className="sender-avatar"
                                />
                              )}
                              <strong>{notification.senderName || 'Unknown User'}</strong>
                            </div>
                            <p className="message-preview">{notification.text}</p>
                          </div>
                        ) : (
                          <p>{notification.text}</p>
                        )}
                      </div>

                      {notification.type === 'message' && (
                        <FiExternalLink className="view-icon" />
                      )}
                    </div>
                    
                    {!notification.read && <div className="unread-indicator" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientNotificationBar;