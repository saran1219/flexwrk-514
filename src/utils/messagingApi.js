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
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const currentUserId = auth.currentUser.uid;
  const connectionsRef = collection(db, 'connections', currentUserId, 'connectedUsers');
  
  // Check if connection already exists
  const existingConnection = await getDoc(doc(connectionsRef, targetUserId));
  if (existingConnection.exists()) {
    // Update last interaction
    await updateDoc(doc(connectionsRef, targetUserId), {
      lastInteraction: serverTimestamp(),
      connectionTypes: existingConnection.data().connectionTypes || [connectionType]
    });
    return;
  }
  
  // Get target user info
  const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
  if (!targetUserDoc.exists()) throw new Error('Target user not found');
  
  const targetUserData = targetUserDoc.data();
  
  // Create connection
  await setDoc(doc(connectionsRef, targetUserId), {
    userId: targetUserId,
    name: targetUserData.name || targetUserData.email || 'Unknown User',
    email: targetUserData.email || '',
    userType: targetUserData.userType || 'client',
    photoUrl: targetUserData.photoUrl || '',
    connectionTypes: [connectionType],
    connectedAt: serverTimestamp(),
    lastInteraction: serverTimestamp(),
    isActive: true
  });
  
  // Also add reverse connection for the target user
  const reverseConnectionsRef = collection(db, 'connections', targetUserId, 'connectedUsers');
  const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
  const currentUserData = currentUserDoc.data() || {};
  
  await setDoc(doc(reverseConnectionsRef, currentUserId), {
    userId: currentUserId,
    name: currentUserData.name || currentUserData.email || 'Unknown User',
    email: currentUserData.email || '',
    userType: currentUserData.userType || 'client',
    photoUrl: currentUserData.photoUrl || '',
    connectionTypes: [connectionType],
    connectedAt: serverTimestamp(),
    lastInteraction: serverTimestamp(),
    isActive: true
  });
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
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const currentUserId = auth.currentUser.uid;
  if (currentUserId === otherUserId) throw new Error('Cannot create chat with yourself');
  
  // Create deterministic chat ID
  const [user1, user2] = [currentUserId, otherUserId].sort();
  const chatId = `${user1}_${user2}`;
  
  const chatRef = doc(db, 'chats', chatId);
  const chatDoc = await getDoc(chatRef);
  
  if (!chatDoc.exists()) {
    // Create new chat
    await setDoc(chatRef, {
      participants: [user1, user2],
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      messageCount: 0
    });
    
    // Add both users to each other's connections
    await addUserConnection(otherUserId, connectionType);
  } else {
    // Update last activity
    await updateDoc(chatRef, {
      updatedAt: serverTimestamp(),
      isActive: true
    });
  }
  
  return chatId;
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
    messageType: 'text'
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
// User Search and Discovery
// =============================================

/**
 * Search for users by name, email, or skills
 */
export const searchUsers = async (searchTerm, userType = null, limit = 20) => {
  if (!searchTerm || searchTerm.trim().length < 2) return [];
  
  const term = searchTerm.trim().toLowerCase();
  
  try {
    // Primary search: by name with prefix matching
    const usersRef = collection(db, 'users');
    let q = query(
      usersRef,
      orderBy('name'),
      startAt(searchTerm),
      endAt(searchTerm + '\uf8ff'),
      limit(limit)
    );
    
    if (userType) {
      q = query(
        usersRef,
        where('userType', '==', userType),
        orderBy('name'),
        startAt(searchTerm),
        endAt(searchTerm + '\uf8ff'),
        limit(limit)
      );
    }
    
    let searchResults = [];
    const snapshot = await getDocs(q);
    
    searchResults = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // If prefix search doesn't yield enough results, do a broader search
    if (searchResults.length < 5) {
      let fallbackQuery = query(usersRef, limit(50));
      if (userType) {
        fallbackQuery = query(usersRef, where('userType', '==', userType), limit(50));
      }
      
      const fallbackSnapshot = await getDocs(fallbackQuery);
      const fallbackResults = fallbackSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => {
          const searchableText = [
            user.name || '',
            user.email || '',
            user.title || '',
            ...(user.skills || [])
          ].join(' ').toLowerCase();
          
          return searchableText.includes(term);
        })
        .slice(0, limit);
      
      // Merge results, avoiding duplicates
      const existingIds = new Set(searchResults.map(r => r.id));
      fallbackResults.forEach(result => {
        if (!existingIds.has(result.id)) {
          searchResults.push(result);
        }
      });
    }
    
    return searchResults.slice(0, limit);
  } catch (error) {
    console.error('User search failed:', error);
    return [];
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
 * Mark messages as read
 */
export const markMessagesAsRead = async (chatId) => {
  if (!auth.currentUser) return;
  
  const currentUserId = auth.currentUser.uid;
  const chatRef = doc(db, 'chats', chatId);
  
  await updateDoc(chatRef, {
    [`lastReadBy.${currentUserId}`]: serverTimestamp()
  });
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
    where('participants', 'array-contains', currentUserId),
    where('isActive', '==', true),
    orderBy('lastMessageAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
  isFileTypeAllowed
};