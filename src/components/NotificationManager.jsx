// src/components/NotificationManager.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import NotificationPopup from './NotificationPopup.jsx';

const NotificationManager = ({ onNavigateToMessages, activeChatId = null }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeNotification, setActiveNotification] = useState(null);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isInActiveChat, setIsInActiveChat] = useState(false);
  const processedMessages = useRef(new Set());
  const lastProcessedTime = useRef(new Map());
  const processingQueue = useRef(new Set()); // Track messages currently being processed
  const chatListeners = useRef(new Map()); // Track active chat listeners
  
  // Track window focus for better notification control
  useEffect(() => {
    const handleFocus = () => {
      setIsWindowFocused(true);
      console.log('Window focused - notifications may be suppressed for active chat');
    };
    
    const handleBlur = () => {
      setIsWindowFocused(false);
      console.log('Window blurred - notifications will show normally');
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
  
  // Track active chat state
  useEffect(() => {
    const wasInActiveChat = isInActiveChat;
    const nowInActiveChat = Boolean(activeChatId);
    setIsInActiveChat(nowInActiveChat);
    
    if (wasInActiveChat !== nowInActiveChat) {
      console.log('Chat activity state changed:', {
        was: wasInActiveChat,
        now: nowInActiveChat,
        activeChatId,
        windowFocused: isWindowFocused
      });
    }
  }, [activeChatId, isWindowFocused]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
      // Reset processed messages when user changes
      processedMessages.current = new Set();
      lastProcessedTime.current = new Map();
      processingQueue.current = new Set();
      
      // Clean up existing listeners
      chatListeners.current.forEach(unsub => unsub());
      chatListeners.current.clear();
    });
    return unsubscribe;
  }, []);

  // Single notification listener - more efficient approach
  useEffect(() => {
    if (!user) return;

    console.log('Setting up notification listener for user:', user.uid);
    
    // Clean up old processed messages every 5 minutes
    const cleanupInterval = setInterval(() => {
      console.log('Cleaning up old processed messages');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      // Keep only recent entries in processed messages
      const recentEntries = new Set();
      const recentTimes = new Map();
      
      lastProcessedTime.current.forEach((time, chatKey) => {
        if (time > fiveMinutesAgo) {
          recentTimes.set(chatKey, time);
        }
      });
      
      processedMessages.current = recentEntries;
      lastProcessedTime.current = recentTimes;
      processingQueue.current = new Set();
    }, 5 * 60 * 1000);
    
    // Listen for messages across all chats more efficiently
    const messagesCollectionGroupQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribeChats = onSnapshot(messagesCollectionGroupQuery, (chatsSnapshot) => {
      // Clean up old listeners
      chatListeners.current.forEach(unsub => unsub());
      chatListeners.current.clear();
      
      // Set up a single listener for each active chat
      chatsSnapshot.docs.forEach(chatDoc => {
        const chatId = chatDoc.id;
        
        // Set up message listener for this specific chat
        const messagesQuery = query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('createdAt', 'desc'),
          limit(1) // Only get the latest message
        );
        
        const messageUnsub = onSnapshot(messagesQuery, async (messagesSnapshot) => {
          if (messagesSnapshot.empty) return;
          
          const latestMessageDoc = messagesSnapshot.docs[0];
          const message = {
            id: latestMessageDoc.id,
            chatId,
            ...latestMessageDoc.data()
          };

          // Skip messages sent by current user
          if (message.senderId === user.uid) return;
          
          // Check if message is recent (within last 5 seconds)
          const messageTime = message.createdAt?.toDate?.() || new Date(message.createdAt);
          const now = new Date();
          const timeDiff = now - messageTime;
          
          if (timeDiff > 5000 || timeDiff < 0) {
            // Message is too old or in the future, skip
            return;
          }

          // Create unique identifiers
          const messageKey = `${message.chatId}_${message.id}`;
          
          // Skip if already processed or currently processing
          if (processedMessages.current.has(messageKey) || processingQueue.current.has(messageKey)) {
            return;
          }
          
          // Additional chat-level duplicate prevention
          const lastTime = lastProcessedTime.current.get(chatId);
          if (lastTime && (messageTime - lastTime) < 1000) {
            console.log('Skipping message due to recent processing in chat:', messageKey);
            return;
          }
          
          // Add to processing queue
          processingQueue.current.add(messageKey);
          
          try {
            console.log('Processing new message for notification:', messageKey);
            
            // Check if notification already exists in Firestore first
            const existingNotificationQuery = query(
              collection(db, 'notifications'),
              where('userId', '==', user.uid),
              where('messageId', '==', message.id),
              where('chatId', '==', message.chatId)
            );
            
            const existingNotifications = await getDocs(existingNotificationQuery);
            if (!existingNotifications.empty) {
              console.log('Notification already exists for message:', message.id);
              return;
            }
            
            // Get sender information
            const senderDoc = await getDoc(doc(db, 'users', message.senderId));
            const senderData = senderDoc.exists() ? senderDoc.data() : {};

            const notification = {
              id: `msg_${message.id}`,
              type: 'message',
              chatId: message.chatId,
              messageId: message.id,
              senderId: message.senderId,
              senderName: senderData.name || senderData.email || 'Unknown User',
              senderPhotoUrl: senderData.photoUrl,
              messagePreview: message.text ? 
                (message.text.length > 100 ? message.text.substring(0, 100) + '...' : message.text) :
                (message.attachments?.length ? `📎 ${message.attachments.length} attachment(s)` : 'New message'),
              timestamp: 'Just now',
              createdAt: new Date()
            };

            // Save to persistent notifications FIRST (to prevent duplicates)
            const notificationData = {
              userId: user.uid,
              type: 'message',
              text: `New message from ${notification.senderName}: ${notification.messagePreview}`,
              chatId: message.chatId,
              messageId: message.id,
              senderId: message.senderId,
              senderName: notification.senderName,
              createdAt: serverTimestamp(),
              read: false
            };
            
            if (notification.senderPhotoUrl) {
              notificationData.senderPhotoUrl = notification.senderPhotoUrl;
            }
            
            await addDoc(collection(db, 'notifications'), notificationData);
            console.log('Created notification for message:', notification);
            
            // Mark as processed AFTER successful creation
            processedMessages.current.add(messageKey);
            lastProcessedTime.current.set(chatId, messageTime);

            // Enhanced WhatsApp-like notification logic
            // Don't show notifications if:
            // 1. User is in the same chat AND window is focused
            // 2. This prevents popups when actively chatting
            const shouldSuppressNotification = activeChatId === message.chatId && isWindowFocused;
            
            console.log('Notification decision logic:', {
              activeChatId,
              messageChatId: message.chatId,
              isWindowFocused,
              shouldSuppressNotification,
              willShowNotification: !shouldSuppressNotification
            });
            
            if (!shouldSuppressNotification) {
              console.log('✅ Showing popup notification for chat:', message.chatId);
              setActiveNotification(notification);
              // Play notification sound
              playNotificationSound();
            } else {
              console.log('🚫 Suppressing notification - user is actively in this chat with window focused:', {
                chatId: message.chatId,
                activeChat: activeChatId,
                windowFocused: isWindowFocused
              });
            }

          } catch (error) {
            console.error('Failed to create message notification:', error);
          } finally {
            // Remove from processing queue
            processingQueue.current.delete(messageKey);
          }
        });

        chatListeners.current.set(chatId, messageUnsub);
      });
    });

    return () => {
      unsubscribeChats();
      clearInterval(cleanupInterval);
      chatListeners.current.forEach(unsub => unsub());
      chatListeners.current.clear();
    };
  }, [user, activeChatId]); // Add activeChatId to dependency array

  const playNotificationSound = useCallback(() => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

  const handleNotificationClose = () => {
    setActiveNotification(null);
  };

  const handleNotificationView = (notification) => {
    console.log('Viewing notification:', notification);
    
    // Navigate to messages and select the chat
    if (onNavigateToMessages) {
      onNavigateToMessages(notification.chatId);
    }
    
    setActiveNotification(null);
  };

  return (
    <>
      {activeNotification && (
        <NotificationPopup
          notification={activeNotification}
          onClose={handleNotificationClose}
          onView={handleNotificationView}
        />
      )}
    </>
  );
};

export default NotificationManager;