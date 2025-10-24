# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Firebase Operations
```bash
# Deploy Firebase rules and configuration
firebase deploy --only firestore:rules,storage

# Deploy all Firebase services
firebase deploy

# Login to Firebase CLI
firebase login
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 + Vite + React Router
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Styling**: CSS modules + inline styles
- **State Management**: React hooks (useState, useEffect)

### Core Structure

#### Authentication & User Roles
- **Two-tier authentication**: Firebase Auth + Firestore user profiles
- **User roles**: `client` and `freelancer` stored in `users/{uid}.userType`
- **Protected routes** via `ProtectedRoute.jsx` component
- **Role-specific dashboards**: Different interfaces for clients vs freelancers

#### Database Architecture (Firestore)
```
users/{uid}
  - userType: 'client' | 'freelancer'
  - profile data

jobs/{jobId}
  - clientId, title, description, budget, category
  - status: 'Open' | 'Closed'

proposals/{proposalId}
  - freelancerId, clientId, jobId
  - amount, message, status
  - approvedAt, rejectedAt timestamps

projects/{projectId}
  - clientId, freelancerId
  - status: 'Active' | 'Completed'
  - segments/{segmentId} (subcollection)
    - title, description, files, status
  - completions/{completionId} (subcollection)

chats/{chatId}
  - participants: [userId1, userId2]
  - messages/{messageId} (subcollection)
    - senderId, text, attachments, timestamp

notifications/{notificationId}
  - userId, type, text, read status
```

#### Key Components Architecture

**Dashboard Pattern**: Both `ClientDashboard.jsx` and `FreelancerDashboard.jsx` follow identical patterns:
- View-based navigation (Dashboard, Projects, Messages, etc.)
- Shared component structure with role-specific content
- Real-time data subscriptions using Firestore listeners

**Messaging System**: `EnhancedChatPanel.jsx` provides:
- Real-time chat with file attachments
- User presence indicators
- Connection management between clients and freelancers
- File upload with type validation and size limits

**Project Management**: 
- Segments-based project breakdown (freelancers submit work in segments)
- Client approval workflow for segments
- File attachments for deliverables
- Project completion requests and approvals

### Security Rules Pattern
Firestore security uses helper functions for common patterns:
```javascript
function isOwner(userId) { return request.auth.uid == userId; }
function isClient(uid) { return userDoc(uid).data.userType == 'client'; }
function isFreelancer(uid) { return userDoc(uid).data.userType == 'freelancer'; }
```

### File Upload System
- Uses `utils/messagingApi.js` for file operations
- 10MB file size limit
- Supports: images, documents, spreadsheets, presentations, archives, code files
- Firebase Storage with proper authentication

### Real-time Features
- **Firestore listeners** for live updates on projects, messages, proposals
- **Presence system** for online status
- **Notification system** with real-time updates
- **Typing indicators** in chat

## Key Development Patterns

### Error Handling
- Comprehensive error logging with specific Firebase error codes
- User-friendly error messages for different scenarios
- Loading states with visual feedback
- Fallback queries when collection group queries fail

### State Management
- Local component state with React hooks
- Firebase auth state management in `App.jsx`
- Real-time subscriptions cleaned up in useEffect returns

### Form Handling
- Controlled inputs with validation
- Loading states during submissions
- Success/error feedback with emojis and clear messaging

### Responsive Design
- CSS Grid layouts for dashboards
- Mobile-responsive navigation
- Flexible card-based interfaces

## Firebase Configuration
- Project ID: `flexwrk-10612`
- Region: `asia-south1` 
- Storage bucket: Custom CORS configuration in `storage.cors.json`

## Testing Notes
- See `FILE_UPLOAD_TEST_GUIDE.md` for file upload testing procedures
- See `PROPOSAL_APPROVAL_FIX.md` for proposal workflow testing
- Use browser console for debugging Firebase operations (detailed logging enabled)

## Code Style
- ES6+ modules with imports/exports
- Functional components with hooks
- Inline SVG icons as React components
- Consistent error handling patterns
- Firestore security rules with helper functions