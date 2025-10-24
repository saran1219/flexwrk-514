// src/utils/messagingApi.js

import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  startAt,
  endAt,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage, auth } from '../firebase.js';

// =============================================
// User Connection Management
// =============================================

/**
 * Add a user to connections (when they start messaging or work together)
 */
export const addUserConnection = async (targetUserId, connectionType = 'messaging') => {
  console.log('Adding user connection:', targetUserId, connectionType);
  
  if (!auth.currentUser) {
    console.error('User not authenticated for connection');
    throw new Error('User not authenticated');
  }
  
  const currentUserId = auth.currentUser.uid;
  
  try {
    // Get target user info first
    const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
    if (!targetUserDoc.exists()) {
      console.warn('Target user not found:', targetUserId);
      // Don't throw error, just skip connection creation
      return;
    }
    
    const targetUserData = targetUserDoc.data();
    const connectionsRef = collection(db, 'connections', currentUserId, 'connectedUsers');
    
    // Check if connection already exists
    let existingConnection;
    try {
      existingConnection = await getDoc(doc(connectionsRef, targetUserId));
    } catch (checkError) {
      console.warn('Could not check existing connection:', checkError);
      // Continue to create new connection
    }
    
    if (existingConnection && existingConnection.exists()) {
      console.log('Connection already exists, updating...');
      try {
        // Update last interaction
        await updateDoc(doc(connectionsRef, targetUserId), {
          lastInteraction: serverTimestamp(),
          connectionTypes: existingConnection.data().connectionTypes || [connectionType]
        });
      } catch (updateError) {
        console.warn('Failed to update existing connection:', updateError);
      }
      return;
    }
    
    console.log('Creating new connection...');
    
    // Create connection for current user
    const connectionData = {
      userId: targetUserId,
      name: targetUserData.name || targetUserData.email || 'Unknown User',
      email: targetUserData.email || '',
      userType: targetUserData.userType || 'client',
      photoUrl: targetUserData.photoUrl || '',
      connectionTypes: [connectionType],
      connectedAt: serverTimestamp(),
      lastInteraction: serverTimestamp(),
      isActive: true
    };
    
    try {
      await setDoc(doc(connectionsRef, targetUserId), connectionData);
      console.log('Connection created for current user');
    } catch (createError) {
      console.warn('Failed to create connection for current user:', createError);
    }
    
    // Try to add reverse connection for the target user (optional)
    try {
      const reverseConnectionsRef = collection(db, 'connections', targetUserId, 'connectedUsers');
      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      const currentUserData = currentUserDoc.data() || {};
      
      const reverseConnectionData = {
        userId: currentUserId,
        name: currentUserData.name || currentUserData.email || 'Unknown User',
        email: currentUserData.email || '',
        userType: currentUserData.userType || 'client',
        photoUrl: currentUserData.photoUrl || '',
        connectionTypes: [connectionType],
        connectedAt: serverTimestamp(),
        lastInteraction: serverTimestamp(),
        isActive: true
      };
      
      await setDoc(doc(reverseConnectionsRef, currentUserId), reverseConnectionData);
      console.log('Reverse connection created');
      
    } catch (reverseError) {
      console.warn('Failed to create reverse connection (not critical):', reverseError);
      // Don't throw error, this is optional
    }
    
  } catch (error) {
    console.error('Failed to add user connection:', error);
    // Don't throw error to prevent blocking chat creation
    console.warn('Connection creation failed, but continuing...');
  }
};

/**
 * Get user's connections
 */
export const getUserConnections = (callback) => {
  if (!auth.currentUser) return () => {};
  
  const currentUserId = auth.currentUser.uid;
  const connectionsRef = collection(db, 'connections', currentUserId, 'connectedUsers');
  const q = query(connectionsRef, where('isActive', '==', true), orderBy('lastInteraction', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const connections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(connections);
  });
};

// =============================================
// Enhanced Chat Management
// =============================================

/**
 * Create or get existing chat between users
 */
export const createOrGetChat = async (otherUserId, connectionType = 'messaging') => {
  console.log('Creating chat with user:', otherUserId, 'Connection type:', connectionType);
  
  if (!auth.currentUser) {
    console.error('User not authenticated');
    throw new Error('User not authenticated');
  }
  
  const currentUserId = auth.currentUser.uid;
  console.log('Current user ID:', currentUserId);
  
  if (currentUserId === otherUserId) {
    console.error('Cannot create chat with yourself');
    throw new Error('Cannot create chat with yourself');
  }
  
  try {
    // Create deterministic chat ID
    const [user1, user2] = [currentUserId, otherUserId].sort();
    const chatId = `${user1}_${user2}`;
    console.log('Chat ID:', chatId);
    
    const chatRef = doc(db, 'chats', chatId);
    
    // Try to get existing chat first
    let chatDoc;
    try {
      chatDoc = await getDoc(chatRef);
      console.log('Chat exists:', chatDoc.exists());
    } catch (getError) {
      console.error('Error checking existing chat:', getError);
      // Continue to create new chat
    }
    
    if (!chatDoc || !chatDoc.exists()) {
      console.log('Creating new chat...');
      
      // Create new chat with simplified data
      const chatData = {
        participants: [user1, user2],
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        messageCount: 0
      };
      
      console.log('Chat data to create:', chatData);
      
      await setDoc(chatRef, chatData);
      console.log('Chat created successfully');
      
      // Try to add connections, but don't fail if this fails
      try {
        await addUserConnection(otherUserId, connectionType);
        console.log('User connections added');
      } catch (connectionError) {
        console.warn('Failed to add user connections, but chat created:', connectionError);
      }
    } else {
      console.log('Updating existing chat...');
      try {
        // Update last activity
        await updateDoc(chatRef, {
          updatedAt: serverTimestamp(),
          isActive: true
        });
        console.log('Chat updated successfully');
      } catch (updateError) {
        console.warn('Failed to update chat metadata, but chat exists:', updateError);
      }
    }
    
    console.log('Returning chat ID:', chatId);
    return chatId;
    
  } catch (error) {
    console.error('Failed to create or get chat:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      currentUserId,
      otherUserId,
      connectionType
    });
    throw new Error(`Failed to start chat: ${error?.message || 'Unknown error'}`);
  }
};

/**
 * Send a message with optional file attachments
 */
export const sendMessage = async (chatId, messageText, attachments = []) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const currentUserId = auth.currentUser.uid;
  const batch = writeBatch(db);
  
  // Create message document
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const messageRef = doc(messagesRef);
  
  const messageData = {
    senderId: currentUserId,
    text: messageText.trim(),
    createdAt: serverTimestamp(),
    editedAt: null,
    hasAttachments: attachments.length > 0,
    attachments: attachments,
    messageType: 'text',
    readBy: [currentUserId], // Sender automatically reads their own message
    readAt: { [currentUserId]: serverTimestamp() },
    status: 'sent' // sent, delivered, read
  };
  
  batch.set(messageRef, messageData);
  
  // Update chat metadata
  const chatRef = doc(db, 'chats', chatId);
  batch.update(chatRef, {
    lastMessage: messageText.trim() || (attachments.length > 0 ? `📎 ${attachments.length} attachment(s)` : ''),
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messageCount: 1 // This will be incremented by Cloud Functions in production
  });
  
  // Update connections for both users
  const chatDoc = await getDoc(chatRef);
  if (chatDoc.exists()) {
    const participants = chatDoc.data().participants || [];
    for (const participantId of participants) {
      if (participantId !== currentUserId) {
        const connectionRef = doc(db, 'connections', participantId, 'connectedUsers', currentUserId);
        batch.set(connectionRef, {
          lastInteraction: serverTimestamp()
        }, { merge: true });
      }
    }
  }
  
  await batch.commit();
  return messageRef.id;
};

// =============================================
// File Upload Management
// =============================================

/**
 * Upload file to Firebase Storage and return metadata
 */
export const uploadMessageAttachment = async (file, chatId) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const currentUserId = auth.currentUser.uid;
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `chats/${chatId}/attachments/${currentUserId}_${timestamp}_${sanitizedFileName}`;
  
  try {
    // Upload file to Storage
    const storageRef = ref(storage, storagePath);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Store file metadata in Firestore
    const fileMetadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storagePath: storagePath,
      downloadURL: downloadURL,
      uploadedBy: currentUserId,
      uploadedAt: serverTimestamp(),
      chatId: chatId
    };
    
    const fileDocRef = await addDoc(collection(db, 'fileUploads'), fileMetadata);
    
    return {
      id: fileDocRef.id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: downloadURL,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Delete file attachment
 */
export const deleteAttachment = async (attachmentId, storagePath) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  try {
    // Delete from Storage
    if (storagePath) {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    }
    
    // Delete metadata from Firestore
    await deleteDoc(doc(db, 'fileUploads', attachmentId));
  } catch (error) {
    console.error('Failed to delete attachment:', error);
    throw new Error(`Failed to delete attachment: ${error.message}`);
  }
};

// =============================================
// Freelancer Portfolio Integration
// =============================================

/**
 * Get freelancer details with portfolio for messaging integration
 */
export const getFreelancerForMessaging = async (freelancerId) => {
  try {
    const freelancerDoc = await getDoc(doc(db, 'users', freelancerId));
    if (!freelancerDoc.exists()) {
      throw new Error('Freelancer not found');
    }

    const freelancerData = { id: freelancerDoc.id, ...freelancerDoc.data() };
    
    // Get portfolio projects
    const portfolioQuery = query(
      collection(db, 'projects'),
      where('freelancerId', '==', freelancerId),
      where('isPortfolioItem', '==', true),
      orderBy('createdAt', 'desc'),
      limit(6)
    );
    
    const portfolioSnapshot = await getDocs(portfolioQuery);
    const portfolio = portfolioSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      ...freelancerData,
      portfolio
    };
  } catch (error) {
    console.error('Failed to get freelancer details:', error);
    throw new Error(`Failed to load freelancer: ${error.message}`);
  }
};

/**
 * Start chat from freelancer portfolio view
 */
export const startChatFromPortfolio = async (freelancerId, context = {}) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  try {
    // Create or get existing chat
    const chatId = await createOrGetChat(freelancerId, 'portfolio_inquiry');
    
    // If context is provided, send an initial message
    if (context.projectId || context.message) {
      let initialMessage = context.message || '';
      
      if (context.projectId && !initialMessage) {
        const projectDoc = await getDoc(doc(db, 'projects', context.projectId));
        if (projectDoc.exists()) {
          const project = projectDoc.data();
          initialMessage = `Hi! I'm interested in your project "${project.title}". I'd like to discuss this further.`;
        }
      }
      
      if (initialMessage) {
        await sendMessage(chatId, initialMessage);
      }
    }
    
    return chatId;
  } catch (error) {
    console.error('Failed to start chat from portfolio:', error);
    throw error;
  }
};

// =============================================
// Enhanced Connection Status
// =============================================

/**
 * Get connection status between users
 */
export const getConnectionStatus = async (targetUserId) => {
  if (!auth.currentUser) return null;
  
  try {
    const currentUserId = auth.currentUser.uid;
    const connectionRef = doc(db, 'connections', currentUserId, 'connectedUsers', targetUserId);
    const connectionDoc = await getDoc(connectionRef);
    
    if (connectionDoc.exists()) {
      return {
        isConnected: true,
        ...connectionDoc.data()
      };
    }
    
    return { isConnected: false };
  } catch (error) {
    console.error('Failed to get connection status:', error);
    return { isConnected: false };
  }
};

/**
 * Get chat history summary for connection
 */
export const getChatHistorySummary = async (otherUserId) => {
  if (!auth.currentUser) return null;
  
  try {
    const currentUserId = auth.currentUser.uid;
    const [user1, user2] = [currentUserId, otherUserId].sort();
    const chatId = `${user1}_${user2}`;
    
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) return null;
    
    const chatData = chatDoc.data();
    
    // Get recent messages count
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    const recentMessages = messagesSnapshot.docs.map(doc => doc.data());
    
    return {
      chatId,
      messageCount: chatData.messageCount || recentMessages.length,
      lastMessage: chatData.lastMessage,
      lastMessageAt: chatData.lastMessageAt,
      recentMessagesPreview: recentMessages.slice(0, 3)
    };
  } catch (error) {
    console.error('Failed to get chat history summary:', error);
    return null;
  }
};

// =============================================
// Message Status and Read Receipts
// =============================================

/**
 * Get unread message count for a chat
 */
export const getUnreadMessageCount = async (chatId) => {
  if (!auth.currentUser) return 0;
  
  try {
    const currentUserId = auth.currentUser.uid;
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) return 0;
    
    const chatData = chatDoc.data();
    const lastReadTimestamp = chatData.lastReadBy?.[currentUserId];
    
    if (!lastReadTimestamp) return chatData.messageCount || 0;
    
    // Count messages after last read timestamp (filter sender client-side to avoid composite index)
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      where('createdAt', '>', lastReadTimestamp)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const count = messagesSnapshot.docs.filter(d => d.data().senderId !== currentUserId).length;
    return count;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
};

/**
 * Subscribe to online status of users
 */
export const subscribeToUserPresence = (userIds, callback) => {
  const presenceRefs = userIds.map(userId => 
    doc(db, 'presence', userId)
  );
  
  const unsubscribers = presenceRefs.map(presenceRef => 
    onSnapshot(presenceRef, (doc) => {
      if (doc.exists()) {
        callback({
          userId: doc.id,
          ...doc.data()
        });
      }
    }, () => {
      // Handle errors silently for presence
    })
  );
  
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
};

// =============================================
// User Search and Discovery
// =============================================

/**
 * Search for users by name, email, or skills
 */
export const searchUsers = async (searchTerm, userType = null, limitNum = 20) => {
  if (!searchTerm || searchTerm.trim().length < 2) return [];
  
  const term = searchTerm.trim().toLowerCase();
  
  try {
    const usersRef = collection(db, 'users');
    
    // Try simple query first (without complex ordering)
    let q;
    if (userType) {
      q = query(
        usersRef,
        where('userType', '==', userType),
        limit(limitNum * 2) // Get more to filter client-side
      );
    } else {
      q = query(usersRef, limit(limitNum * 2));
    }
    
    const snapshot = await getDocs(q);
    
    // Client-side filtering and search
    const allResults = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter and rank results
    const filteredResults = allResults
      .filter(user => {
        // Exclude current user
        if (user.id === auth.currentUser?.uid) return false;
        
        const searchableText = [
          user.name || '',
          user.email || '',
          user.title || '',
          user.username || '',
          ...(user.skills || [])
        ].join(' ').toLowerCase();
        
        return searchableText.includes(term);
      })
      .sort((a, b) => {
        // Prioritize name matches
        const aNameMatch = (a.name || '').toLowerCase().includes(term);
        const bNameMatch = (b.name || '').toLowerCase().includes(term);
        
        if (aNameMatch && !bNameMatch) return -1;
        if (bNameMatch && !aNameMatch) return 1;
        
        // Then sort alphabetically
        return (a.name || '').localeCompare(b.name || '');
      })
      .slice(0, limitNum);
    
    return filteredResults;
    
  } catch (error) {
    console.error('User search failed:', error);
    
    // Try even simpler fallback - just get all users and filter
    try {
      const simpleQuery = query(collection(db, 'users'), limit(50));
      const fallbackSnapshot = await getDocs(simpleQuery);
      
      return fallbackSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => {
          if (user.id === auth.currentUser?.uid) return false;
          if (userType && user.userType !== userType) return false;
          
          const searchableText = [
            user.name || '',
            user.email || '',
            user.username || ''
          ].join(' ').toLowerCase();
          
          return searchableText.includes(term);
        })
        .slice(0, limitNum);
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      return [];
    }
  }
};

// =============================================
// Message Management
// =============================================

/**
 * Get messages for a chat with real-time updates
 */
export const subscribeToMessages = (chatId, callback) => {
  if (!chatId) return () => {};
  
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

/**
 * Delete a message (only sender can delete their own messages)
 */
export const deleteMessage = async (chatId, messageId) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const currentUserId = auth.currentUser.uid;
  
  try {
    // Get message to verify sender
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }
    
    const messageData = messageDoc.data();
    
    // Only allow sender to delete their own message
    if (messageData.senderId !== currentUserId) {
      throw new Error('You can only delete your own messages');
    }
    
    // Delete attachments from storage if any
    if (messageData.attachments && messageData.attachments.length > 0) {
      for (const attachment of messageData.attachments) {
        try {
          if (attachment.id) {
            const fileDoc = await getDoc(doc(db, 'fileUploads', attachment.id));
            if (fileDoc.exists()) {
              const fileData = fileDoc.data();
              await deleteAttachment(attachment.id, fileData.storagePath);
            }
          }
        } catch (attachmentError) {
          console.warn('Failed to delete attachment:', attachmentError);
          // Continue deleting message even if attachment deletion fails
        }
      }
    }
    
    // Delete the message
    await deleteDoc(messageRef);
    
    // Update chat's last message if this was the last message
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const latestMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
    const latestMessageSnapshot = await getDocs(latestMessageQuery);
    
    if (latestMessageSnapshot.docs.length > 0) {
      const latestMessage = latestMessageSnapshot.docs[0].data();
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: latestMessage.text || '📎 Attachment',
        lastMessageAt: latestMessage.createdAt
      });
    } else {
      // No messages left, clear last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: '',
        lastMessageAt: serverTimestamp()
      });
    }
    
    console.log('Message deleted successfully');
  } catch (error) {
    console.error('Failed to delete message:', error);
    throw new Error(`Failed to delete message: ${error.message}`);
  }
};

/**
 * Mark messages as read with enhanced real-time updates
 */
export const markMessagesAsRead = async (chatId) => {
  if (!auth.currentUser) return;
  const currentUserId = auth.currentUser.uid;
  try {
    // Only update chat-level read timestamp to avoid restricted per-message updates
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`lastReadBy.${currentUserId}`]: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
  }
};

/**
 * Get user's active chats
 */
export const subscribeToUserChats = (callback) => {
  if (!auth.currentUser) return () => {};
  
  const currentUserId = auth.currentUser.uid;
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', currentUserId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    // Sort client-side to avoid composite indexes
    .sort((a, b) => (b.lastMessageAt?.toMillis?.() || 0) - (a.lastMessageAt?.toMillis?.() || 0));
    callback(chats);
  });
};

// =============================================
// Utility Functions
// =============================================

/**
 * Get other participant in a chat
 */
export const getOtherParticipant = (chat, currentUserId) => {
  if (!chat || !chat.participants) return null;
  return chat.participants.find(p => p !== currentUserId) || null;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file type is allowed
 */
export const isFileTypeAllowed = (file) => {
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'text/plain', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Code files
    'text/javascript', 'text/html', 'text/css', 'application/json', 'text/xml'
  ];
  
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export default {
  addUserConnection,
  getUserConnections,
  createOrGetChat,
  sendMessage,
  uploadMessageAttachment,
  deleteAttachment,
  searchUsers,
  subscribeToMessages,
  markMessagesAsRead,
  subscribeToUserChats,
  getOtherParticipant,
  formatFileSize,
  isFileTypeAllowed,
  // Portfolio integration
  getFreelancerForMessaging,
  startChatFromPortfolio,
  // Enhanced connection status
  getConnectionStatus,
  getChatHistorySummary,
  // Message status
  getUnreadMessageCount,
  subscribeToUserPresence
};
