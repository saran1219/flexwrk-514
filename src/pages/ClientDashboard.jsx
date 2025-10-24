import React, { useState, useEffect } from 'react';
import EnhancedChatPanel from '../components/EnhancedChatPanel.jsx';
import NotificationManager from '../components/NotificationManager.jsx';
import DashboardStats from '../components/DashboardStats.jsx';
import QuickActions from '../components/QuickActions.jsx';
import ActivityFeed from '../components/ActivityFeed.jsx';
import { useNavigate } from 'react-router-dom';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth, db, storage } from '../firebase.js';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, onSnapshot, query, where, updateDoc, orderBy, getDocs, collectionGroup, limit, writeBatch } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';

// --- SVG Icon Components ---
const FlexwrkLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg">
         <defs>
            <linearGradient id="gradBlue" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#1e3a8a" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
            <linearGradient id="gradGreen" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#22c55e" /></linearGradient>
            <linearGradient id="gradCyan" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient>
        </defs>
        <path d="M15 10 C 25 50, 35 50, 45 10 L 40 70 L 20 70 Z" fill="url(#gradBlue)" />
        <path d="M75 10 C 65 50, 55 50, 45 10 L 50 70 L 70 70 Z" fill="url(#gradGreen)" opacity="0.9" />
        <path d="M40 40 L 60 10 L 80 40 L 60 70 Z" fill="url(#gradCyan)" opacity="0.8" />
    </svg>
);
const DashboardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const PostJobIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>;
const BrowseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ProposalsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;
const ProjectsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
const LogoutIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const MessageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const ProfileIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const SendIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>;
const FileIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;
const VideoIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const CodeIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
const PenToolIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path></svg>;
const ImageIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const ScissorsIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>;
const MusicIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;
const MegaphoneIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>;
const HeadphoneIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2z"></path><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SettingsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const EyeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

// --- Mock Data ---
const clientData = {
    name: '',
    avatar: '',
    company: '',
    email: '',
    activeProjects: [],
    postedJobs: [],
    freelancers: [],
    proposals: [],
    messages: []
};
// --- Utility Functions ---
const getDefaultAvatar = (name = 'User') => {
    const cleanName = name.trim() || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&size=200&background=3B82F6&color=fff&bold=true`;
};

const jobCategories = [
    { name: 'Design & Creative', icon: <PenToolIcon /> },
    { name: 'Video & Animation', icon: <VideoIcon /> },
    { name: 'Web & Software Dev', icon: <CodeIcon /> },
    { name: 'Writing & Translation', icon: <ImageIcon /> },
    { name: 'Crafting & DIY', icon: <ScissorsIcon /> },
    { name: 'Music & Audio', icon: <MusicIcon /> },
    { name: 'Marketing & Sales', icon: <MegaphoneIcon /> },
    { name: 'Admin & Support', icon: <HeadphoneIcon /> },
];

// --- Helpers ---
const RecentSegmentsList = ({ styles }) => {
    const [items, setItems] = useState([]);
    const [blocked, setBlocked] = useState(false);
    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        // collectionGroup query requires segment docs to include clientId (we add it when freelancer creates)
        const qPrimary = query(collectionGroup(db, 'segments'), where('clientId','==', uid), orderBy('createdAt','desc'), limit(5));
        let unsub = onSnapshot(qPrimary, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setItems(list);
        }, (err) => {
            // If rules block collectionGroup, avoid spamming console; we'll show empty gracefully
            const isPermDenied = String(err?.code || '').includes('permission-denied');
            if (isPermDenied) { setBlocked(true); return; }
            const qFallback = query(collectionGroup(db, 'segments'), where('clientId','==', uid), limit(5));
            unsub();
            unsub = onSnapshot(qFallback, (snap2) => {
                const list = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
                list.sort((a,b) => (b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
                setItems(list);
            }, () => setBlocked(true));
        });
        return () => unsub && unsub();
    }, []);
    if (blocked || !items || items.length === 0) return <p style={{color:'#558B2F'}}>No recent segments.</p>;
    return (
        <div>
            {items.map((s) => (
                <div key={s.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #E8F5E9' }}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <strong>{s.title || 'Segment'}</strong>
                        <span style={{color:'#558B2F'}}>{s.status}</span>
                    </div>
                    <div style={{color:'#558B2F'}}>{s.projectTitle || ''}</div>
                </div>
            ))}
        </div>
    );
};

// Notifications View Component
const NotificationsView = ({ styles, setActiveView }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        setLoading(true);

        // Load all notifications for the user
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', uid)
        );

        const unsub = onSnapshot(
            notificationsQuery,
            (snapshot) => {
                const notificationsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }));
                
                // Sort by createdAt desc
                const sortedNotifications = notificationsList
                    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
                
                setNotifications(sortedNotifications);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching all notifications:', error);
                setLoading(false);
                setNotifications([]);
            }
        );

        return () => unsub();
    }, []);

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const handleNotificationClick = async (notification) => {
        // Mark notification as read when clicked
        if (!notification.read) {
            try {
                await updateDoc(doc(db, 'notifications', notification.id), { read: true });
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
        
        // Navigate based on notification type
        switch (notification.type) {
            case 'message':
                if (notification.chatId) {
                    setActiveView('messages');
                }
                break;
            case 'segment_submitted':
            case 'new_segment':
            case 'segment_approved':
            case 'segment_rejected':
            case 'segment_revision_requested':
            case 'completion_requested':
            case 'project_completed':
                setActiveView('manage');
                break;
            case 'proposal_submitted':
            case 'new_proposal':
                setActiveView('proposals');
                break;
            default:
                break;
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.read);
            await Promise.all(unreadNotifications.map(n => 
                updateDoc(doc(db, 'notifications', n.id), { read: true })
            ));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    return (
        <div>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.welcomeTitle}>All Notifications</h1>
                    <p style={styles.welcomeSubtitle}>View and manage all your notifications</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button 
                        onClick={markAllAsRead}
                        style={{
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        ✓ Mark All Read
                    </button>
                )}
            </header>
            
            <div style={styles.card('0.3s')}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                        <p>Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.6 }}>🔔</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No notifications yet</h3>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>When you receive notifications, they'll appear here.</p>
                    </div>
                ) : (
                    <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                        {notifications.map((notification, index) => (
                            <div 
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    marginBottom: index < notifications.length - 1 ? '1rem' : '0',
                                    cursor: ['message', 'segment_submitted', 'new_segment', 'segment_approved', 'segment_rejected', 'segment_revision_requested', 'completion_requested', 'project_completed', 'proposal_submitted', 'new_proposal'].includes(notification.type) ? 'pointer' : 'default',
                                    transition: 'all 0.3s ease',
                                    background: !notification.read ? 
                                        'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' : 
                                        '#FAFBFC',
                                    border: !notification.read ? 
                                        '1px solid #FCD34D' : 
                                        '1px solid #F1F5F9',
                                    borderLeft: !notification.read ? 
                                        '4px solid #F59E0B' : 
                                        '4px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    if (['message', 'segment_submitted', 'new_segment', 'segment_approved', 'segment_rejected', 'segment_revision_requested', 'completion_requested', 'project_completed', 'proposal_submitted', 'new_proposal'].includes(notification.type)) {
                                        e.currentTarget.style.transform = 'translateX(5px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (['message', 'segment_submitted', 'new_segment', 'segment_approved', 'segment_rejected', 'segment_revision_requested', 'completion_requested', 'project_completed', 'proposal_submitted', 'new_proposal'].includes(notification.type)) {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {/* Notification Icon */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: notification.type === 'message' ? 
                                        'linear-gradient(135deg, #3B82F6, #1E40AF)' : 
                                        'linear-gradient(135deg, #10B981, #059669)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    flexShrink: 0
                                }}>
                                    {notification.type === 'message' ? '💬' : '🔔'}
                                </div>
                                
                                {/* Notification Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: '0 0 0.25rem 0',
                                        color: '#374151',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        lineHeight: '1.4'
                                    }}>
                                        {notification.text}
                                    </p>
                                    {notification.senderName && (
                                        <p style={{
                                            margin: 0,
                                            color: '#64748B',
                                            fontSize: '0.85rem'
                                        }}>
                                            From: {notification.senderName}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Time and Status */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '0.5rem',
                                    flexShrink: 0
                                }}>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: '#9CA3AF',
                                        fontWeight: '500'
                                    }}>
                                        {formatTimeAgo(notification.createdAt)}
                                    </span>
                                    {!notification.read && (
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            background: '#F59E0B',
                                            borderRadius: '50%',
                                            animation: 'pulse 2s infinite'
                                        }}></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- View Components ---
const ClientDashboardView = ({ styles, setActiveView }) => {
    const [activeProjects, setActiveProjects] = useState([]);
    const [completedProjects, setCompletedProjects] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [openJobs, setOpenJobs] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [profile, setProfile] = useState({ name: '', avatar: '' });
    const [projectSegments, setProjectSegments] = useState({});

    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        
        // Get user profile and rating
        getDoc(doc(db, 'users', uid)).then(snap => {
            if (snap.exists()) {
                const data = snap.data();
                const userName = data.name || 'Client';
                setProfile({
                    name: userName,
                    avatar: data.photoUrl || getDefaultAvatar(userName)
                });
                
                // Client stats without rating system
            }
        });
        
        // Projects listener
        const projectsQuery = query(collection(db, 'projects'), where('clientId','==', uid));
        const unsubProjects = onSnapshot(projectsQuery,
            (snap) => {
                const allProjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const active = allProjects.filter(p => p.status === 'Active');
                const completed = allProjects.filter(p => p.status === 'Completed');
                
                setActiveProjects(active);
                setCompletedProjects(completed);
                
                // Calculate total spent
                const spent = completed.reduce((sum, project) => sum + (Number(project.budget) || 0), 0);
                setTotalSpent(spent);
                
                // Update dashboard stats (preserve existing stats like rating)
                setDashboardStats(prev => ({
                    ...prev,
                    activeProjects: active.length,
                    completedProjects: completed.length,
                    totalInvested: spent
                }));
                
                // Generate recent activities from projects
                const activities = [
                    ...active.slice(0, 2).map(project => ({
                        id: `project-${project.id}`,
                        type: 'project',
                        title: `Project Update: ${project.title}`,
                        description: `Working with ${project.freelancerName || 'freelancer'} on this project.`,
                        createdAt: project.updatedAt || project.createdAt,
                        status: 'In Progress'
                    })),
                    ...completed.slice(0, 2).map(project => ({
                        id: `completed-${project.id}`,
                        type: 'complete',
                        title: `Project Completed: ${project.title}`,
                        description: `Successfully completed with ${project.freelancerName || 'freelancer'}.`,
                        createdAt: project.completedAt || project.updatedAt,
                        amount: project.budget
                    }))
                ].sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
                
                setRecentActivities(activities);
            },
            (err) => console.error('Client dashboard projects query failed:', err)
        );
        
        // Jobs listener
        const jobsQuery = query(collection(db, 'jobs'), where('clientId', '==', uid), where('status', '==', 'Open'));
        const unsubJobs = onSnapshot(jobsQuery, (snap) => {
            const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setOpenJobs(jobs);
            
            // Add job activities
            const jobActivities = jobs.slice(0, 2).map(job => ({
                id: `job-${job.id}`,
                type: 'job',
                title: `Job Posted: ${job.title}`,
                description: `Looking for freelancers in ${job.category || 'various categories'}.`,
                createdAt: job.createdAt,
                amount: job.budget
            }));
            
            setRecentActivities(prev => {
                const filtered = prev.filter(a => !a.id.startsWith('job-'));
                return [...jobActivities, ...filtered].slice(0, 10);
            });
        });
        
        // Proposals listener
        const proposalsQuery = query(collection(db, 'proposals'), where('clientId', '==', uid));
        const unsubProposals = onSnapshot(proposalsQuery, (snap) => {
            const proposalsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setProposals(proposalsList);
            
            // Update stats with proposals
            setDashboardStats(prev => ({
                ...prev,
                totalProposals: proposalsList.length,
                openJobs: openJobs.length
            }));
            
            // Add proposal activities
            const proposalActivities = proposalsList.slice(0, 3).map(proposal => ({
                id: `proposal-${proposal.id}`,
                type: 'proposal',
                title: `New Proposal Received`,
                description: `${proposal.freelancerName} submitted a proposal for your job.`,
                createdAt: proposal.createdAt,
                amount: proposal.proposedBudget
            }));
            
            setRecentActivities(prev => {
                const filtered = prev.filter(a => !a.id.startsWith('proposal-'));
                return [...proposalActivities, ...filtered].slice(0, 10);
            });
        });
        
        return () => {
            unsubProjects();
            unsubJobs();
            unsubProposals();
        };
    }, []);

    // Load recent notifications
    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        setNotificationsLoading(true);

        // Simple query without orderBy to avoid index requirement
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', uid)
        );

        const unsub = onSnapshot(
            notificationsQuery,
            (snapshot) => {
                const notificationsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }));
                
                // Sort by createdAt desc and limit to 5 on client side
                const sortedNotifications = notificationsList
                    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
                    .slice(0, 5);
                
                setNotifications(sortedNotifications);
                setNotificationsLoading(false);
            },
            (error) => {
                console.error('Error fetching dashboard notifications:', error);
                setNotificationsLoading(false);
                setNotifications([]);
            }
        );

        return () => unsub();
    }, []);

    // Fetch segments for all active projects to calculate progress
    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid || activeProjects.length === 0) {
            setProjectSegments({});
            return;
        }

        const unsubscribers = [];
        
        activeProjects.forEach(project => {
            const segmentsQuery = query(collection(db, 'projects', project.id, 'segments'));
            const unsub = onSnapshot(
                segmentsQuery,
                (snap) => {
                    const segments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setProjectSegments(prev => ({
                        ...prev,
                        [project.id]: segments
                    }));
                },
                (err) => {
                    console.error(`Failed to fetch segments for project ${project.id}:`, err);
                    setProjectSegments(prev => ({
                        ...prev,
                        [project.id]: []
                    }));
                }
            );
            unsubscribers.push(unsub);
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [activeProjects]);

    // Calculate progress based on approved segments (milestone-based)
    const calculateProgress = (projectId) => {
        const project = activeProjects.find(p => p.id === projectId);
        const segments = projectSegments[projectId] || [];
        
        // Use totalSegments from project if available, otherwise fall back to submitted segments count
        const totalMilestones = project?.totalSegments || (segments.length > 0 ? segments.length : 1);
        const approvedCount = segments.filter(s => s.status === 'approved').length;
        
        // Cap at 100%
        return Math.min(Math.round((approvedCount / totalMilestones) * 100), 100);
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const handleNotificationClick = async (notification) => {
        console.log('Client notification clicked:', notification);
        console.log('Notification type:', notification.type);
        
        // Mark notification as read when clicked
        if (!notification.read) {
            try {
                await updateDoc(doc(db, 'notifications', notification.id), { read: true });
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
        
        // Navigate based on notification type
        switch (notification.type) {
            case 'message':
                if (notification.chatId) {
                    console.log('Navigating to messages');
                    setActiveView('messages');
                }
                break;
            case 'segment_submitted':
            case 'new_segment':
            case 'segment_approved':
            case 'segment_rejected':
            case 'segment_revision_requested':
            case 'completion_requested':
            case 'project_completed':
                console.log('Navigating to manage projects');
                setActiveView('manage');
                break;
            case 'proposal_submitted':
            case 'new_proposal':
                console.log('Navigating to proposals');
                setActiveView('proposals');
                break;
            default:
                console.log('Unknown client notification type:', notification.type);
                break;
        }
    };
    
    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.read);
            const batch = writeBatch(db);
            
            unreadNotifications.forEach(notification => {
                const notifRef = doc(db, 'notifications', notification.id);
                batch.update(notifRef, { read: true });
            });
            
            await batch.commit();
            console.log('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    // Quick actions configuration
    const quickActions = [
        {
            icon: '📝',
            title: 'Post a Job',
            description: 'Find talented freelancers for your next project',
            onClick: () => setActiveView('post-job'),
            color: '#3b82f6'
        },
        {
            icon: '👥',
            title: 'Browse Freelancers',
            description: 'Discover skilled professionals in various fields',
            onClick: () => setActiveView('browse'),
            color: '#10b981'
        },
        {
            icon: '📊',
            title: 'View Proposals',
            description: 'Review and manage incoming proposals',
            onClick: () => setActiveView('proposals'),
            color: '#f59e0b'
        },
        {
            icon: '💼',
            title: 'Manage Projects',
            description: 'Track progress and communicate with freelancers',
            onClick: () => setActiveView('manage'),
            color: '#8b5cf6'
        },
        {
            icon: '💬',
            title: 'Messages',
            description: 'Chat with freelancers and manage communications',
            onClick: () => setActiveView('messages'),
            color: '#ef4444'
        },
        {
            icon: '👤',
            title: 'Profile Settings',
            description: 'Update your profile and account preferences',
            onClick: () => setActiveView('profile'),
            color: '#06b6d4'
        }
    ];

    return (
    <div style={{ padding: '2.5rem', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
        {/* Clean Professional Header */}
        <header style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <img 
                        src={profile.avatar || 'https://via.placeholder.com/80'} 
                        alt={profile.name}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '3px solid #E2E8F0',
                            objectFit: 'cover'
                        }}
                    />
                    <div>
                        <h1 style={{
                            color: '#1E293B',
                            fontSize: '1.75rem',
                            margin: '0 0 0.25rem 0',
                            fontWeight: '600',
                            letterSpacing: '-0.01em'
                        }}>Welcome back, {profile.name}!</h1>
                        <p style={{
                            color: '#64748B',
                            fontSize: '0.95rem',
                            margin: 0
                        }}>Ready to build something amazing? Let's find the perfect talent for your vision.</p>
                    </div>
                </div>
                <button 
                    style={{
                        background: '#3B82F6',
                        border: 'none',
                        color: 'white',
                        padding:'0.75rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                    onClick={() => setActiveView('post-job')}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#2563EB';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#3B82F6';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }}
                >
                    Post Your Next Job
                </button>
            </div>
        </header>
        
        {/* Main Content Grid - Active Projects (Left) and Notifications (Right) */}
        <div style={{
            ...styles.mainGrid,
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            alignItems: 'start',
            marginBottom: '2rem'
        }}>
            {/* Active Projects Card - LEFT */}
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                minHeight: '300px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <span style={{ fontSize: '1.5rem' }}>🚀</span>
                        Active Projects
                    </h3>
                    <button 
                        onClick={() => setActiveView('manage')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#3B82F6',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                        View All →
                    </button>
                </div>
                
                {activeProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📋</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No Active Projects Yet</h4>
                        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>Start by posting your first job to find talented freelancers.</p>
                        <button 
                            onClick={() => setActiveView('post-job')}
                            style={{
                                ...styles.primaryButton,
                                padding: '0.7rem 1.5rem',
                                fontSize: '0.9rem'
                            }}
                        >
                            Post Your First Job
                        </button>
                    </div>
                ) : (
                    activeProjects.slice(0, 3).map(p => (
                        <div key={p.id} style={{
                            padding: '1.25rem',
                            borderRadius: '12px',
                            background: '#f8fafc',
                            marginBottom: '1rem',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            border: '1px solid #e2e8f0'
                        }}
                        onClick={() => setActiveView('manage')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                                {p.title || 'Untitled'}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                                Client: {p.clientName || 'You'}
                            </p>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                background: '#e2e8f0',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${calculateProgress(p.id)}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.5rem 0 0 0', textAlign: 'right' }}>
                                {calculateProgress(p.id)}% complete
                            </p>
                        </div>
                    ))
                )}
            </div>
            
            {/* Notifications Card - RIGHT */}
            <div style={{...styles.card('0.3s')}}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={styles.cardTitle}>Notifications</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {notifications.some(n => !n.read) && (
                            <button 
                                onClick={markAllAsRead}
                                style={{
                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                ✓ Mark All Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button 
                                onClick={() => setActiveView('notifications')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#3B82F6',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                View All
                            </button>
                        )}
                    </div>
                </div>
                
                {notificationsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                        <p>Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.6 }}>🔔</div>
                        <p style={{ margin: 0, fontWeight: '500', color: '#6B7280' }}>No new notifications</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>You're all caught up!</p>
                    </div>
                ) : (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {notifications.map((notification, index) => (
                            <div 
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    marginBottom: index < notifications.length - 1 ? '0.75rem' : '0',
                                    cursor: ['message', 'segment_submitted', 'new_segment', 'segment_approved', 'segment_rejected', 'segment_revision_requested', 'completion_requested', 'project_completed', 'proposal_submitted', 'new_proposal'].includes(notification.type) ? 'pointer' : 'default',
                                    transition: 'all 0.3s ease',
                                    background: !notification.read ? 
                                        'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' : 
                                        '#FAFBFC',
                                    border: !notification.read ? 
                                        '1px solid #FCD34D' : 
                                        '1px solid #F1F5F9',
                                    borderLeft: !notification.read ? 
                                        '4px solid #F59E0B' : 
                                        '4px solid transparent',
                                    opacity: 0,
                                    animation: `fade-slide-up 0.5s ease ${index * 0.1}s forwards`
                                }}
                                onMouseEnter={(e) => {
                                    if (['message', 'segment_submitted', 'new_segment', 'segment_approved', 'segment_rejected', 'segment_revision_requested', 'completion_requested', 'project_completed', 'proposal_submitted', 'new_proposal'].includes(notification.type)) {
                                        e.currentTarget.style.transform = 'translateX(3px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (['message', 'segment_submitted', 'new_segment', 'segment_approved', 'segment_rejected', 'segment_revision_requested', 'completion_requested', 'project_completed', 'proposal_submitted', 'new_proposal'].includes(notification.type)) {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {/* Notification Icon */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: notification.type === 'message' ? 
                                        'linear-gradient(135deg, #3B82F6, #1E40AF)' : 
                                        'linear-gradient(135deg, #10B981, #059669)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    flexShrink: 0
                                }}>
                                    {notification.type === 'message' ? '💬' : '🔔'}
                                </div>
                                
                                {/* Notification Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {notification.type === 'message' ? (
                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {notification.senderPhotoUrl && (
                                                    <img 
                                                        src={notification.senderPhotoUrl}
                                                        alt={notification.senderName || 'User'}
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                )}
                                                <span style={{
                                                    fontWeight: '600',
                                                    color: '#0F172A',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {notification.senderName || 'Someone'}
                                                </span>
                                            </div>
                                            <p style={{
                                                margin: 0,
                                                color: '#64748B',
                                                fontSize: '0.85rem',
                                                lineHeight: '1.4',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                '-webkit-line-clamp': 2,
                                                '-webkit-box-orient': 'vertical'
                                            }}>
                                                {notification.text}
                                            </p>
                                        </div>
                                    ) : (
                                        <p style={{
                                            margin: 0,
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.4'
                                        }}>
                                            {notification.text}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Time and Status */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '0.25rem',
                                    flexShrink: 0
                                }}>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: '#9CA3AF',
                                        fontWeight: '500'
                                    }}>
                                        {formatTimeAgo(notification.createdAt)}
                                    </span>
                                    {!notification.read && (
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            background: '#3B82F6',
                                            borderRadius: '50%',
                                            animation: 'pulse 2s infinite'
                                        }}></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        
        {/* Dashboard Statistics - After Active Projects and Notifications */}
        <DashboardStats stats={dashboardStats} userType="client" />
        
        {/* Additional Content Section */}
        <div style={{
            ...styles.mainGrid,
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            alignItems: 'start'
        }}>
        <div style={{ ...styles.card('0.7s'), minHeight: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ ...styles.cardTitle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>💼</span>
                        Open Job Postings
                    </h3>
                    <button 
                        onClick={() => setActiveView('post-job')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#3B82F6',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                        Post New Job →
                    </button>
                </div>
                
                {openJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📢</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No Open Jobs</h4>
                        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>Post a job to start receiving proposals from talented freelancers.</p>
                        <button 
                            onClick={() => setActiveView('post-job')}
                            style={{
                                ...styles.primaryButton,
                                padding: '0.7rem 1.5rem',
                                fontSize: '0.9rem'
                            }}
                        >
                            Post a Job
                        </button>
                    </div>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {openJobs.slice(0, 3).map((job, index) => (
                            <div 
                                key={job.id} 
                                style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    marginBottom: '1rem',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    animation: `slideInUp 0.5s ease ${index * 0.1}s forwards`,
                                    opacity: 0
                                }}
                                onClick={() => setActiveView('proposals')}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                                    e.target.style.borderColor = '#3B82F6';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.borderColor = '#e2e8f0';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            margin: '0 0 0.5rem 0'
                                        }}>{job.title}</h4>
                                        <p style={{
                                            color: '#6b7280',
                                            fontSize: '0.9rem',
                                            margin: '0 0 0.75rem 0',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            '-webkit-line-clamp': 2,
                                            '-webkit-box-orient': 'vertical'
                                        }}>{job.description}</p>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            {job.budget && (
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    color: '#059669',
                                                    background: '#d1fae5',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    ${Number(job.budget).toLocaleString()}
                                                </span>
                                            )}
                                            <span style={{
                                                fontSize: '0.8rem',
                                                color: '#3B82F6',
                                                background: '#dbeafe',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontWeight: '500'
                                            }}>
                                                Open
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #10B981, #059669)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}>
                                        📝
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

const PostJobView = ({ styles, showDialog }) => {
    const [selectedCategory, setSelectedCategory] = useState('Design & Creative');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState('');
    const [budget, setBudget] = useState('');
    const [timeline, setTimeline] = useState('');
    const [totalSegments, setTotalSegments] = useState('5');
    const [posting, setPosting] = useState(false);

    const postJob = async () => {
        if (!title.trim()) { showDialog('warning', 'Missing title', 'Please provide a project title.'); return; }
        setPosting(true);
        try {
            const uid = auth.currentUser?.uid;
            let clientName = '';
            const u = await getDoc(doc(db, 'users', uid));
            if (u.exists()) clientName = u.data().name || '';
            await addDoc(collection(db, 'jobs'), {
                title: title.trim(),
                description: description.trim(),
                category: selectedCategory,
                skills: skills.split(',').map(s=>s.trim()).filter(Boolean),
                budget: Number(budget)||null,
                timeline: timeline.trim(),
                totalSegments: Number(totalSegments) || 5,
                status: 'Open',
                clientId: uid,
                clientName,
                createdAt: serverTimestamp(),
            });
            setTitle(''); setDescription(''); setSkills(''); setBudget(''); setTimeline(''); setTotalSegments('5');
            showDialog('success', 'Job posted', 'It will now appear in freelancers\' Find Jobs.');
        } finally {
            setPosting(false);
        }
    };

    return(
        <div>
            <header style={styles.header}><h1 style={styles.welcomeTitle}>Create a New Job Posting</h1></header>
            <div style={styles.postJobContainer}>
                <div className="form-section" style={{animationDelay: '0.2s'}}>
                    <h3 style={styles.cardTitle}>1. What's the title of your project?</h3>
                    <input style={styles.input} placeholder="e.g., Video Editor for YouTube Channel" value={title} onChange={(e)=>setTitle(e.target.value)} />
                </div>

                <div className="form-section" style={{animationDelay: '0.3s'}}>
                    <h3 style={styles.cardTitle}>2. Choose a category</h3>
                    <div style={styles.categoryGrid}>
                        {jobCategories.map(cat => (
                            <div key={cat.name} style={styles.categoryCard(cat.name === selectedCategory)} className="category-card-hover" onClick={() => setSelectedCategory(cat.name)}>
                                {cat.icon}
                                <span>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-section" style={{animationDelay: '0.4s'}}>
                    <h3 style={styles.cardTitle}>3. Describe the work</h3>
                    <textarea style={styles.textarea} rows="6" placeholder="Provide a detailed description of the deliverables, timeline, and expectations..." value={description} onChange={(e)=>setDescription(e.target.value)}></textarea>
                </div>
                
                <div className="form-section" style={{animationDelay: '0.5s'}}>
                     <h3 style={styles.cardTitle}>4. What skills are required?</h3>
                     <input style={styles.input} placeholder="e.g., Figma, Webflow, UI Design (comma-separated)" value={skills} onChange={(e)=>setSkills(e.target.value)} />
                </div>

                <div className="form-section" style={{animationDelay: '0.6s'}}>
                    <h3 style={styles.cardTitle}>5. Set your budget and milestones</h3>
                    <div style={styles.formGrid}>
                        <div className="form-row"><label style={styles.formLabel}>Project Budget ($)</label><input type="number" style={styles.input} placeholder="e.g., 2500" value={budget} onChange={(e)=>setBudget(e.target.value)} /></div>
                        <div className="form-row"><label style={styles.formLabel}>Estimated Timeline</label><input style={styles.input} placeholder="e.g., 2-4 Weeks" value={timeline} onChange={(e)=>setTimeline(e.target.value)} /></div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <label style={styles.formLabel}>Expected Number of Milestones/Segments</label>
                        <input type="number" min="1" max="50" style={styles.input} placeholder="e.g., 5" value={totalSegments} onChange={(e)=>setTotalSegments(e.target.value)} />
                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.5rem' }}>💡 This helps track project progress. Freelancers will submit work in segments.</p>
                    </div>
                </div>
                
                 <div className="form-section" style={{animationDelay: '0.7s', textAlign: 'right'}}>
                    <button style={styles.primaryButton} onClick={postJob} disabled={posting}>{posting ? 'Posting...' : 'Post Job'}</button>
                </div>
            </div>
        </div>
    );
};

const FreelancerProfileModal = ({ freelancer, onClose, styles, setActiveView }) => {
    const [modalView, setModalView] = useState('details');

    const handleHire = () => {
        setActiveView('manage');
        onClose();
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={{...styles.modalContent, width: '90%', maxWidth: '700px'}} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={styles.modalCloseButton}><XIcon /></button>
                
                {modalView === 'details' && (
                    <div className="modal-view">
                        <div style={{textAlign: 'center', borderBottom: '1px solid #E8F5E9', paddingBottom: '1.5rem', marginBottom: '1.5rem'}}>
                            <img src={freelancer.photoUrl || 'https://via.placeholder.com/120'} alt={freelancer.name} style={{...styles.freelancerAvatar, width: '120px', height: '120px'}}/>
                            <h2 style={{...styles.modalTitle, margin: 0}}>{freelancer.name}</h2>
                            <p style={{color: '#558B2F', fontSize: '1rem', marginTop: '0.5rem'}}>
                                📍 {freelancer.location || 'Remote'} • 💰 {freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : 'Rate negotiable'}
                            </p>
                        </div>
                        <p style={{color: '#33691E', marginBottom: '1.5rem', lineHeight: 1.7}}>{freelancer.bio}</p>
                        <h3 style={styles.cardTitle}>Skills</h3>
                        <div style={{...styles.tagContainer, marginBottom: '2rem'}}>
                            {freelancer.skills.map(skill => <span key={skill} style={styles.tag}>{skill}</span>)}
                        </div>
                        <button style={{...styles.primaryButton, width: '100%'}} onClick={() => setModalView('composeInvite')}>Hire {freelancer.name}</button>
                    </div>
                )}

                {modalView === 'composeInvite' && (
                    <div className="modal-view">
                        <h2 style={styles.modalTitle}>Send Project Invitation</h2>
                        <p style={{color: '#558B2F', marginBottom: '1.5rem'}}>Invite {freelancer.name} to one of your open jobs.</p>
                        <div className="form-row"><label style={styles.formLabel}>Select a Job</label><input style={styles.input} defaultValue="Video Editor for YouTube Channel"/></div>
                        <div className="form-row"><label style={styles.formLabel}>Your Message</label><textarea style={styles.textarea} rows="5" placeholder={`Hi ${freelancer.name}, I'd like to invite you to this project...`}></textarea></div>
                        <button style={{...styles.primaryButton, width: '100%', marginTop: '1rem'}} onClick={() => setModalView('inviteSent')}>Send Invitation</button>
                    </div>
                )}

                {modalView === 'inviteSent' && (
                    <div className="modal-view" style={{textAlign: 'center', padding: '2rem 0'}}>
                        <div style={{width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
                            <CheckCircleIcon color="#4CAF50" size={40}/>
                        </div>
                        <h2 style={styles.modalTitle}>Invitation Sent!</h2>
                        <p style={{color: '#558B2F', marginBottom: '2rem'}}>You can now continue the conversation with {freelancer.name} in the project room.</p>
                        <button style={{...styles.primaryButton, width: '100%'}} onClick={handleHire}>Go to Project</button>
                    </div>
                )}
            </div>
        </div>
    );
};


// Enhanced Freelancer Modal with Portfolio Integration
const EnhancedFreelancerModal = ({ freelancer, portfolio, onClose, styles, setActiveView }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isStartingChat, setIsStartingChat] = useState(false);

    const handleHire = () => {
        setActiveView('manage');
        onClose();
    };
    
    const handleStartMessage = async (project = null) => {
        if (isStartingChat) return;
        
        setIsStartingChat(true);
        try {
            const { startChatFromPortfolio } = await import('../utils/messagingApi.js');
            
            let message;
            if (project) {
                // Project-specific message
                message = `Hi ${freelancer.name}! I'm interested in your project "${project.title}". Could you tell me more about how you approached this work? I have a similar project in mind and would love to discuss the possibilities.`;
            } else {
                // General inquiry
                message = `Hi ${freelancer.name}! I'm interested in discussing a potential project with you. I've reviewed your portfolio and would like to learn more about your services.`;
            }
            
            // Start chat with freelancer
            const chatId = await startChatFromPortfolio(freelancer.id, {
                message,
                projectId: project?.id
            });
            
            // Switch to messages view and close modal
            setActiveView('messages');
            onClose();
            
            // Optional: Show success notification
            console.log('Chat started successfully with ID:', chatId);
        } catch (error) {
            console.error('Failed to start chat:', error);
            alert('Failed to start conversation. Please try again.');
        } finally {
            setIsStartingChat(false);
        }
    };

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}
            onClick={onClose}
        >
            <div 
                style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '1000px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    animation: 'slideInUp 0.4s ease'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    padding: '2rem',
                    color: '#FFFFFF',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background decoration */}
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '150px',
                        height: '150px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '50%'
                    }}></div>
                    
                    <button 
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '1.2rem',
                            zIndex: 10,
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        <XIcon />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 2 }}>
                        <div style={{ position: 'relative' }}>
                            <img 
                                src={freelancer.photoUrl || 'https://via.placeholder.com/120'} 
                                alt={freelancer.name}
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '4px solid rgba(255, 255, 255, 0.2)',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '5px',
                                width: '30px',
                                height: '30px',
                                background: '#10B981',
                                borderRadius: '50%',
                                border: '4px solid #FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    background: '#FFFFFF',
                                    borderRadius: '50%'
                                }}></div>
                            </div>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <h2 style={{
                                fontSize: '2.5rem',
                                fontWeight: '800',
                                margin: '0 0 0.5rem 0',
                                letterSpacing: '-0.02em'
                            }}>
                                {freelancer.name || 'Anonymous'}
                            </h2>
                            
                            {freelancer.username && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    <span style={{
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        color: '#E0E7FF',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        @{freelancer.username} ✨
                                    </span>
                                </div>
                            )}
                            
                            <div style={{
                                display: 'flex',
                                gap: '2rem',
                                fontSize: '1.1rem',
                                opacity: 0.9
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    📍 <span>{freelancer.location || 'Remote'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981' }}>
                                    💰 <span style={{ fontWeight: '600' }}>
                                        {freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : 'Rate Negotiable'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    📁 <span>{portfolio.length} Projects</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    borderBottom: '2px solid #F1F5F9',
                    background: '#FAFBFC'
                }}>
                    {[
                        { key: 'overview', label: 'Overview', icon: '👤' },
                        { key: 'portfolio', label: `Portfolio (${portfolio.length})`, icon: '💼' },
                        { key: 'skills', label: 'Skills', icon: '🎯' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                padding: '1.5rem 2rem',
                                border: 'none',
                                background: 'transparent',
                                color: activeTab === tab.key ? '#6366F1' : '#64748B',
                                fontSize: '1rem',
                                fontWeight: activeTab === tab.key ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                borderBottom: activeTab === tab.key ? '3px solid #6366F1' : '3px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab.key) {
                                    e.target.style.color = '#374151';
                                    e.target.style.background = '#F8FAFC';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab.key) {
                                    e.target.style.color = '#64748B';
                                    e.target.style.background = 'transparent';
                                }
                            }}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{
                    height: '60vh',
                    overflowY: 'auto',
                    padding: '2rem'
                }}>
                    {activeTab === 'overview' && (
                        <div>
                            {freelancer.bio ? (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{
                                        color: '#0F172A',
                                        fontSize: '1.3rem',
                                        fontWeight: '600',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        📝 About {freelancer.name?.split(' ')[0] || 'This Freelancer'}
                                    </h3>
                                    <p style={{
                                        color: '#475569',
                                        fontSize: '1.1rem',
                                        lineHeight: '1.8',
                                        backgroundColor: '#F8FAFC',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0'
                                    }}>
                                        {freelancer.bio}
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    color: '#9CA3AF'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                                    <p>No bio provided yet</p>
                                </div>
                            )}
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1.5rem',
                                marginTop: '2rem'
                            }}>
                                <div style={{
                                    background: '#F0F9FF',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #E0F2FE',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0369A1' }}>
                                        {freelancer.stats?.rating ? `${freelancer.stats.rating.toFixed(1)}/5` : 'No ratings yet'}
                                    </div>
                                    <div style={{ color: '#0369A1', fontSize: '0.9rem' }}>Rating</div>
                                </div>
                                
                                <div style={{
                                    background: '#F0FDF4',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #DCFCE7',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16A34A' }}>{portfolio.length}</div>
                                    <div style={{ color: '#16A34A', fontSize: '0.9rem' }}>Completed Projects</div>
                                </div>
                                
                                <div style={{
                                    background: '#FEF3F2',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #FECACA',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#DC2626' }}>24h</div>
                                    <div style={{ color: '#DC2626', fontSize: '0.9rem' }}>Response Time</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'portfolio' && (
                        <div>
                            {portfolio.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '4rem 2rem',
                                    color: '#6B7280',
                                    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                                    borderRadius: '20px',
                                    border: '2px dashed #E2E8F0',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Animated background elements */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-50px',
                                        left: '-50px',
                                        width: '100px',
                                        height: '100px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        borderRadius: '50%',
                                        animation: 'float 6s ease-in-out infinite'
                                    }}></div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-30px',
                                        right: '-30px',
                                        width: '80px',
                                        height: '80px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '50%',
                                        animation: 'float 4s ease-in-out infinite reverse'
                                    }}></div>
                                    
                                    <div style={{ 
                                        fontSize: '4rem', 
                                        marginBottom: '1rem',
                                        animation: 'bounce 2s ease-in-out infinite',
                                        position: 'relative',
                                        zIndex: 2
                                    }}>📂</div>
                                    <h3 style={{ 
                                        marginBottom: '1rem',
                                        fontSize: '1.5rem',
                                        color: '#374151',
                                        fontWeight: '600',
                                        position: 'relative',
                                        zIndex: 2
                                    }}>No Portfolio Projects Yet</h3>
                                    <p style={{
                                        fontSize: '1rem',
                                        lineHeight: '1.6',
                                        maxWidth: '400px',
                                        margin: '0 auto',
                                        position: 'relative',
                                        zIndex: 2
                                    }}>This freelancer hasn't uploaded any portfolio projects to showcase their completed work yet.</p>
                                </div>
                            ) : (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '2rem',
                                        padding: '1rem 0'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.4rem',
                                                fontWeight: '700',
                                                color: '#0F172A',
                                                margin: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                🏆 Completed Projects
                                            </h3>
                                            <p style={{
                                                color: '#64748B',
                                                margin: '0.25rem 0 0 0',
                                                fontSize: '0.95rem'
                                            }}>
                                                {portfolio.length} project{portfolio.length !== 1 ? 's' : ''} successfully delivered
                                            </p>
                                        </div>
                                        
                                        <div style={{
                                            background: 'linear-gradient(135deg, #10B981, #059669)',
                                            color: 'white',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            ✅ {portfolio.length} Completed
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                        gap: '2rem',
                                        marginBottom: '1rem'
                                    }}>
                                        {portfolio.map((project, idx) => (
                                            <div 
                                                key={idx} 
                                                style={{
                                                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                                                    borderRadius: '20px',
                                                    border: '2px solid #F1F5F9',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                    position: 'relative',
                                                    animation: `slideInUp 0.6s ease ${0.1 + idx * 0.1}s both`
                                                }}
                                                onClick={() => setSelectedProject(project)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                                                    e.currentTarget.style.borderColor = '#6366F1';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                                    e.currentTarget.style.borderColor = '#F1F5F9';
                                                }}
                                            >
                                                {/* Project Status Badge */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '1rem',
                                                    right: '1rem',
                                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                                    color: 'white',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    zIndex: 2,
                                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    ✅ Completed
                                                </div>
                                                
                                                <div style={{
                                                    height: '200px',
                                                    background: project.imageUrl 
                                                        ? `url(${project.imageUrl})` 
                                                        : `linear-gradient(135deg, 
                                                            ${['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'][idx % 6]}, 
                                                            ${['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'][idx % 6]}
                                                          )`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    position: 'relative',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    {/* Overlay gradient */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                                                        opacity: 0,
                                                        transition: 'opacity 0.3s ease'
                                                    }} className="project-overlay"></div>
                                                    
                                                    {!project.imageUrl && (
                                                        <div style={{
                                                            color: 'white',
                                                            fontSize: '3rem',
                                                            opacity: 0.8,
                                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                        }}>💼</div>
                                                    )}
                                                </div>
                                                
                                                <div style={{ padding: '2rem 1.5rem' }}>
                                                    <h4 style={{
                                                        color: '#0F172A',
                                                        fontSize: '1.2rem',
                                                        fontWeight: '700',
                                                        marginBottom: '0.75rem',
                                                        lineHeight: '1.3',
                                                        letterSpacing: '-0.025em'
                                                    }}>
                                                        {project.title || 'Untitled Project'}
                                                    </h4>
                                                    
                                                    <p style={{
                                                        color: '#64748B',
                                                        fontSize: '0.95rem',
                                                        lineHeight: '1.6',
                                                        marginBottom: '1.5rem',
                                                        display: '-webkit-box',
                                                        '-webkit-line-clamp': 3,
                                                        '-webkit-box-orient': 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {project.description || project.challenge || 'A successfully completed project showcasing professional expertise and quality delivery.'}
                                                    </p>
                                                    
                                                    {/* Project Meta Info */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '1.5rem',
                                                        padding: '1rem',
                                                        background: '#F8FAFC',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        <div>
                                                            <div style={{ color: '#64748B', marginBottom: '0.25rem' }}>Budget</div>
                                                            <div style={{ color: '#059669', fontWeight: '600' }}>
                                                                {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'Fixed Price'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ color: '#64748B', marginBottom: '0.25rem' }}>Duration</div>
                                                            <div style={{ color: '#0F172A', fontWeight: '600' }}>
                                                                {project.duration || '2-4 weeks'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ color: '#64748B', marginBottom: '0.25rem' }}>Client</div>
                                                            <div style={{ color: '#0F172A', fontWeight: '600' }}>
                                                                {project.clientName?.split(' ')[0] || 'Private'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Project Actions */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '1rem'
                                                    }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStartMessage(project);
                                                            }}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                                                color: '#FFFFFF',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s ease',
                                                                boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'translateY(-1px)';
                                                                e.target.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.3)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'translateY(0)';
                                                                e.target.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.2)';
                                                            }}
                                                        >
                                                            💬 Ask About This
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Technologies */}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '0.5rem'
                                                    }}>
                                                        {(project.technologies || project.skills || ['Web Development', 'Design', 'Frontend']).slice(0, 4).map((tech, techIdx) => (
                                                            <span key={techIdx} style={{
                                                                padding: '0.5rem 1rem',
                                                                background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
                                                                color: '#0369A1',
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '500',
                                                                border: '1px solid #E0F2FE',
                                                                transition: 'all 0.3s ease',
                                                                animation: `slideInUp 0.4s ease ${0.2 + techIdx * 0.1}s both`
                                                            }}>
                                                                {tech}
                                                            </span>
                                                        ))}
                                                        {(project.technologies || project.skills || []).length > 4 && (
                                                            <span style={{
                                                                padding: '0.5rem 1rem',
                                                                background: '#F3F4F6',
                                                                color: '#6B7280',
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '500',
                                                                border: '1px solid #E5E7EB'
                                                            }}>
                                                                +{(project.technologies || project.skills || []).length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div>
                            <h3 style={{
                                color: '#0F172A',
                                fontSize: '1.3rem',
                                fontWeight: '600',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                🎯 Skills & Expertise
                            </h3>
                            
                            {(!freelancer.skills || freelancer.skills.length === 0) ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    color: '#9CA3AF'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                                    <p>No skills listed yet</p>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}>
                                    {freelancer.skills.map((skill, idx) => (
                                        <div key={idx} style={{
                                            background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
                                            color: '#0369A1',
                                            padding: '1rem 1.5rem',
                                            borderRadius: '16px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            border: '2px solid #E0F2FE',
                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                                            transition: 'all 0.3s ease',
                                            cursor: 'default'
                                        }}>
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div style={{
                    borderTop: '1px solid #F1F5F9',
                    padding: '2rem',
                    background: '#FAFBFC',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        color: '#64748B',
                        fontSize: '0.9rem'
                    }}>
                        Last active: Recently
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={handleStartMessage}
                            disabled={isStartingChat}
                            style={{
                                padding: '1rem 2rem',
                                background: isStartingChat ? '#F3F4F6' : 'transparent',
                                color: isStartingChat ? '#9CA3AF' : '#6366F1',
                                border: `2px solid ${isStartingChat ? '#E5E7EB' : '#6366F1'}`,
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isStartingChat ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                if (!isStartingChat) {
                                    e.target.style.background = '#F0F9FF';
                                    e.target.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isStartingChat) {
                                    e.target.style.background = 'transparent';
                                    e.target.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {isStartingChat ? '⏳ Starting Chat...' : '💬 Send Message'}
                        </button>
                        
                        <button 
                            onClick={handleHire}
                            style={{
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                                e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                            }}
                        >
                            🚀 Hire {freelancer.name?.split(' ')[0] || 'This Freelancer'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Project Detail Modal (nested) */}
            {selectedProject && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 1001,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                    onClick={() => setSelectedProject(null)}
                >
                    <div 
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '20px',
                            maxWidth: '800px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            height: '300px',
                            background: selectedProject.imageUrl ? `url(${selectedProject.imageUrl})` : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '20px 20px 0 0',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {!selectedProject.imageUrl && (
                                <div style={{
                                    color: 'white',
                                    fontSize: '4rem',
                                    opacity: 0.7
                                }}>📁</div>
                            )}
                            
                            <button 
                                onClick={() => setSelectedProject(null)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFFFFF'
                                }}
                            >
                                <XIcon />
                            </button>
                        </div>
                        
                        <div style={{ padding: '2.5rem' }}>
                            {/* Project Header */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #10B981, #059669)',
                                        color: 'white',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '25px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                    }}>
                                        ✅ Project Completed Successfully
                                    </div>
                                    
                                    {selectedProject.projectUrl && (
                                        <a 
                                            href={selectedProject.projectUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{
                                                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                                color: 'white',
                                                padding: '0.75rem 1.5rem',
                                                borderRadius: '25px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                                            }}
                                        >
                                            🚀 View Live Project
                                        </a>
                                    )}
                                </div>
                                
                                <h3 style={{
                                    fontSize: '2.2rem',
                                    fontWeight: '800',
                                    color: '#0F172A',
                                    margin: '0 0 0.5rem 0',
                                    letterSpacing: '-0.025em',
                                    lineHeight: '1.2'
                                }}>
                                    {selectedProject.title || 'Completed Project'}
                                </h3>
                                
                                <div style={{
                                    color: '#64748B',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2rem'
                                }}>
                                    <span>💼 Portfolio Project</span>
                                    <span>📅 Delivered On Time</span>
                                    <span>⭐ Client Satisfaction: 5/5</span>
                                </div>
                            </div>
                            
                            {/* Project Sections */}
                            <div style={{ display: 'grid', gap: '2.5rem' }}>
                                {/* The Challenge */}
                                <div>
                                    <h4 style={{
                                        fontSize: '1.3rem',
                                        fontWeight: '700',
                                        color: '#0F172A',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        🎯 The Challenge
                                    </h4>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #FEF3F2 0%, #FEF2F2 100%)',
                                        padding: '2rem',
                                        borderRadius: '16px',
                                        border: '1px solid #FECACA',
                                        borderLeft: '4px solid #EF4444'
                                    }}>
                                        <p style={{
                                            color: '#1F2937',
                                            fontSize: '1rem',
                                            lineHeight: '1.7',
                                            margin: 0
                                        }}>
                                            {selectedProject.challenge || selectedProject.description || 'The client needed a professional solution that would meet their specific business requirements while ensuring excellent user experience and performance.'}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* The Solution */}
                                <div>
                                    <h4 style={{
                                        fontSize: '1.3rem',
                                        fontWeight: '700',
                                        color: '#0F172A',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        💡 The Solution
                                    </h4>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                                        padding: '2rem',
                                        borderRadius: '16px',
                                        border: '1px solid #BAE6FD',
                                        borderLeft: '4px solid #3B82F6'
                                    }}>
                                        <p style={{
                                            color: '#1F2937',
                                            fontSize: '1rem',
                                            lineHeight: '1.7',
                                            margin: 0
                                        }}>
                                            {selectedProject.solution || 'I developed a comprehensive solution using modern technologies and best practices. The project was delivered with clean code, responsive design, and optimized performance to exceed client expectations.'}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* The Results */}
                                <div>
                                    <h4 style={{
                                        fontSize: '1.3rem',
                                        fontWeight: '700',
                                        color: '#0F172A',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        🏆 The Results
                                    </h4>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
                                        padding: '2rem',
                                        borderRadius: '16px',
                                        border: '1px solid #BBF7D0',
                                        borderLeft: '4px solid #10B981'
                                    }}>
                                        <p style={{
                                            color: '#1F2937',
                                            fontSize: '1rem',
                                            lineHeight: '1.7',
                                            margin: '0 0 1rem 0'
                                        }}>
                                            {selectedProject.results || 'The project was completed successfully with exceptional results. Client was highly satisfied with the quality, timeline, and overall deliverables.'}
                                        </p>
                                        
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                            gap: '1rem',
                                            marginTop: '1.5rem'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                                                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#059669' }}>5.0/5</div>
                                                <div style={{ fontSize: '0.9rem', color: '#065F46' }}>Client Rating</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
                                                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#059669' }}>On Time</div>
                                                <div style={{ fontSize: '0.9rem', color: '#065F46' }}>Delivery</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</div>
                                                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#059669' }}>100%</div>
                                                <div style={{ fontSize: '0.9rem', color: '#065F46' }}>Professional</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Technologies & Skills */}
                                {(selectedProject.technologies || selectedProject.skills || []).length > 0 && (
                                    <div>
                                        <h4 style={{
                                            fontSize: '1.3rem',
                                            fontWeight: '700',
                                            color: '#0F172A',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>⚡ Technologies & Tools Used</h4>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}>
                                            {(selectedProject.technologies || selectedProject.skills || []).map((tech, idx) => (
                                                <span key={idx} style={{
                                                    padding: '0.75rem 1.5rem',
                                                    background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
                                                    color: '#0369A1',
                                                    borderRadius: '25px',
                                                    fontSize: '0.95rem',
                                                    fontWeight: '600',
                                                    border: '2px solid #E0F2FE',
                                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                                                    transition: 'all 0.3s ease',
                                                    animation: `slideInUp 0.4s ease ${idx * 0.1}s both`
                                                }}>
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Project Details Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1.5rem',
                                    padding: '2rem',
                                    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                                    borderRadius: '16px',
                                    border: '1px solid #E2E8F0'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ 
                                            fontSize: '2rem', 
                                            marginBottom: '0.75rem',
                                            animation: 'bounce 2s ease-in-out infinite 1s'
                                        }}>👥</div>
                                        <div style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Client</div>
                                        <div style={{ color: '#0F172A', fontWeight: '700', fontSize: '1.1rem' }}>
                                            {selectedProject.clientName?.split(' ')[0] || 'Private Client'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ 
                                            fontSize: '2rem', 
                                            marginBottom: '0.75rem',
                                            animation: 'bounce 2s ease-in-out infinite 1.2s'
                                        }}>💰</div>
                                        <div style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Project Value</div>
                                        <div style={{ color: '#059669', fontWeight: '700', fontSize: '1.1rem' }}>
                                            {selectedProject.budget ? `$${Number(selectedProject.budget).toLocaleString()}` : 'Fixed Price'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ 
                                            fontSize: '2rem', 
                                            marginBottom: '0.75rem',
                                            animation: 'bounce 2s ease-in-out infinite 1.4s'
                                        }}>⏱️</div>
                                        <div style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Duration</div>
                                        <div style={{ color: '#0F172A', fontWeight: '700', fontSize: '1.1rem' }}>
                                            {selectedProject.duration || '2-4 weeks'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ 
                                            fontSize: '2rem', 
                                            marginBottom: '0.75rem',
                                            animation: 'bounce 2s ease-in-out infinite 1.6s'
                                        }}>✅</div>
                                        <div style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</div>
                                        <div style={{
                                            color: '#059669',
                                            fontWeight: '700',
                                            fontSize: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.25rem'
                                        }}>
                                            {selectedProject.status || 'Completed'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const BrowseFreelancersView = ({ styles, setActiveView }) => {
    const [selectedFreelancer, setSelectedFreelancer] = useState(null);
    const [freelancers, setFreelancers] = useState([]);
    const [portfolios, setPortfolios] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [refreshKey, setRefreshKey] = useState(0);
    const [messagingFreelancer, setMessagingFreelancer] = useState(null);

    // Skill categories for filtering
    const skillCategories = [
        { name: 'Design & Creative', icon: <PenToolIcon /> },
        { name: 'Video & Animation', icon: <VideoIcon /> },
        { name: 'Web & Software Dev', icon: <CodeIcon /> },
        { name: 'Writing & Translation', icon: <ImageIcon /> },
        { name: 'Crafting & DIY', icon: <ScissorsIcon /> },
        { name: 'Music & Audio', icon: <MusicIcon /> },
        { name: 'Marketing & Sales', icon: <MegaphoneIcon /> },
        { name: 'Admin & Support', icon: <HeadphoneIcon /> },
    ];

    const loadFreelancers = () => {
        setLoading(true);
        
        // Query users with userType 'freelancer' only
        const unsubFreelancers = onSnapshot(
            query(collection(db, 'users'), where('userType', '==', 'freelancer')),
            (snap) => {
                const freelancerUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setFreelancers(freelancerUsers);
                setLoading(false);
            },
            (error) => {
                // Fallback to client-side filtering if query fails
                const fallbackUnsub = onSnapshot(
                    collection(db, 'users'),
                    (snap) => {
                        const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        const freelancerUsers = allUsers.filter(user => user.userType === 'freelancer');
                        setFreelancers(freelancerUsers);
                        setLoading(false);
                    },
                    () => {
                        setFreelancers([]);
                        setLoading(false);
                    }
                );
                return fallbackUnsub;
            }
        );
        
        return unsubFreelancers;
    };

    useEffect(() => {
        const freelancerUnsub = loadFreelancers();

        // Load portfolio items for each freelancer
        const unsubPortfolios = onSnapshot(
            collection(db, 'projects'),
            (snap) => {
                const portfolioData = {};
                snap.docs.forEach(doc => {
                    const data = { id: doc.id, ...doc.data() };
                    // Only include projects marked as portfolio items
                    if (data.isPortfolioItem === true && data.freelancerId) {
                        if (!portfolioData[data.freelancerId]) {
                            portfolioData[data.freelancerId] = [];
                        }
                        portfolioData[data.freelancerId].push(data);
                    }
                });
                setPortfolios(portfolioData);
            },
            (error) => {
                console.error('❌ Portfolio query error:', error);
                // Continue without portfolios if query fails
                setPortfolios({});
            }
        );

        return () => {
            if (freelancerUnsub && typeof freelancerUnsub === 'function') {
                freelancerUnsub();
            }
            if (unsubPortfolios && typeof unsubPortfolios === 'function') {
                unsubPortfolios();
            }
        };
    }, [refreshKey]);

    // Filter and search logic
    const filteredFreelancers = freelancers.filter(freelancer => {
        // Search by name or username
        const matchesSearch = !searchTerm || 
            (freelancer.name && freelancer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (freelancer.username && freelancer.username.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filter by skills
        const matchesSkills = selectedSkills.length === 0 ||
            selectedSkills.some(skill => 
                freelancer.skills && freelancer.skills.some(userSkill => 
                    userSkill.toLowerCase().includes(skill.toLowerCase())
                )
            );

        return matchesSearch && matchesSkills;
    });

    // Sort freelancers
    const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'rate_low':
                return (a.hourlyRate || 0) - (b.hourlyRate || 0);
            case 'rate_high':
                return (b.hourlyRate || 0) - (a.hourlyRate || 0);
            case 'newest':
            default:
                return new Date(b.createdAt?.toDate?.() || 0) - new Date(a.createdAt?.toDate?.() || 0);
        }
    });

    const toggleSkillFilter = (skill) => {
        setSelectedSkills(prev => 
            prev.includes(skill) 
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSkills([]);
        setSortBy('newest');
    };

    // Quick message handler - simplified and robust
    const handleQuickMessage = async (freelancer) => {
        if (messagingFreelancer) return; // Prevent double-click
        
        setMessagingFreelancer(freelancer.id);
        
        try {
            console.log('🔵 Starting chat with freelancer:', freelancer.id);
            
            const currentUserId = auth.currentUser?.uid;
            if (!currentUserId) {
                throw new Error('You must be logged in to send messages.');
            }
            
            if (currentUserId === freelancer.id) {
                throw new Error('You cannot message yourself.');
            }
            
            // Create deterministic chat ID
            const [user1, user2] = [currentUserId, freelancer.id].sort();
            const chatId = `${user1}_${user2}`;
            console.log('🔵 Chat ID:', chatId);
            
            // Check if chat exists
            const chatRef = doc(db, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);
            
            if (!chatDoc.exists()) {
                console.log('🔵 Creating new chat...');
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
                console.log('✅ Chat created successfully');
            } else {
                console.log('✅ Chat already exists');
            }
            
            // Send initial message
            const message = `Hi ${freelancer.name}! I'm interested in discussing a potential project with you. I've reviewed your profile and would like to learn more about your services.`;
            
            console.log('🔵 Sending message...');
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            await addDoc(messagesRef, {
                senderId: currentUserId,
                text: message,
                createdAt: serverTimestamp(),
                readBy: [currentUserId],
                status: 'sent'
            });
            
            // Update chat with last message
            await updateDoc(chatRef, {
                lastMessage: message,
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            console.log('✅ Message sent successfully');
            
            // Switch to messages view
            setActiveView('messages');
            
        } catch (error) {
            console.error('❌ Failed to start chat:', error);
            console.error('Error details:', {
                code: error?.code,
                message: error?.message,
                freelancerId: freelancer.id
            });
            
            let errorMessage = 'Failed to start conversation. ';
            
            if (error?.code === 'permission-denied') {
                errorMessage += 'Permission denied. Please check Firebase security rules.';
            } else if (error?.message?.includes('not authenticated')) {
                errorMessage += 'Please log in first.';
            } else {
                errorMessage += error?.message || 'Please try again.';
            }
            
            alert(errorMessage);
        } finally {
            setMessagingFreelancer(null);
        }
    };

    // Helper function to create test freelancer
    const createTestFreelancer = async () => {
        try {
            const testFreelancerData = {
                name: `Test Freelancer ${Math.floor(Math.random() * 1000)}`,
                email: `freelancer${Date.now()}@test.com`,
                username: `freelancer_${Date.now()}`,
                userType: 'freelancer',
                bio: 'Experienced professional ready to bring your projects to life with quality work and timely delivery.',
                skills: ['Web Development', 'React', 'Node.js', 'Design', 'UI/UX'],
                hourlyRate: Math.floor(Math.random() * 100) + 30,
                location: 'Remote',
                photoUrl: `https://ui-avatars.com/api/?name=Test+Freelancer&size=200&background=random`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, 'users'), testFreelancerData);
            console.log('✅ Test freelancer created:', docRef.id);
            alert('✅ Test freelancer created successfully!');
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('❌ Failed to create test freelancer:', error);
            alert('❌ Failed to create test freelancer. Check console for details.');
        }
    };

    // Helper function to create test portfolios for existing freelancers
    const createTestPortfolios = async () => {
        if (freelancers.length === 0) {
            alert('⚠️ No freelancers found. Create a test freelancer first.');
            return;
        }

        try {
            const batch = writeBatch(db);
            const projectTitles = [
                'E-commerce Website Redesign',
                'Mobile App Development',
                'Brand Identity Design',
                'Marketing Campaign',
                'Custom WordPress Theme',
                'Logo Design Project'
            ];

            freelancers.slice(0, 3).forEach(freelancer => {
                for (let i = 0; i < 2; i++) {
                    const projectRef = doc(collection(db, 'projects'));
                    const projectData = {
                        title: projectTitles[Math.floor(Math.random() * projectTitles.length)],
                        description: 'A comprehensive project showcasing professional skills and expertise.',
                        freelancerId: freelancer.id,
                        freelancerName: freelancer.name,
                        status: 'Completed',
                        isPortfolioItem: true,
                        technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'].slice(0, Math.floor(Math.random() * 3) + 2),
                        imageUrl: null,
                        projectUrl: null,
                        createdAt: serverTimestamp(),
                        completedAt: serverTimestamp()
                    };
                    batch.set(projectRef, projectData);
                }
            });

            await batch.commit();
            console.log('✅ Test portfolios created');
            alert('✅ Test portfolio projects added successfully!');
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('❌ Failed to create test portfolios:', error);
            alert('❌ Failed to create test portfolios. Check console for details.');
        }
    };



    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #E0F2FE',
                    borderTop: '4px solid #6366F1',
                    borderRadius: '50%',
                    margin: '0 auto 1rem',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#6366F1', fontSize: '1.1rem' }}>Loading talented freelancers...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Enhanced Header */}
            <header style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
                borderRadius: '24px',
                padding: '3rem 2.5rem',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animation: 'slideInDown 0.8s ease'
            }}>
                {/* Background decorations */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                    opacity: 0.7
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <h1 style={{
                                color: '#FFFFFF',
                                fontSize: '3rem',
                                fontWeight: '800',
                                margin: '0 0 1rem 0',
                                letterSpacing: '-0.02em',
                                lineHeight: '1'
                            }}>Discover Top Talent 🚀</h1>
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '1.2rem',
                                margin: 0,
                                maxWidth: '600px',
                                lineHeight: '1.6'
                            }}>Connect with skilled freelancers, browse their portfolios, and hire the perfect match for your project</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                textAlign: 'center',
                                minWidth: '200px'
                            }}>
                                <div style={{
                                    fontSize: '2.5rem',
                                    marginBottom: '0.5rem'
                                }}>👥</div>
                                <div style={{
                                    color: '#FFFFFF',
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    marginBottom: '0.25rem'
                                }}>{freelancers.length}</div>
                                <div style={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontSize: '0.9rem'
                                }}>Active Freelancers</div>
                            </div>
                            
                            <button
                                onClick={() => setRefreshKey(prev => prev + 1)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    color: '#FFFFFF',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.transform = 'scale(1)';
                                }}
                                title="Refresh freelancer list"
                            >
                                🔄
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {/* Search */}
                        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                            <input
                                type="text"
                                placeholder="Search by name or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    borderRadius: '16px',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                    fontSize: '1rem',
                                    backdropFilter: 'blur(20px)',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(99, 102, 241, 0.8)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '1.2rem'
                            }}>🔍</div>
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '1rem',
                                borderRadius: '16px',
                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: '#FFFFFF',
                                fontSize: '1rem',
                                backdropFilter: 'blur(20px)',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="newest" style={{ background: '#1E293B' }}>Newest First</option>
                            <option value="name" style={{ background: '#1E293B' }}>Name A-Z</option>
                            <option value="rate_low" style={{ background: '#1E293B' }}>Rate: Low to High</option>
                            <option value="rate_high" style={{ background: '#1E293B' }}>Rate: High to Low</option>
                        </select>

                        {/* Clear Filters */}
                        {(searchTerm || selectedSkills.length > 0) && (
                            <button
                                onClick={clearFilters}
                                style={{
                                    padding: '1rem 1.5rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#FFFFFF',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(20px)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                Clear All ✕
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Skill Filter Pills */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                    color: '#0F172A',
                    marginBottom: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                }}>Filter by Skills:</h3>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                }}>
                    {skillCategories.map(skill => {
                        const isSelected = selectedSkills.includes(skill.name);
                        return (
                            <button
                                key={skill.name}
                                onClick={() => toggleSkillFilter(skill.name)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: isSelected ? '2px solid #6366F1' : '2px solid #E2E8F0',
                                    background: isSelected ? '#F0F9FF' : '#FFFFFF',
                                    color: isSelected ? '#6366F1' : '#374151',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) {
                                        e.target.style.borderColor = '#6366F1';
                                        e.target.style.background = '#F8FAFC';
                                    }
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) {
                                        e.target.style.borderColor = '#E2E8F0';
                                        e.target.style.background = '#FFFFFF';
                                    }
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                {skill.icon}
                                <span>{skill.name}</span>
                                {isSelected && <span style={{ marginLeft: '0.25rem' }}>✓</span>}
                            </button>
                        );
                    })}
                </div>
            </div>


            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '1rem 1.5rem',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#374151',
                    fontSize: '1rem'
                }}>
                    <span>📊</span>
                    <strong>{sortedFreelancers.length}</strong> 
                    {sortedFreelancers.length === 1 ? 'freelancer' : 'freelancers'} found
                    {loading && <span style={{ color: '#6366F1', marginLeft: '0.5rem' }}>(🔄 Loading...)</span>}
                </div>
                
                {selectedSkills.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                    }}>
                        {selectedSkills.map(skill => (
                            <span key={skill} style={{
                                padding: '0.25rem 0.75rem',
                                background: '#6366F1',
                                color: '#FFFFFF',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '500'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Freelancers Grid */}
            {sortedFreelancers.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: '#F8FAFC',
                    borderRadius: '20px',
                    border: '2px dashed #E2E8F0'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '1rem'
                    }}>🔍</div>
                    <h3 style={{
                        color: '#374151',
                        marginBottom: '1rem'
                    }}>No freelancers found</h3>
                    <p style={{
                        color: '#6B7280',
                        marginBottom: '1.5rem'
                    }}>Freelancers who register on the platform will appear here. You can also adjust your search terms or selected skill filters.</p>
                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
                        <button
                            onClick={clearFilters}
                            style={{
                                padding: '0.75rem 2rem',
                                background: '#6366F1',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#4F46E5';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#6366F1';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            Clear All Filters
                        </button>
                        
                        <button
                            onClick={createTestFreelancer}
                            style={{
                                padding: '0.6rem 1.8rem',
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                        >
                            👨‍💻 Create Test Freelancer
                        </button>
                        
                        {freelancers.length > 0 && (
                            <button
                                onClick={createTestPortfolios}
                                style={{
                                    padding: '0.6rem 1.8rem',
                                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0) scale(1)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                                }}
                            >
                                💼 Add Portfolio Projects
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    {sortedFreelancers.map((freelancer, index) => {
                        const freelancerPortfolio = portfolios[freelancer.id] || [];
                        return (
                            <div 
                                key={freelancer.id} 
                                style={{
                                    background: '#FFFFFF',
                                    borderRadius: '20px',
                                    padding: '2rem',
                                    border: '2px solid #F1F5F9',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    animation: `slideInUp 0.6s ease ${0.1 + index * 0.1}s both`
                                }}
                                className="freelancer-card"
                                onClick={() => setSelectedFreelancer(freelancer)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                                    e.currentTarget.style.borderColor = '#6366F1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                    e.currentTarget.style.borderColor = '#F1F5F9';
                                }}
                            >
                                {/* Profile Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{ position: 'relative' }}>
                                        <img 
                                            src={freelancer.photoUrl || 'https://via.placeholder.com/80'} 
                                            alt={freelancer.name}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '4px solid #F0F9FF',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '0',
                                            right: '0',
                                            width: '24px',
                                            height: '24px',
                                            background: '#10B981',
                                            borderRadius: '50%',
                                            border: '3px solid #FFFFFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                background: '#FFFFFF',
                                                borderRadius: '50%'
                                            }}></div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginLeft: '1rem', flex: 1 }}>
                                        <h3 style={{
                                            color: '#0F172A',
                                            fontSize: '1.4rem',
                                            fontWeight: '700',
                                            margin: '0 0 0.25rem 0',
                                            letterSpacing: '-0.025em'
                                        }}>
                                            {freelancer.name || 'Anonymous'}
                                        </h3>
                                        
                                        {freelancer.username && (
                                            <p style={{
                                                color: '#6366F1',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                margin: '0 0 0.5rem 0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                @{freelancer.username} ✨
                                            </p>
                                        )}
                                        
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            fontSize: '0.85rem',
                                            color: '#64748B'
                                        }}>
                                            <span>📍 {freelancer.location || 'Remote'}</span>
                                            <span style={{
                                                color: '#059669',
                                                fontWeight: '600'
                                            }}>💰 {freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : 'Negotiable'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                {freelancer.bio && (
                                    <p style={{
                                        color: '#475569',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
                                        marginBottom: '1.5rem',
                                        display: '-webkit-box',
                                        '-webkit-line-clamp': 3,
                                        '-webkit-box-orient': 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {freelancer.bio}
                                    </p>
                                )}

                                {/* Skills */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{
                                        color: '#374151',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        marginBottom: '0.75rem'
                                    }}>Skills & Expertise</h4>
                                    
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        minHeight: '40px'
                                    }}>
                                        {(freelancer.skills || []).slice(0, 4).map((skill, idx) => (
                                            <span key={idx} style={{
                                                padding: '0.375rem 0.75rem',
                                                background: '#F0F9FF',
                                                color: '#0369A1',
                                                border: '1px solid #E0F2FE',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '500',
                                                letterSpacing: '0.025em'
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                        {(freelancer.skills || []).length > 4 && (
                                            <span style={{
                                                padding: '0.375rem 0.75rem',
                                                background: '#F3F4F6',
                                                color: '#6B7280',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '500'
                                            }}>
                                                +{(freelancer.skills || []).length - 4} more
                                            </span>
                                        )}
                                        {(!freelancer.skills || freelancer.skills.length === 0) && (
                                            <span style={{
                                                color: '#9CA3AF',
                                                fontSize: '0.85rem',
                                                fontStyle: 'italic',
                                                padding: '0.375rem 0'
                                            }}>No skills listed yet</span>
                                        )}
                                    </div>
                                </div>

                                {/* Portfolio Preview */}
                                {freelancerPortfolio.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{
                                            color: '#374151',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            📁 Portfolio ({freelancerPortfolio.length} projects)
                                        </h4>
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            overflow: 'hidden'
                                        }}>
                                            {freelancerPortfolio.slice(0, 3).map((project, idx) => (
                                                <div key={idx} style={{
                                                    width: '60px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    background: project.imageUrl ? `url(${project.imageUrl})` : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    border: '2px solid #E2E8F0',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                    {!project.imageUrl && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            color: 'white',
                                                            fontSize: '1rem'
                                                        }}>📁</div>
                                                    )}
                                                </div>
                                            ))}
                                            {freelancerPortfolio.length > 3 && (
                                                <div style={{
                                                    width: '60px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    background: '#F3F4F6',
                                                    border: '2px solid #E2E8F0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.7rem',
                                                    color: '#6B7280',
                                                    fontWeight: '600'
                                                }}>
                                                    +{freelancerPortfolio.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{
                                    borderTop: '1px solid #F1F5F9',
                                    paddingTop: '1.5rem',
                                    display: 'flex',
                                    gap: '0.75rem'
                                }}>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickMessage(freelancer);
                                        }}
                                        disabled={messagingFreelancer === freelancer.id}
                                        style={{
                                            flex: '1',
                                            padding: '1rem',
                                            background: messagingFreelancer === freelancer.id ? '#F3F4F6' : 'transparent',
                                            color: messagingFreelancer === freelancer.id ? '#9CA3AF' : '#6366F1',
                                            border: `2px solid ${messagingFreelancer === freelancer.id ? '#E5E7EB' : '#6366F1'}`,
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: messagingFreelancer === freelancer.id ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            opacity: messagingFreelancer === freelancer.id ? 0.6 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (messagingFreelancer !== freelancer.id) {
                                                e.target.style.background = '#F0F9FF';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (messagingFreelancer !== freelancer.id) {
                                                e.target.style.background = 'transparent';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        {messagingFreelancer === freelancer.id ? (
                                            <><span>⏳</span> Starting Chat...</>
                                        ) : (
                                            <><span>💬</span> Message</>
                                        )}
                                    </button>
                                    <button style={{
                                        flex: '1',
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>👤</span> View Profile
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedFreelancer && (
                <EnhancedFreelancerModal 
                    freelancer={selectedFreelancer} 
                    portfolio={portfolios[selectedFreelancer.id] || []} 
                    onClose={() => setSelectedFreelancer(null)} 
                    styles={styles} 
                    setActiveView={setActiveView} 
                />
            )}
        </div>
    );
};

const ViewProposalsView = ({ styles, showDialog }) => {
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobIds, setJobIds] = useState([]);
    const [nameCache, setNameCache] = useState({});
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    // Primary: proposals addressed to this clientId (with orderBy fallback)
    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        // Use single query without orderBy; sort client-side to avoid index requirement noise
        const qClient = query(collection(db, 'proposals'), where('clientId', '==', uid));
        const unsub = onSnapshot(qClient, (snap) => {
            const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            arr.sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0));
            setProposals(arr);
            setSelectedProposal(prev => prev && arr.find(a => a.id === prev.id) ? prev : (arr[0] || null));
            setLoading(false);
        }, (err) => {
            console.error('Proposals query failed:', err);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Fallback path: listen to this client's jobs, then subscribe to proposals by jobId (chunked 'in' queries)
    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        const unsubJobs = onSnapshot(query(collection(db, 'jobs'), where('clientId','==', uid)), (snap) => {
            const ids = snap.docs.map(d => d.id);
            setJobIds(ids);
        });
        return () => unsubJobs();
    }, []);

    useEffect(() => {
        // If we already have proposals, skip. Otherwise fetch by jobId chunks.
        if (proposals.length > 0) return;
        if (jobIds.length === 0) { setLoading(false); return; }
        // Firestore 'in' supports up to 10 values
        const chunks = [];
        for (let i = 0; i < jobIds.length; i += 10) chunks.push(jobIds.slice(i, i+10));
        const unsubs = chunks.map(ids => onSnapshot(query(collection(db, 'proposals'), where('jobId','in', ids)), (snap) => {
            const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (arr.length > 0) {
                setProposals(prev => {
                    const map = new Map(prev.map(p => [p.id, p]));
                    arr.forEach(p => map.set(p.id, p));
                    const merged = Array.from(map.values());
                    setSelectedProposal(prevSel => prevSel && merged.find(m => m.id === prevSel.id) ? prevSel : (merged[0] || null));
                    return merged;
                });
                setLoading(false);
            }
        }))
        return () => unsubs.forEach(u => u());
    }, [jobIds]);

    const approve = async (p) => {
        if (!p) { showDialog('warning', 'No proposal selected', 'Please select a proposal and try again.'); return; }

        // Validate required fields
        if (!p.clientId || !p.freelancerId || !p.jobId) { showDialog('error', 'Missing information', 'Proposal is missing required information. Please refresh and try again.'); return; }

        setApproving(true);
        try {
            // Prevent duplicates if already approved
            if (p.status === 'approved' || p.projectId) { showDialog('info', 'Already approved', 'This proposal has already been approved.'); return; }

            console.log('Starting approval process for proposal:', p.id);
            
            // Deterministic project id avoids any composite index queries
            const projectId = `${p.jobId}_${p.freelancerId}`;
            const projRef = doc(db, 'projects', projectId);
            const jobRef = doc(db, 'jobs', p.jobId);
            const propRef = doc(db, 'proposals', p.id);

            console.log('Fetching job and project data...');
            console.log('Project ID:', projectId);
            console.log('Job ID:', p.jobId);
            console.log('Current user:', auth.currentUser?.uid);
            console.log('Proposal client ID:', p.clientId);
            
            let projSnap, jobSnap;
            try {
                console.log('Fetching project document...');
                projSnap = await getDoc(projRef);
                console.log('Project fetch successful');
            } catch (projErr) {
                console.error('Project fetch failed:', projErr);
                throw projErr;
            }
            
            try {
                console.log('Fetching job document...');
                jobSnap = await getDoc(jobRef);
                console.log('Job fetch successful');
            } catch (jobErr) {
                console.error('Job fetch failed:', jobErr);
                throw jobErr;
            }

            const job = jobSnap.exists() ? (jobSnap.data() || {}) : {};
            if (!jobSnap.exists()) {
                console.warn('Job document not found:', p.jobId);
            }
            
            // Avoid reading freelancer's user doc to bypass rules; use proposal data or fallback to id
            const freelancerName = p.freelancerName || p.freelancerId;
            const clientName = job.clientName || '';

            console.log('Creating batch transaction...');
            const batch = writeBatch(db);

            // Create or update the project
            const projectData = {
                title: job.title || 'Untitled Project',
                clientId: p.clientId,
                clientName,
                freelancerId: p.freelancerId,
                freelancerName,
                jobId: p.jobId,
                status: 'Active',
                budget: job.budget || null,
                totalSegments: job.totalSegments || 5,
                createdAt: projSnap.exists() ? (projSnap.data()?.createdAt || serverTimestamp()) : serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            batch.set(projRef, projectData, { merge: true });
            console.log('Project data prepared:', projectData);

            // Update proposal status and link to project
            batch.set(propRef, { 
                status: 'approved', 
                projectId,
                approvedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true });

            // Close job if it exists
            if (jobSnap.exists()) {
                batch.set(jobRef, { 
                    status: 'Closed',
                    closedAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                }, { merge: true });
            }

            console.log('Committing batch transaction...');
            await batch.commit();
            console.log('Batch transaction committed successfully');
            
            // Notify freelancer about proposal acceptance
            try {
                await addDoc(collection(db, 'notifications'), {
                    userId: p.freelancerId,
                    type: 'proposal_accepted',
                    text: `Congratulations! Your proposal for "${job.title || 'the project'}" has been accepted!`,
                    jobId: p.jobId,
                    projectId,
                    proposalId: p.id,
                    createdAt: serverTimestamp(),
                    read: false
                });
                console.log('Acceptance notification sent to freelancer');
            } catch (notifErr) {
                console.warn('Failed to send acceptance notification, but approval succeeded:', notifErr);
            }

            // Create chat between client and freelancer (separate from batch for better error handling)
            try {
                const [u1, u2] = [p.clientId, p.freelancerId].sort();
                const chatId = `${u1}_${u2}`;
                const chatRef = doc(db, 'chats', chatId);
                const chatDoc = await getDoc(chatRef);
                
                if (!chatDoc.exists()) {
                    await setDoc(chatRef, { 
                        participants: [u1, u2], 
                        lastMessage: '', 
                        createdAt: serverTimestamp(), 
                        updatedAt: serverTimestamp(), 
                        projectId 
                    });
                    console.log('Chat created:', chatId);
                } else {
                    await updateDoc(chatRef, { 
                        projectId, 
                        updatedAt: serverTimestamp() 
                    });
                    console.log('Chat updated:', chatId);
                }
            } catch (chatErr) {
                console.warn('Failed to create/update chat, but approval succeeded:', chatErr);
            }

            showDialog('success', 'Proposal approved', 'Project has been created and the freelancer has been notified.');
            
        } catch (err) {
            console.error('Detailed approval error:', {
                error: err,
                code: err?.code,
                message: err?.message,
                proposalId: p.id,
                jobId: p.jobId,
                freelancerId: p.freelancerId,
                clientId: p.clientId
            });
            
            // More specific error messages
            if (err?.code === 'permission-denied') {
                showDialog('error', 'Permission denied', 'You may not have the required permissions to approve this proposal. Please check your account settings or contact support.');
            } else if (err?.code === 'not-found') {
                showDialog('error', 'Not found', 'Some required data was not found. The job or proposal may have been deleted. Please refresh and try again.');
            } else if (err?.code === 'failed-precondition') {
                showDialog('error', 'Database operation failed', 'This might be due to security rules. Please try again or contact support.');
            } else if (err?.message?.includes('offline')) {
                showDialog('warning', 'You appear to be offline', 'Please check your internet connection and try again.');
            } else {
                showDialog('error', 'Approval failed', `Failed to approve the proposal: ${err?.message || 'Unknown error'}.`);
            }
        } finally {
            setApproving(false);
        }
    };

    const reject = async (p) => {
        if (!p) { showDialog('warning', 'No proposal selected', 'Please select a proposal and try again.'); return; }

        showDialog('confirm', 'Reject proposal?', 'This action cannot be undone.', async () => {
        setRejecting(true);
        try {
            console.log('Rejecting proposal:', p.id);
            
            // Update proposal status
            await updateDoc(doc(db, 'proposals', p.id), { 
                status: 'rejected',
                rejectedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            // Notify freelancer
            try {
                const jobSnap = await getDoc(doc(db, 'jobs', p.jobId));
                const jobTitle = jobSnap.exists() ? (jobSnap.data().title || 'Project') : 'Project';
                await addDoc(collection(db, 'notifications'), {
                    userId: p.freelancerId,
                    type: 'proposal_rejected',
                    text: `Your proposal for "${jobTitle}" has been rejected.`,
                    jobId: p.jobId,
                    proposalId: p.id,
                    createdAt: serverTimestamp(),
                    read: false,
                });
                console.log('Notification sent to freelancer');
            } catch (notifErr) {
                console.warn('Failed to send notification, but rejection succeeded:', notifErr);
            }

            showDialog('success', 'Proposal rejected', 'The freelancer has been notified.');
            
        } catch (err) {
            console.error('Reject proposal failed:', err);
            if (err?.code === 'permission-denied') {
                showDialog('error', 'Permission denied', 'You may not have the required permissions to reject this proposal.');
            } else {
                showDialog('error', 'Rejection failed', `${err?.message || 'Unknown error'}`);
            }
        } finally {
            setRejecting(false);
        }
        }, 'Reject');
    };

    // Enrich missing freelancer names once we have proposals
    useEffect(() => {
        (async () => {
            const missing = proposals.filter(p => !p.freelancerName);
            if (missing.length === 0) return;
            const updates = {};
            for (const m of missing) {
                try {
                    const u = await getDoc(doc(db, 'users', m.freelancerId));
                    if (u.exists()) updates[m.freelancerId] = u.data().name || m.freelancerId;
                } catch (_) {}
            }
            if (Object.keys(updates).length > 0) setNameCache(prev => ({ ...prev, ...updates }));
        })();
    }, [proposals]);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F8FAFC',
            padding: '2.5rem'
        }}>
            {/* Clean Header */}
            <header style={{
                marginBottom: '2.5rem',
                animation: 'fadeIn 0.5s ease-out'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '600',
                    color: '#1E293B',
                    margin: '0 0 0.5rem 0',
                    letterSpacing: '-0.02em'
                }}>Proposals</h1>
                <p style={{
                    fontSize: '0.95rem',
                    color: '#64748B',
                    margin: 0
                }}>
                    {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'} received
                </p>
            </header>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .proposal-card {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .proposal-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1) !important;
                }
                .proposal-card:active {
                    transform: translateY(0);
                }
                .action-btn {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .action-btn:hover {
                    transform: translateY(-1px);
                }
                .action-btn:active {
                    transform: translateY(0);
                }
            `}</style>

            <div style={{display: 'flex', gap: '1.5rem', alignItems: 'start'}}>
                {/* Proposals List */}
                <div style={{
                    flex: 1,
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    maxHeight: '75vh',
                    overflowY: 'auto',
                    animation: 'slideUp 0.4s ease-out'
                }}>
                    {loading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            color: '#94A3B8'
                        }}>
                            <p style={{fontSize: '0.9rem'}}>Loading proposals...</p>
                        </div>
                    )}
                    {proposals.map((p, i) => (
                        <div 
                            key={p.id} 
                            className="proposal-card" 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                marginBottom: '0.75rem',
                                background: selectedProposal && p.id === selectedProposal.id ? '#F1F5F9' : '#FFFFFF',
                                border: '1px solid',
                                borderColor: selectedProposal && p.id === selectedProposal.id ? '#3B82F6' : '#E2E8F0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                animation: `slideUp 0.3s ease-out ${i * 0.05}s backwards`,
                                boxShadow: selectedProposal && p.id === selectedProposal.id 
                                    ? '0 4px 12px -2px rgba(59, 130, 246, 0.15)' 
                                    : '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}
                            onClick={() => setSelectedProposal(p)}
                        >
                            <img 
                                src={p.freelancerAvatar || 'https://via.placeholder.com/48'} 
                                alt={p.freelancerId} 
                                style={{
                                    width: '48px', 
                                    height: '48px', 
                                    borderRadius: '8px',
                                    border: '2px solid #E2E8F0',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{flex: 1}}>
                                <p style={{
                                    fontWeight: '500',
                                    fontSize: '0.95rem',
                                    color: '#1E293B',
                                    margin: '0 0 0.25rem 0'
                                }}>
                                    {p.freelancerName || nameCache[p.freelancerId] || p.freelancerId}
                                </p>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    background: p.status === 'approved' 
                                        ? '#D1FAE5' 
                                        : p.status === 'rejected'
                                        ? '#FEE2E2'
                                        : '#FEF3C7',
                                    color: p.status === 'approved' 
                                        ? '#065F46' 
                                        : p.status === 'rejected'
                                        ? '#991B1B'
                                        : '#92400E'
                                }}>
                                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                </span>
                            </div>
                            <svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 20 20" 
                                fill="none" 
                                style={{
                                    opacity: 0.4,
                                    transition: 'all 0.2s',
                                    transform: selectedProposal && p.id === selectedProposal.id ? 'translateX(2px)' : 'translateX(0)'
                                }}
                            >
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    ))}
                    {!loading && proposals.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem 1rem',
                            color: '#94A3B8'
                        }}>
                            <p style={{fontSize: '0.95rem', margin: 0}}>No proposals yet</p>
                        </div>
                    )}
                </div>

                {/* Proposal Details */}
                {selectedProposal && (
                    <div style={{
                        flex: 2,
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '2rem',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        animation: 'slideUp 0.4s ease-out 0.1s backwards'
                    }}>
                        {/* Profile Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '2rem',
                            paddingBottom: '1.5rem',
                            borderBottom: '1px solid #E2E8F0'
                        }}>
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                                <img 
                                    src={selectedProposal.freelancerAvatar || 'https://via.placeholder.com/64'} 
                                    alt="Freelancer" 
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '8px',
                                        border: '2px solid #E2E8F0',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: '#1E293B',
                                        margin: '0 0 0.5rem 0',
                                        letterSpacing: '-0.01em'
                                    }}>
                                        {selectedProposal.freelancerName || selectedProposal.freelancerId}
                                    </h3>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.625rem',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500',
                                        background: selectedProposal.status === 'approved' 
                                            ? '#D1FAE5' 
                                            : selectedProposal.status === 'rejected'
                                            ? '#FEE2E2'
                                            : '#FEF3C7',
                                        color: selectedProposal.status === 'approved' 
                                            ? '#065F46' 
                                            : selectedProposal.status === 'rejected'
                                            ? '#991B1B'
                                            : '#92400E'
                                    }}>
                                        {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            {selectedProposal.status === 'pending' && (
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <button 
                                        className="action-btn"
                                        style={{
                                            padding: '0.625rem 1.25rem',
                                            background: '#10B981',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: (approving || rejecting) ? 'not-allowed' : 'pointer',
                                            opacity: (approving || rejecting) ? 0.6 : 1,
                                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                        }}
                                        onClick={() => approve(selectedProposal)} 
                                        disabled={approving || rejecting}
                                    >
                                        {approving ? 'Approving...' : 'Approve'}
                                    </button>
                                    <button 
                                        className="action-btn"
                                        style={{
                                            padding: '0.625rem 1.25rem',
                                            background: '#FFFFFF',
                                            color: '#DC2626',
                                            border: '1px solid #FEE2E2',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: (approving || rejecting) ? 'not-allowed' : 'pointer',
                                            opacity: (approving || rejecting) ? 0.6 : 1
                                        }}
                                        onClick={() => reject(selectedProposal)} 
                                        disabled={approving || rejecting}
                                    >
                                        {rejecting ? 'Rejecting...' : 'Reject'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <h4 style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#64748B',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                margin: '0 0 1rem 0'
                            }}>Cover Letter</h4>
                            <div style={{
                                background: '#F8FAFC',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0'
                            }}>
                                <p style={{
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    color: '#475569',
                                    margin: 0,
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {selectedProposal.coverLetter || 'No cover letter provided.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Rating Modal Component
const RatingModal = ({ isOpen, onClose, freelancerName, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        setSubmitting(true);
        await onSubmit({ rating, review });
        setSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }} onClick={(e) => e.stopPropagation()}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#1E293B' }}>
                    Rate {freelancerName}
                </h2>
                <p style={{ margin: '0 0 1.5rem 0', color: '#64748B' }}>
                    How was your experience working with this freelancer?
                </p>

                {/* Star Rating */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '2.5rem',
                                padding: '0.25rem',
                                transition: 'transform 0.2s',
                                transform: (hoverRating >= star || rating >= star) ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            {(hoverRating >= star || rating >= star) ? '⭐' : '☆'}
                        </button>
                    ))}
                </div>

                {/* Review Text */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#334155' }}>
                        Review (Optional)
                    </label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your experience working with this freelancer..."
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.95rem',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: 'white',
                            color: '#64748B',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.5 : 1
                        }}
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: rating === 0 ? '#94A3B8' : 'linear-gradient(135deg, #3B82F6, #1E40AF)',
                            color: 'white',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            cursor: (submitting || rating === 0) ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ManageProjectView = ({ styles }) => {
    const [projects, setProjects] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [segments, setSegments] = useState([]);
    const [completionRequests, setCompletionRequests] = useState([]);
    const [feedbackById, setFeedbackById] = useState({});
    const [updatingId, setUpdatingId] = useState('');
    const [approvingCompletion, setApprovingCompletion] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);

    // Load projects where current user is the client
    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        const qPrimary = query(collection(db, 'projects'), where('clientId', '==', uid), where('status','in', ['Active','Pending','Completion Requested']));
        const handleSnap = (snap) => {
            const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const uniq = Array.from(new Map(arr.map(x => [x.id, x])).values());
            setProjects(uniq);
            // Auto-select the first project if none selected to ensure segments are visible
            if (!selectedId && uniq.length > 0) setSelectedId(prev => prev || uniq[0].id);
        };
        let unsub = onSnapshot(qPrimary, handleSnap, (err) => {
            console.warn('Primary projects query failed; falling back to clientId-only and filtering in app. Consider creating an index for (clientId,status).', err);
            const qFallback = query(collection(db, 'projects'), where('clientId', '==', uid));
            unsub();
            unsub = onSnapshot(qFallback, (snap2) => {
                // Filter client-side to Active/Pending/Completion Requested
                const arr2 = snap2.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => ['Active','Pending','Completion Requested'].includes(p.status));
                const uniq2 = Array.from(new Map(arr2.map(x => [x.id, x])).values());
                setProjects(uniq2);
            });
        });
        return () => unsub();
    }, []);

    // Load segments for selected project
    useEffect(() => {
        if (!selectedId) { setSegments([]); return; }
        const uid = auth.currentUser?.uid || 'none';
        // Primary: collectionGroup to ensure we read segments even if subcollection query fails
        const tryCollectionGroup = () => new Promise((resolve) => {
            let cleaned = false;
            const qCG = query(
                collectionGroup(db, 'segments'),
                where('clientId','==', uid),
                where('projectId','==', selectedId)
            );
            const unsub = onSnapshot(qCG, (snap) => {
                if (cleaned) return; resolve({ unsub, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
            }, (err) => {
                console.warn('Segments collectionGroup query failed; will fall back to project subcollection.', err);
                if (cleaned) return; resolve({ unsub, error: err });
            });
            return () => { cleaned = true; unsub(); };
        });
        const trySubcollection = () => new Promise((resolve) => {
            let cleaned = false;
            const qSub = query(collection(db, 'projects', selectedId, 'segments'));
            const unsub = onSnapshot(qSub, (snap) => {
                if (cleaned) return; const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                arr.sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0));
                resolve({ unsub, data: arr });
            }, (err) => {
                console.error('Segments subcollection query failed:', err);
                resolve({ unsub, error: err });
            });
            return () => { cleaned = true; unsub(); };
        });
        let activeUnsub = null;
        (async () => {
            const cg = await tryCollectionGroup();
            if (cg.data) {
                setSegments(cg.data);
                activeUnsub = cg.unsub; return;
            }
            const sub = await trySubcollection();
            if (sub.data) {
                setSegments(sub.data);
                activeUnsub = sub.unsub; return;
            }
            setSegments([]);
        })();
        return () => { if (activeUnsub) activeUnsub(); };
    }, [selectedId]);
    
    // Load completion requests for selected project
    useEffect(() => {
        if (!selectedId) { setCompletionRequests([]); return; }
        
        const qCompletions = query(collection(db, 'projects', selectedId, 'completions'));
        const unsub = onSnapshot(qCompletions, (snap) => {
            const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            arr.sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0));
            setCompletionRequests(arr);
        }, (err) => {
            console.error('Completion requests query failed:', err);
            setCompletionRequests([]);
        });
        
        return () => unsub();
    }, [selectedId]);

    // Fallback: if attachments are missing, attempt to list from Storage by convention
    const [attachmentsById, setAttachmentsById] = useState({});
    useEffect(() => {
        (async () => {
            if (!selectedId || !segments || segments.length === 0) return;
            const updates = {};
            for (const s of segments) {
                const arr = Array.isArray(s.attachments) ? s.attachments : (s.attachments && typeof s.attachments === 'object' ? Object.values(s.attachments) : []);
                const hasUsableUrls = Array.isArray(arr) && arr.some(a => a && a.url);
                if (hasUsableUrls) continue;
                if (Array.isArray(arr) && arr.length > 0) {
                    const files = [];
                    for (const a of arr) {
                        if (!a || !a.path) continue;
                        try {
const itemRef = ref(storage, a.path);
                            const url = await getDownloadURL(itemRef);
                            files.push({ name: a.name || a.path.split('/').pop(), url });
                        } catch (_) { /* ignore individual file errors */ }
                    }
                    if (files.length > 0) updates[s.id] = files;
                }
            }
            if (Object.keys(updates).length > 0) setAttachmentsById(prev => ({ ...prev, ...updates }));
        })();
    }, [selectedId, segments]);

    const setFeedback = (id, val) => setFeedbackById(prev => ({ ...prev, [id]: val }));

    const updateSegmentStatus = async (segmentId, status) => {
        try {
            setUpdatingId(segmentId);
            const segment = segments.find(s => s.id === segmentId);
            const feedback = feedbackById[segmentId] || '';
            
            await updateDoc(doc(db, 'projects', selectedId, 'segments', segmentId), {
                status,
                feedback
            });
            
            // Notify freelancer about segment status change
            if (segment && selected && selected.freelancerId) {
                try {
                    let notificationText = '';
                    let notificationType = '';
                    
                    if (status === 'approved') {
                        notificationText = `Your segment "${segment.title}" for "${selected.title}" has been approved!`;
                        notificationType = 'segment_approved';
                    } else if (status === 'rejected') {
                        notificationText = `Your segment "${segment.title}" for "${selected.title}" was rejected${feedback ? ': ' + feedback : ''}`;
                        notificationType = 'segment_rejected';
                    } else if (status === 'changes_requested') {
                        notificationText = `Changes requested for "${segment.title}" in "${selected.title}"${feedback ? ': ' + feedback : ''}`;
                        notificationType = 'segment_revision_requested';
                    }
                    
                    if (notificationText) {
                        await addDoc(collection(db, 'notifications'), {
                            userId: selected.freelancerId,
                            type: notificationType,
                            text: notificationText,
                            projectId: selectedId,
                            projectTitle: selected.title,
                            segmentId,
                            segmentTitle: segment.title,
                            feedback,
                            createdAt: serverTimestamp(),
                            read: false
                        });
                    }
                } catch (notifErr) {
                    console.warn('Failed to send segment status notification:', notifErr);
                }
            }
            
            // Optimistically update local state so buttons hide immediately
            setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status, feedback } : s));
        } finally {
            setUpdatingId('');
        }
    };
    
    const approveProjectCompletion = async () => {
        if (!selectedId || !selected) return;
        
        setApprovingCompletion(true);
        try {
            // Update project status to Completed
            await updateDoc(doc(db, 'projects', selectedId), {
                status: 'Completed',
                completedAt: serverTimestamp(),
                completedBy: auth.currentUser?.uid,
                updatedAt: serverTimestamp()
            });
            
            // Update completion request status if exists
            const pendingCompletion = completionRequests.find(cr => cr.status === 'pending_review');
            if (pendingCompletion) {
                await updateDoc(doc(db, 'projects', selectedId, 'completions', pendingCompletion.id), {
                    status: 'approved',
                    reviewedAt: serverTimestamp(),
                    reviewedBy: auth.currentUser?.uid
                });
            }
            
            // Notify freelancer about project completion approval
            if (selected.freelancerId) {
                try {
                    await addDoc(collection(db, 'notifications'), {
                        userId: selected.freelancerId,
                        type: 'project_completed',
                        text: `🎉 Congratulations! Your project "${selected.title}" has been completed and approved by the client!`,
                        projectId: selectedId,
                        projectTitle: selected.title,
                        createdAt: serverTimestamp(),
                        read: false
                    });
                } catch (notifErr) {
                    console.warn('Failed to send completion notification:', notifErr);
                }
            }
            
            // Show rating modal after successful approval
            setTimeout(() => {
                setShowRatingModal(true);
            }, 500);
            
        } catch (error) {
            console.error('Error approving completion:', error);
            alert('Failed to approve project completion. Please try again.');
        } finally {
            setApprovingCompletion(false);
        }
    };

    const handleRatingSubmit = async ({ rating, review }) => {
        try {
            // Save rating to project
            await updateDoc(doc(db, 'projects', selectedId), {
                rating: {
                    stars: rating,
                    review: review.trim(),
                    ratedBy: auth.currentUser?.uid,
                    ratedAt: serverTimestamp()
                }
            });

            // Update freelancer's average rating
            if (selected.freelancerId) {
                const freelancerRef = doc(db, 'users', selected.freelancerId);
                const freelancerDoc = await getDoc(freelancerRef);
                
                if (freelancerDoc.exists()) {
                    const currentStats = freelancerDoc.data().stats || {};
                    const currentRating = currentStats.rating || 0;
                    const totalRatings = currentStats.totalRatings || 0;
                    
                    // Calculate new average rating based on total ratings
                    const newAverage = totalRatings > 0 
                        ? ((currentRating * totalRatings) + rating) / (totalRatings + 1)
                        : rating;
                    
                    await updateDoc(freelancerRef, {
                        'stats.rating': Number(newAverage.toFixed(1)),
                        'stats.totalRatings': totalRatings + 1
                    });
                    
                    // Send notification to freelancer about the rating
                    await addDoc(collection(db, 'notifications'), {
                        userId: selected.freelancerId,
                        type: 'rating_received',
                        text: `You received a ${rating}-star rating from ${selected.clientName || 'a client'}${review ? ' with a review' : ''}!`,
                        projectId: selectedId,
                        projectTitle: selected.title,
                        rating,
                        createdAt: serverTimestamp(),
                        read: false
                    });
                }
            }

            console.log('Rating saved successfully');
        } catch (error) {
            console.error('Error saving rating:', error);
        }
    };
    
    const rejectProjectCompletion = async (feedback = '') => {
        if (!selectedId || !selected) return;
        
        setApprovingCompletion(true);
        try {
            // Update project status back to Active
            await updateDoc(doc(db, 'projects', selectedId), {
                status: 'Active',
                completionRejectedAt: serverTimestamp(),
                rejectionFeedback: feedback,
                updatedAt: serverTimestamp()
            });
            
            // Update completion request status if exists
            const pendingCompletion = completionRequests.find(cr => cr.status === 'pending_review');
            if (pendingCompletion) {
                await updateDoc(doc(db, 'projects', selectedId, 'completions', pendingCompletion.id), {
                    status: 'rejected',
                    reviewedAt: serverTimestamp(),
                    reviewedBy: auth.currentUser?.uid,
                    rejectionFeedback: feedback
                });
            }
            
            // Send notification to freelancer about rejection
            if (selected.freelancerId) {
                await addDoc(collection(db, 'notifications'), {
                    userId: selected.freelancerId,
                    type: 'completion_rejected',
                    text: feedback 
                        ? `Project completion rejected for "${selected.title}". Client feedback: ${feedback}`
                        : `Project completion rejected for "${selected.title}". Please review and resubmit.`,
                    projectId: selectedId,
                    projectTitle: selected.title,
                    rejectionFeedback: feedback,
                    createdAt: serverTimestamp(),
                    read: false
                });
            }
            
            console.log('Revisions requested - freelancer notified');
            
        } catch (error) {
            console.error('Error rejecting completion:', error);
            alert('Failed to reject project completion. Please try again.');
        } finally {
            setApprovingCompletion(false);
        }
    };

    const selected = projects.find(p => p.id === selectedId) || null;

    return(
        <div>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.welcomeTitle}>Manage Projects</h1>
                    <p style={styles.welcomeSubtitle}>Select a project to review submitted segments.</p>
                </div>
            </header>
            <div style={styles.manageProjectGrid}>
                <div style={{...styles.card('0.2s', 'span 2')}}>
                    <h3 style={styles.cardTitle}>Projects</h3>
                    <select style={styles.input} value={selectedId} onChange={(e)=>setSelectedId(e.target.value)}>
                        <option value="">-- Choose project --</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title || p.id}</option>
                        ))}
                    </select>
                    {selected && (
                        <div style={{marginTop:'1rem', color:'#558B2F'}}>
                            <div><strong>Client:</strong> {selected.clientName || 'You'}</div>
                            <div><strong>Freelancer:</strong> {selected.freelancerName || selected.freelancerId}</div>
                            <div><strong>Status:</strong> {selected.status}</div>
                        </div>
                    )}
                </div>
                <div style={{...styles.card('0.3s', 'span 3')}}>
                    <h3 style={styles.cardTitle}>Submitted Segments</h3>
                    {segments.length === 0 && <p style={{color:'#558B2F'}}>No segments submitted yet.</p>}
                    {segments.map((s, i) => (
                        <div key={s.id} style={{...styles.milestoneItem, animationDelay: `${0.2 + i*0.05}s`, alignItems:'flex-start'}}>
                            {s.status === 'approved' ? <CheckCircleIcon color="#3B82F6"/> : <ClockIcon color="#475569"/>}
                            <div style={{flex:1}}>
                                <p style={{fontWeight:'600'}}>{s.title}</p>
                                <p style={{fontSize:'0.9rem', color:'#558B2F'}}>{s.description}</p>
                                {(() => {
                                    // Normalize attachments from various shapes (array, object, legacy 'files')
                                    const raw = s.attachments ?? s.files ?? attachmentsById[s.id] ?? [];
                                    const list = Array.isArray(raw)
                                        ? raw
                                        : (raw && typeof raw === 'object' ? Object.values(raw) : []);
                                    if (!list || list.length === 0) return null;
                                    return (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <p style={{fontWeight:'600'}}>Attachments</p>
                                            <ul>
                                                {list.map((att, idx) => (
                                                    <li key={idx}>
                                                        <a href={att.url} target="_blank" rel="noreferrer noopener">
                                                            {att.name || 'Attachment'}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })()}
                                <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                                    <input style={{...styles.input, flex:1}} placeholder="Optional feedback" value={feedbackById[s.id]||''} onChange={(e)=>setFeedback(s.id, e.target.value)} />
                                    {s.status === 'pending' && (
                                        <>
                                            <button style={{...styles.primaryButton, opacity: updatingId===s.id?0.7:1, cursor: updatingId===s.id?'not-allowed':'pointer'}} onClick={()=>updateSegmentStatus(s.id,'approved')} disabled={updatingId===s.id}>Approve</button>
                                            <button style={{...styles.secondaryButton, opacity: updatingId===s.id?0.7:1, cursor: updatingId===s.id?'not-allowed':'pointer'}} onClick={()=>updateSegmentStatus(s.id,'rejected')} disabled={updatingId===s.id}>Reject</button>
                                            <button style={{...styles.secondaryButton, opacity: updatingId===s.id?0.7:1, cursor: updatingId===s.id?'not-allowed':'pointer'}} onClick={()=>updateSegmentStatus(s.id,'changes_requested')} disabled={updatingId===s.id}>Request Changes</button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <span style={styles.milestoneStatus(s.status)}>{s.status}</span>
                        </div>
                    ))}
                </div>
                
                {/* Project Completion Requests */}
                {selected && selected.status === 'Completion Requested' && completionRequests.length > 0 && (
                    <div style={{
                        ...styles.card('0.4s', 'span 5'),
                        marginTop: '1rem',
                        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                        border: '2px solid #F59E0B',
                        borderRadius: '16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>🎯</div>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    color: '#92400E',
                                    fontSize: '1.3rem',
                                    fontWeight: '700'
                                }}>Project Completion Request</h3>
                                <p style={{
                                    margin: '0.25rem 0 0 0',
                                    color: '#B45309',
                                    fontSize: '0.9rem'
                                }}>The freelancer has submitted their final work for your review</p>
                            </div>
                        </div>
                        
                        {completionRequests.map((request, i) => (
                            <div key={request.id} style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginBottom: i < completionRequests.length - 1 ? '1rem' : 0,
                                border: '1px solid #FDE68A',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '1rem'
                                }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
                                            Final Submission by {request.freelancerName}
                                        </h4>
                                        <p style={{ margin: '0', color: '#6B7280', fontSize: '0.9rem' }}>
                                            Submitted on {request.submittedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                                        </p>
                                    </div>
                                    
                                    <div style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        backgroundColor: request.status === 'pending_review' ? '#FEF3C7' : 
                                                         request.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                                        color: request.status === 'pending_review' ? '#92400E' : 
                                               request.status === 'approved' ? '#065F46' : '#991B1B'
                                    }}>
                                        {request.status === 'pending_review' ? 'Pending Review' :
                                         request.status === 'approved' ? 'Approved' : 'Rejected'}
                                    </div>
                                </div>
                                
                                {/* Completion Notes */}
                                {request.notes && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Completion Summary:</h5>
                                        <p style={{ 
                                            margin: 0, 
                                            color: '#4B5563', 
                                            backgroundColor: '#F9FAFB',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            borderLeft: '3px solid #6366F1'
                                        }}>
                                            {request.notes}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Final Deliverables */}
                                {request.finalDeliverables && request.finalDeliverables.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Final Deliverables:</h5>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.5rem'
                                        }}>
                                            {request.finalDeliverables.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem 0.75rem',
                                                        backgroundColor: '#EFF6FF',
                                                        color: '#1D4ED8',
                                                        textDecoration: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '0.85rem',
                                                        border: '1px solid #DBEAFE',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#DBEAFE';
                                                        e.target.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#EFF6FF';
                                                        e.target.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    📁 {file.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Approval Actions */}
                                {request.status === 'pending_review' && (
                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid #F3F4F6'
                                    }}>
                                        <button
                                            onClick={approveProjectCompletion}
                                            disabled={approvingCompletion}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem 1.5rem',
                                                background: approvingCompletion ? '#9CA3AF' : 'linear-gradient(135deg, #10B981, #059669)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                cursor: approvingCompletion ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {approvingCompletion ? '⏳ Processing...' : '✅ Approve & Complete Project'}
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                const feedback = prompt('Please provide feedback for why you\'re rejecting this completion (optional):');
                                                if (feedback !== null) {
                                                    rejectProjectCompletion(feedback);
                                                }
                                            }}
                                            disabled={approvingCompletion}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: 'transparent',
                                                color: '#DC2626',
                                                border: '2px solid #DC2626',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                cursor: approvingCompletion ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!approvingCompletion) {
                                                    e.target.style.backgroundColor = '#DC2626';
                                                    e.target.style.color = 'white';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!approvingCompletion) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                    e.target.style.color = '#DC2626';
                                                }
                                            }}
                                        >
                                            ❌ Request Revisions
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Rating Modal */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                freelancerName={selected?.freelancerName || 'the freelancer'}
                onSubmit={handleRatingSubmit}
            />
        </div>
    )
};

const MessagesView = ({ styles, activeChatId, setActiveChatId }) => {
    return (
        <div style={{ 
            background: 'transparent', 
            height: 'calc(100vh - 120px)',
            minHeight: '600px'
        }}>
            <EnhancedChatPanel 
                initialChatId={activeChatId}
                onChatChange={setActiveChatId}
            />
        </div>
    );
};

const ProfileView = ({ styles }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Save Changes');

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        getDoc(doc(db, 'users', uid)).then(snap => {
            if (snap.exists()) {
                const d = snap.data();
                setName(d.name || ''); setUsername(d.username || ''); setAge(d.age || ''); setEmail(d.email || ''); setPhone(d.phone || ''); setPhotoUrl(d.photoUrl || '');
            }
        });
    }, []);

    const onPhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const uid = auth.currentUser?.uid;
            const sref = ref(storage, `avatars/${uid}`);
            await uploadBytes(sref, file);
            const url = await getDownloadURL(sref);
            setPhotoUrl(url);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaveStatus('Saving...');
        const uid = auth.currentUser?.uid;
        await setDoc(doc(db, 'users', uid), { uid, name, username, age: Number(age)||null, email, phone, photoUrl, userType: 'client' }, { merge: true });
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus('Save Changes'), 2000);
    };

    return (
        <div style={{...styles.card('0.2s', 'span 3')}}>
            <h3 style={styles.cardTitle}>Profile</h3>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                <img 
                        src={photoUrl || getDefaultAvatar(name)} 
                        alt="Avatar"
                        style={{ 
                            width: 96, 
                            height: 96, 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            border: '3px solid #E8F5E9',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }} 
                    />
                    <input 
                        type="file" 
                        id="client-avatar-upload" 
                        accept="image/*" 
                        onChange={onPhotoChange} 
                        style={{ display: 'none' }} 
                    />
                    <label 
                        htmlFor="client-avatar-upload"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '2px solid white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </label>
                </div>
                <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1E293B', fontSize: '1.1rem', fontWeight: '600' }}>Profile Picture</h4>
                    <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>
                        {saving ? '⏳ Uploading...' : 'Click the edit icon to change'}
                    </p>
                </div>
            </div>
            <div style={styles.formGrid}>
                <div className="form-row" style={{animationDelay: '0.2s'}}>
                    <label style={styles.formLabel}>Name</label>
                    <input type="text" style={styles.input} placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-row" style={{animationDelay: '0.25s'}}>
                    <label style={{
                        ...styles.formLabel,
                        background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '700',
                        fontSize: '0.95rem'
                    }}>Username * ✨</label>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="@your_unique_username" 
                            style={{
                                ...styles.input,
                                paddingLeft: '2.5rem',
                                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                border: '2px solid #DBEAFE',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '500',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                            }} 
                            value={username} 
                            onChange={(e)=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3B82F6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#DBEAFE';
                                e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#3B82F6',
                            fontSize: '1.1rem',
                            fontWeight: '600'
                        }}>@</div>
                        <div style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1.2rem',
                            animation: username ? 'none' : 'pulse 2s infinite'
                        }}>
                            {username ? '✅' : '💫'}
                        </div>
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: '#6b7280',
                        marginTop: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                    }}>
                        💡 <span>Unique identifier for freelancers to find and message you</span>
                    </div>
                </div>
                <div className="form-row" style={{animationDelay: '0.3s'}}>
                    <label style={styles.formLabel}>Age</label>
                    <input type="number" style={styles.input} placeholder="Your age" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="form-row" style={{animationDelay: '0.4s'}}>
                    <label style={styles.formLabel}>Email</label>
                    <input type="email" style={styles.input} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-row" style={{animationDelay: '0.5s'}}>
                    <label style={styles.formLabel}>Phone Number</label>
                    <input type="tel" style={styles.input} placeholder="e.g., +1 555 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
            </div>
            <div style={{ borderTop: '1px solid #E8F5E9', marginTop: '2rem', paddingTop: '1.5rem' }}>
                <button
                    style={{
                        ...styles.primaryButton,
                        backgroundColor: saveStatus === 'Saved!' ? '#388E3C' : '#4CAF50',
                    }}
                    onClick={handleSave}
                    disabled={saveStatus !== 'Save Changes'}
                >
                    {saveStatus}
                </button>
            </div>
        </div>
    );
};

const SettingsView = ({ styles }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saveStatus, setSaveStatus] = useState('Save Changes');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setError('');
        
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }
        
        setSaveStatus('Changing...');
        
        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error('No authenticated user found');
            }
            
            // Re-authenticate user with current password
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            
            // Update password
            await updatePassword(user, newPassword);
            
            setSaveStatus('Saved!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            setTimeout(() => {
                setSaveStatus('Save Changes');
            }, 2000);
        } catch (err) {
            console.error('Password change failed:', err);
            
            if (err.code === 'auth/wrong-password') {
                setError('Current password is incorrect');
            } else if (err.code === 'auth/weak-password') {
                setError('New password is too weak');
            } else if (err.code === 'auth/requires-recent-login') {
                setError('Please log out and log in again before changing password');
            } else {
                setError(err.message || 'Failed to change password');
            }
            
            setSaveStatus('Save Changes');
        }
    };

    return (
        <div>
            <header style={styles.header}><h1 style={styles.welcomeTitle}>Settings</h1></header>
            <div style={{...styles.card('0.2s', 'span 3')}}>
                <div className="form-section">
                    <h3 style={styles.cardTitle}>Change Password</h3>
                    {error && <p style={{color: '#DC2626', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</p>}
                    <div style={styles.formGrid}>
                        <div className="form-row" style={{animationDelay: '0.3s'}}>
                            <label style={styles.formLabel}>Current Password</label>
                            <div style={styles.passwordInputContainer}>
                                <input 
                                    type={showCurrentPassword ? 'text' : 'password'} 
                                    style={styles.input}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <button style={styles.eyeButton} onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                    {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        <div />
                        <div className="form-row" style={{animationDelay: '0.4s'}}>
                            <label style={styles.formLabel}>New Password</label>
                            <div style={styles.passwordInputContainer}>
                                <input 
                                    type={showNewPassword ? 'text' : 'password'} 
                                    style={styles.input}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button style={styles.eyeButton} onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        <div className="form-row" style={{animationDelay: '0.5s'}}>
                            <label style={styles.formLabel}>Confirm New Password</label>
                            <div style={styles.passwordInputContainer}>
                                <input 
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button style={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #E8F5E9', marginTop: '2rem', paddingTop: '1.5rem' }}>
                    <button
                        style={{
                            ...styles.primaryButton,
                            backgroundColor: saveStatus === 'Saved!' ? '#1D4ED8' : '#3B82F6',
                            opacity: saveStatus === 'Changing...' ? 0.7 : 1,
                        }}
                        onClick={handleSave}
                        disabled={saveStatus === 'Changing...'}
                    >
                        {saveStatus}
                    </button>
                </div>
            </div>
        </div>
    );
};


import SimpleModal from '../components/SimpleModal.jsx';

export default function ClientDashboard() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');
    const [activeChatId, setActiveChatId] = useState(null); // Track current active chat
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const navigate = useNavigate();

    const [dialog, setDialog] = useState({ open: false, type: 'info', title: '', message: '', onConfirm: null, confirmLabel: undefined });
    const showDialog = (type, title, message, onConfirm = null, confirmLabel) => setDialog({ open: true, type, title, message, onConfirm, confirmLabel });
    const closeDialog = () => setDialog(prev => ({ ...prev, open: false, onConfirm: null }));

    useEffect(() => {
      setTimeout(() => setIsLoaded(true), 100);
      
      // Check if user signed in with Google
      const user = auth.currentUser;
      if (user) {
        const isGoogle = user.providerData.some(provider => provider.providerId === 'google.com');
        setIsGoogleUser(isGoogle);
      }
    }, []);

    const handleLogout = async () => {
      showDialog('confirm', 'Log out?', 'Are you sure you want to log out?', async () => {
        try {
          await signOut(auth);
          navigate('/');
        } catch (e) {
          console.error('Logout failed', e);
        }
      }, 'Log out');
    };

    const handleNavigateToMessages = (chatId = null) => {
        setActiveView('messages');
        if (chatId) {
            setActiveChatId(chatId); // Set the active chat when navigating from notification
        }
        console.log('Navigating to messages, chatId:', chatId);
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800
    });

    // Screen size detection
    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = screenSize.width <= 768;
    const isTablet = screenSize.width <= 1024 && screenSize.width > 768;

    const styles = {
        dashboardContainer: { 
            fontFamily: '"Poppins", sans-serif', 
            backgroundColor: '#F8FAFC', 
            display: 'flex', 
            minHeight: '100vh', 
            color: '#0F172A',
            flexDirection: isMobile ? 'column' : 'row',
            position: 'relative'
        },
        
        // Mobile menu overlay
        mobileMenuOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            display: isMobile && isMobileMenuOpen ? 'block' : 'none'
        },
        
        sidebar: { 
            width: isMobile ? '280px' : '250px',
            backgroundColor: '#0F172A', 
            color: '#E2E8F0', 
            padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem',
            display: 'flex', 
            flexDirection: 'column', 
            transition: 'transform 0.3s ease',
            transform: isMobile ? 
                (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') :
                (isLoaded ? 'translateX(0)' : 'translateX(-100%)'),
            position: isMobile ? 'fixed' : 'relative',
            top: isMobile ? '0' : 'auto',
            left: isMobile ? '0' : 'auto',
            height: isMobile ? '100vh' : 'auto',
            zIndex: isMobile ? 999 : 'auto',
            overflowY: 'auto'
        },
        
        sidebarHeader: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: 'bold', 
            marginBottom: isMobile ? '2rem' : '3rem',
            color: '#FFFFFF' 
        },
        
        navItem: (isActive) => ({ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: isMobile ? '1rem 0.8rem' : '0.8rem 1rem',
            borderRadius: '8px', 
            marginBottom: '0.5rem', 
            cursor: 'pointer', 
            backgroundColor: isActive ? '#1E40AF' : 'transparent', 
            color: isActive ? '#FFFFFF' : '#E2E8F0', 
            transition: 'background-color 0.2s, color 0.2s',
            fontSize: isMobile ? '0.95rem' : 'inherit'
        }),
        
        // Mobile menu button
        mobileMenuButton: {
            display: isMobile ? 'flex' : 'none',
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1000,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
        },
        
        mainContent: { 
            flex: 1, 
            padding: isMobile ? '5rem 1rem 2rem 1rem' : isTablet ? '2rem 1.5rem' : '2rem 3rem',
            opacity: isLoaded ? 1 : 0, 
            transition: 'opacity 0.5s ease 0.3s', 
            overflowY: 'auto', 
            height: '100vh',
            marginLeft: isMobile ? '0' : '0'
        },
        
        header: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: '2rem',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '1rem' : '0'
        },
        
        welcomeTitle: { 
            fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
            fontWeight: 'bold',
            lineHeight: '1.2'
        },
        
        welcomeSubtitle: { 
            color: '#475569',
            fontSize: isMobile ? '0.9rem' : '1rem'
        },
        
        // Tabs (match Freelancer Dashboard behavior)
        tabs: { 
            display: 'flex', 
            gap: isMobile ? '0.25rem' : '0.5rem',
            marginBottom: '2rem', 
            borderBottom: '1px solid #E2E8F0',
            overflowX: isMobile ? 'auto' : 'visible',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        },
        
        tabButton: (isActive) => ({ 
            padding: isMobile ? '0.7rem 1rem' : '0.8rem 1.5rem',
            border: 'none', 
            backgroundColor: 'transparent', 
            color: isActive ? '#0F172A' : '#475569', 
            cursor: 'pointer', 
            borderBottom: isActive ? '3px solid #3B82F6' : '3px solid transparent', 
            fontWeight: isActive ? '600' : '500',
            fontSize: isMobile ? '0.9rem' : '1rem',
            whiteSpace: 'nowrap',
            minWidth: isMobile ? 'auto' : 'auto'
        }),
        
        mainGrid: { 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '1.5rem' : '2rem',
            alignItems: 'start' 
        },
        
        card: (delay, gridSpan = 'span 1') => ({ 
            backgroundColor: '#FFFFFF', 
            padding: isMobile ? '1.25rem' : '1.5rem',
            borderRadius: '16px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
            opacity: 0, 
            animation: `fade-slide-up 0.6s ease ${delay} forwards`, 
            gridColumn: isMobile ? 'span 1' : gridSpan
        }),
        
        cardTitle: { 
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600', 
            marginBottom: '1rem' 
        },

        projectItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', borderRadius: '8px', transition: 'background-color 0.2s ease, transform 0.2s ease' },
        projectTitle: { fontWeight: '600' },
        projectClient: { fontSize: '0.9rem', color: '#475569' },
        projectProgress: { width: '100%', backgroundColor: '#DBEAFE', borderRadius: '8px', height: '8px' },
        progressBar: (progress) => ({ width: `${progress}%`, backgroundColor: '#3B82F6', height: '8px', borderRadius: '8px' }),
        
        messageItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 0' },
        messageAvatar: { width: '40px', height: '40px', borderRadius: '50%' },
        messageName: { fontWeight: '600' },
        messageLast: { fontSize: '0.9rem', color: '#558B2F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '150px' },
        
        tableHeader: { display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', color: '#475569', padding: '0.8rem 1.5rem', fontSize: '0.9rem', textTransform: 'uppercase' },
        tableRow: { display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '0.5rem', opacity: 0, animation: 'fade-slide-up 0.5s ease forwards' },
        statusBadge: (status) => ({
            backgroundColor: status === 'Open' ? '#DBEAFE' : '#FFCDD2',
            color: status === 'Open' ? '#0F172A' : '#B71C1C',
            padding: '0.2rem 0.8rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'inline-block'
        }),

        primaryButton: { 
            padding: isMobile ? '0.8rem 1rem' : '0.7rem 1.2rem',
            backgroundColor: '#3B82F6', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.9rem' : '0.9rem',
            fontWeight: '500', 
            cursor: 'pointer', 
            transition: 'background-color 0.3s ease',
            width: isMobile ? '100%' : 'auto'
        },
        
        secondaryButton: { 
            padding: isMobile ? '0.8rem 1rem' : '0.9rem 1.5rem',
            backgroundColor: '#EFF6FF', 
            color: '#0F172A', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: '500', 
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto'
        },
        
        postJobContainer: { 
            maxWidth: isMobile ? '100%' : '800px',
            margin: '0 auto',
            padding: isMobile ? '0' : '0 1rem'
        },
        
        categoryGrid: { 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: isMobile ? '0.75rem' : '1rem',
            marginBottom: '2rem' 
        },
        
        categoryCard: (isSelected) => ({ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '12px', 
            cursor: 'pointer', 
            border: isSelected ? '2px solid #3B82F6' : '2px solid #E2E8F0', 
            backgroundColor: isSelected ? '#FFFFFF' : '#F1F5F9', 
            transform: isSelected ? 'scale(1.05)' : 'scale(1)', 
            transition: 'all 0.2s ease',
            fontSize: isMobile ? '0.85rem' : '1rem'
        }),
        
        formGrid: { 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '1rem' : '1.5rem' 
        },
        
        formLabel: { 
            fontWeight: '600', 
            marginBottom: '0.5rem', 
            display: 'block',
            fontSize: isMobile ? '0.9rem' : '1rem'
        },
        
        input: { 
            width: '100%', 
            padding: isMobile ? '0.8rem' : '0.9rem 1rem',
            border: '1px solid #CBD5E1', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.95rem' : '1rem',
            boxSizing: 'border-box' 
        },
        
        textarea: { 
            width: '100%', 
            padding: isMobile ? '0.8rem' : '0.9rem 1rem',
            border: '1px solid #CBD5E1', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.95rem' : '1rem',
            boxSizing: 'border-box', 
            resize: 'vertical',
            minHeight: isMobile ? '100px' : '120px'
        },

        freelancerGrid: { 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: isMobile ? '1.5rem' : '2rem' 
        },
        freelancerAvatar: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '4px solid #FFFFFF', boxShadow: '0 0 10px rgba(0,0,0,0.1)' },
        freelancerName: { fontWeight: 'bold', fontSize: '1.2rem' },
        freelancerTitle: { fontSize: '0.9rem', color: '#475569' },
        tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
        tag: { backgroundColor: '#EFF6FF', color: '#1E3A8A', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem' },

        proposalItem: (isActive) => ({ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', borderRadius: '8px', cursor: 'pointer', backgroundColor: isActive ? '#EFF6FF' : 'transparent', border: isActive ? '1px solid #CBD5E1' : '1px solid transparent' }),
        
        modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(29, 78, 216, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, animation: 'fade-in 0.3s' },
        modalContent: { backgroundColor: '#FFFFFF', borderRadius: '16px', width: '90%', maxWidth: '600px', padding: '2rem', animation: 'fade-slide-up 0.4s ease forwards', position: 'relative', overflow: 'hidden', minHeight: '400px' },
        modalCloseButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569' },
        modalTitle: { fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' },
        projectDetailPanel: { position: 'fixed', top: 0, right: 0, height: '100%', width: '450px', backgroundColor: '#FFFFFF', boxShadow: '-5px 0 20px rgba(0,0,0,0.1)', animation: 'slide-in-right 0.4s ease forwards', padding: '2rem', boxSizing: 'border-box', overflowY: 'auto' },
        milestoneItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 0', borderBottom: '1px solid #E8F5E9' },
        milestoneStatus: (status) => ({ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: '500', color: status === 'Completed' ? '#3B82F6' : '#475569' }),
        fileList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
        
        messageBubble: (isSender) => ({ alignSelf: isSender ? 'flex-end' : 'flex-start', backgroundColor: isSender ? '#3B82F6' : '#EFF6FF', color: isSender ? '#FFFFFF' : '#0F172A', padding: '0.75rem 1rem', borderRadius: '16px', maxWidth: '70%' }),
        messageArea: { flex: 1, padding: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' },
        messageInputContainer: { display: 'flex', padding: '1rem 0 0', borderTop: '1px solid #E8F5E9' },
        messageInput: { flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.75rem', outline: 'none' },
        sendButton: { border: 'none', backgroundColor: '#3B82F6', color: '#FFFFFF', borderRadius: '8px', padding: '0.75rem', marginLeft: '0.5rem', cursor: 'pointer' },
        chatWindow: { flex: 1, display: 'flex', flexDirection: 'column' },
        chatHeader: { paddingBottom: '1rem', borderBottom: '1px solid #E8F5E9' },
        
        // Settings View
        passwordInputContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
        eyeButton: { position: 'absolute', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#558B2F' },
        notificationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #E8F5E9' },
        notificationLabel: { fontWeight: '600' },
        notificationDesc: { fontSize: '0.9rem', color: '#558B2F' },
    };

    const keyframes = `
        /* Core Animations */
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideInUp { 
            from { opacity: 0; transform: translateY(30px) scale(0.95); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes slideInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        /* Advanced Animations for Browse Freelancers */
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
            40%, 43% { transform: translate3d(0, -30px, 0); }
            70% { transform: translate3d(0, -15px, 0); }
            90% { transform: translate3d(0, -4px, 0); }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.5) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        @keyframes heartbeat {
            0% { transform: scale(1); }
            14% { transform: scale(1.3); }
            28% { transform: scale(1); }
            42% { transform: scale(1.3); }
            70% { transform: scale(1); }
        }
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        /* Hover Effects */
        .nav-item-hover:hover { 
            background-color: #1E40AF; 
            transform: translateX(5px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .table-row:hover { 
            background-color: #F1F5F9; 
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        /* Component Animations */
        .form-section { 
            opacity: 0; 
            animation: fade-slide-up 0.5s ease forwards; 
            margin-bottom: 2.5rem; 
        }
        .freelancer-card { 
            opacity: 0; 
            animation: zoomIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; 
            background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
            border-radius: 20px; 
            padding: 2rem; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
            text-align: center;
            border: 2px solid #F1F5F9;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            overflow: hidden;
        }
        .freelancer-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border-color: #6366F1;
        }
        .freelancer-card:hover .project-overlay {
            opacity: 1;
        }
        
        .proposal-item { 
            opacity: 0; 
            animation: slideInLeft 0.5s ease forwards; 
            transition: all 0.3s ease;
        }
        .proposal-item:hover { 
            background-color: #F0F9FF; 
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        
        .project-item-hover:hover { 
            background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); 
            cursor: pointer; 
            transform: scale(1.02) translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
            border-radius: 12px;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .message-bubble { 
            animation: slideInUp 0.4s ease forwards; 
            opacity: 0; 
        }
        
        .form-row { 
            opacity: 0; 
            animation: slideInUp 0.5s ease forwards; 
        }
        
        .file-item { 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
            padding: 0.5rem; 
            border-radius: 8px; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            cursor: pointer; 
        }
        .file-item:hover { 
            background-color: #EFF6FF; 
            transform: translateX(3px);
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }
        
        .category-card-hover:hover { 
            transform: scale(1.05) translateY(-3px); 
            border-color: #6366F1; 
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.2);
            background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
        }
        
        .modal-view { 
            animation: scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
        }
        
        /* Enhanced Portfolio Animations */
        .portfolio-section {
            animation: fadeInUp 0.8s ease forwards;
        }
        
        .skill-pill {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .skill-pill:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        
        /* Loading Animations */
        .loading-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        
        /* Page Entry Animations */
        .page-enter {
            animation: slideInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Search and Filter Animations */
        .search-bar {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-bar:focus {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
        }
        
        /* Button Animations */
        .animated-button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        .animated-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        .animated-button:active {
            transform: translateY(0);
            transition: transform 0.1s;
        }
        
        /* Stats Counter Animation */
        .stat-counter {
            animation: heartbeat 1.5s ease-in-out infinite 2s;
        }
        
        /* Background Gradients */
        .gradient-bg {
            background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
        }
    `;

    const renderView = () => {
        switch(activeView) {
            case 'post-job': return <PostJobView styles={styles} showDialog={showDialog} />;
            case 'browse': return <BrowseFreelancersView styles={styles} setActiveView={setActiveView} />;
            case 'proposals': return <ViewProposalsView styles={styles} showDialog={showDialog} />;
            case 'manage': return <ManageProjectView styles={styles} />;
            case 'messages': return <MessagesView styles={styles} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />;
            case 'notifications': return <NotificationsView styles={styles} setActiveView={setActiveView} />;
            case 'profile': return <ProfileView styles={styles} />;
            case 'settings': return <SettingsView styles={styles} />;
            case 'dashboard':
            default:
                return <ClientDashboardView styles={styles} setActiveView={setActiveView} />;
        }
    }

    return (
        <>
        <style>{keyframes}</style>
        <NotificationManager 
            onNavigateToMessages={handleNavigateToMessages} 
            activeChatId={activeView === 'messages' ? activeChatId : null}
        />
        <SimpleModal
            isOpen={dialog.open}
            onClose={closeDialog}
            onConfirm={dialog.onConfirm}
            type={dialog.type}
            title={dialog.title}
            message={dialog.message}
            confirmLabel={dialog.confirmLabel}
        />
        
        {/* Mobile Menu Button */}
        <button 
            style={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        
        {/* Mobile Menu Overlay */}
        <div 
            style={styles.mobileMenuOverlay}
            onClick={() => setIsMobileMenuOpen(false)}
        />
        
        <div style={styles.dashboardContainer}>
            <aside style={styles.sidebar}>
                <div style={styles.sidebarHeader}><FlexwrkLogo /><span>FLEXwrk</span></div>
                <div style={styles.navItem(activeView === 'dashboard')} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }}><DashboardIcon /><span>Dashboard</span></div>
                <div style={styles.navItem(activeView === 'post-job')} className="nav-item-hover" onClick={() => { setActiveView('post-job'); setIsMobileMenuOpen(false); }}><PostJobIcon /><span>Post a Job</span></div>
                <div style={styles.navItem(activeView === 'browse')} className="nav-item-hover" onClick={() => { setActiveView('browse'); setIsMobileMenuOpen(false); }}><BrowseIcon /><span>Browse Freelancers</span></div>
                <div style={styles.navItem(activeView === 'proposals')} className="nav-item-hover" onClick={() => { setActiveView('proposals'); setIsMobileMenuOpen(false); }}><ProposalsIcon /><span>View Proposals</span></div>
                <div style={styles.navItem(activeView === 'manage')} className="nav-item-hover" onClick={() => { setActiveView('manage'); setIsMobileMenuOpen(false); }}><ProjectsIcon /><span>Manage Projects</span></div>
                <div style={styles.navItem(activeView === 'messages')} className="nav-item-hover" onClick={() => { setActiveView('messages'); setIsMobileMenuOpen(false); }}><MessageIcon /><span>Messages</span></div>
                <div style={styles.navItem(activeView === 'profile')} className="nav-item-hover" onClick={() => { setActiveView('profile'); setIsMobileMenuOpen(false); }}><ProfileIcon /><span>Profile</span></div>
                <div style={{ marginTop: 'auto' }}>
                    {!isGoogleUser && (
                        <div style={styles.navItem(activeView === 'settings')} className="nav-item-hover" onClick={() => { setActiveView('settings'); setIsMobileMenuOpen(false); }}><SettingsIcon /><span>Settings</span></div>
                    )}
                    <div style={styles.navItem(false)} className="nav-item-hover" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}><LogoutIcon /><span>Log Out</span></div>
                </div>
            </aside>
            <main style={styles.mainContent}>
                {renderView()}
            </main>
        </div>
        </>
    );
}

