# Real-Time Messaging System Guide

## Overview
This guide explains the enhanced real-time messaging system implemented for the FLEXwrk platform, which provides WhatsApp-like messaging functionality with intelligent notification management.

## Key Features

### ✅ WhatsApp-Like Notification Behavior
- **Smart Suppression**: Notifications are suppressed when user is actively in the same chat with window focused
- **Window Focus Detection**: Notifications show normally when window is out of focus
- **Real-time Updates**: Messages appear instantly without page refresh

### ✅ Enhanced Message Status Indicators
- **Read Receipts**: Shows when messages are read by recipients
- **Message Status**: Displays sent, delivered, and read states
- **Typing Indicators**: Shows when someone is typing

### ✅ Robust Real-time Architecture
- **Firebase Real-time Listeners**: Instant message delivery
- **Efficient Duplicate Prevention**: Prevents duplicate notifications
- **Connection Status Tracking**: Shows online/offline status

## Architecture Components

### 1. NotificationManager (`src/components/NotificationManager.jsx`)
**Purpose**: Central notification system that handles all message notifications

**Key Features**:
- Window focus detection for smart notification suppression
- Real-time message listeners across all chats
- Duplicate notification prevention
- WhatsApp-like notification logic

**Smart Notification Logic**:
```javascript
// Don't show notifications if:
// 1. User is in the same chat AND window is focused
const shouldSuppressNotification = activeChatId === message.chatId && isWindowFocused;
```

### 2. EnhancedChatPanel (`src/components/EnhancedChatPanel.jsx`)
**Purpose**: Main chat interface with real-time messaging capabilities

**Key Features**:
- Real-time message display
- File attachments support
- Typing indicators
- Message status indicators
- Auto-scroll to new messages
- Real-time read receipt updates

### 3. Messaging API (`src/utils/messagingApi.js`)
**Purpose**: Backend API functions for chat operations

**Enhanced Functions**:
- `markMessagesAsRead()`: Real-time read receipt tracking
- `sendMessage()`: Enhanced message sending with status tracking
- `subscribeToMessages()`: Real-time message listeners
- `subscribeToUserChats()`: Real-time chat list updates

## Implementation Details

### Message Status Flow
1. **Message Sent**: `status: 'sent'`, `readBy: [senderId]`
2. **Message Delivered**: Appears in recipient's chat
3. **Message Read**: Added to `readBy` array, `readAt` timestamp recorded

### Notification Decision Tree
```
New Message Received
├── Is sender current user? ─── YES ──> No notification
├── Is user in same chat? 
    ├── YES ── Is window focused?
    │   ├── YES ──> Suppress notification ❌
    │   └── NO ──> Show notification ✅
    └── NO ──> Show notification ✅
```

### Real-time Event Listeners

#### Chat Messages
- Listens to: `chats/{chatId}/messages`
- Updates: Message list, read receipts, typing indicators

#### Chat List
- Listens to: `chats` where user is participant
- Updates: Chat list, unread counts, last messages

#### Notifications
- Listens to: Individual chat message collections
- Creates: Persistent notifications in Firestore
- Shows: Popup notifications based on user state

## Testing the System

### Development Test Component
A `TestNotificationSystem` component is available in development mode:

**Location**: Bottom-right corner of dashboard (development only)

**Features**:
1. **Test Notification**: Creates direct notification entry
2. **Test Message**: Sends actual chat message (triggers notification system)
3. **Real-time Log**: Shows system responses and errors

**Usage**:
1. Enter target user ID
2. Customize test message
3. Click "Test Message" to trigger notification system
4. Verify notifications appear/suppress correctly

### Manual Testing Scenarios

#### Scenario 1: Active Chat Notification Suppression
1. User A opens chat with User B
2. User B sends message while User A is active in chat with window focused
3. **Expected**: No popup notification appears for User A
4. **Expected**: Message appears instantly in chat

#### Scenario 2: Inactive Chat Notifications
1. User A is in dashboard (not in chat)
2. User B sends message
3. **Expected**: Popup notification appears for User A
4. **Expected**: Click notification navigates to chat

#### Scenario 3: Window Focus Detection
1. User A is in chat with User B
2. User A switches to another application (window loses focus)
3. User B sends message
4. **Expected**: Popup notification appears despite being in same chat

#### Scenario 4: Real-time Read Receipts
1. User A sends message to User B
2. User B opens and views the message
3. **Expected**: User A sees message status change to "read" (blue checkmarks)

## Database Schema

### Messages Collection
```javascript
// chats/{chatId}/messages/{messageId}
{
  senderId: "userId",
  text: "message content",
  createdAt: timestamp,
  readBy: ["senderId", "recipientId"], // Array of users who read
  readAt: {
    senderId: timestamp,
    recipientId: timestamp
  },
  status: "sent|delivered|read",
  attachments: [...], // Optional file attachments
  messageType: "text|file"
}
```

### Notifications Collection
```javascript
// notifications/{notificationId}
{
  userId: "targetUserId",
  type: "message",
  text: "notification content",
  chatId: "chatId",
  messageId: "messageId",
  senderId: "senderUserId",
  senderName: "Sender Name",
  senderPhotoUrl: "url", // Optional
  createdAt: timestamp,
  read: false
}
```

### Chats Collection
```javascript
// chats/{chatId}
{
  participants: ["userId1", "userId2"],
  lastMessage: "preview text",
  lastMessageAt: timestamp,
  lastReadBy: {
    userId1: timestamp,
    userId2: timestamp
  },
  isActive: true,
  messageCount: number
}
```

## Performance Optimizations

### 1. Efficient Message Processing
- Only processes messages from last 5 seconds (prevents old message notifications)
- Batches read receipt updates
- Cleans up processed message cache every 5 minutes

### 2. Smart Listener Management
- Single listener per chat (prevents duplicate listeners)
- Automatic cleanup on user changes
- Optimized Firestore queries with limits

### 3. Duplicate Prevention
- Message processing queue to prevent concurrent processing
- Unique message identifiers with timestamp checking
- Chat-level duplicate prevention with time windows

## Troubleshooting

### Common Issues

#### Notifications Not Appearing
1. Check browser notifications permission
2. Verify user is logged in
3. Check console for Firebase errors
4. Ensure target user ID exists

#### Notifications Not Suppressing
1. Check if `activeChatId` prop is passed correctly
2. Verify window focus detection is working
3. Check console logs for notification decision logic

#### Messages Not Appearing Real-time
1. Check Firebase connection
2. Verify message listeners are active
3. Check Firestore security rules
4. Ensure message structure matches schema

### Debug Console Logs
The system provides detailed console logging:

```javascript
// Notification decision logging
console.log('Notification decision logic:', {
  activeChatId,
  messageChatId,
  isWindowFocused,
  shouldSuppressNotification,
  willShowNotification
});

// Read receipt logging
console.log('✅ Marked X messages as read in chat Y');

// Window focus logging
console.log('Window focused - notifications may be suppressed for active chat');
```

## Security Considerations

### Firestore Security Rules
Ensure proper security rules are configured:

```javascript
// Messages - users can only read/write to chats they participate in
match /chats/{chatId}/messages/{messageId} {
  allow read, write: if request.auth != null && 
    request.auth.uid in resource.data.participants;
}

// Notifications - users can only read their own notifications
match /notifications/{notificationId} {
  allow read: if request.auth != null && 
    request.auth.uid == resource.data.userId;
  allow write: if request.auth != null;
}
```

## Future Enhancements

### Planned Features
1. **Message Reactions**: Emoji reactions to messages
2. **Message Threading**: Reply to specific messages
3. **Voice Messages**: Audio message support
4. **Message Editing**: Edit sent messages
5. **Message Deletion**: Delete messages for everyone
6. **Push Notifications**: Native mobile push notifications
7. **Message Search**: Search within chat history
8. **Media Gallery**: Browse shared images/files

### Performance Improvements
1. **Message Pagination**: Load messages in chunks
2. **Virtual Scrolling**: Handle large chat histories
3. **Offline Support**: Cache messages for offline viewing
4. **Message Compression**: Optimize large message payloads

## Integration Guide

### Adding to New Components
1. Import `NotificationManager` and `EnhancedChatPanel`
2. Set up state management for `activeChatId`
3. Pass navigation handler to `NotificationManager`
4. Ensure proper cleanup on component unmount

### Custom Notification Types
1. Extend `NotificationManager` to handle new types
2. Add type-specific rendering logic
3. Update database schema for new fields
4. Implement type-specific navigation logic

This messaging system provides a robust, WhatsApp-like experience with intelligent notification management and real-time updates. The architecture is designed for scalability and can handle thousands of concurrent users with proper Firebase configuration.