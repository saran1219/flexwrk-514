import React, { useState, useEffect } from 'react';
import EnhancedChatPanel from '../components/EnhancedChatPanel.jsx';
import NotificationManager from '../components/NotificationManager.jsx';
import { useNavigate } from 'react-router-dom';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth, db, storage } from '../firebase.js';
import { collection, query, where, onSnapshot, orderBy, addDoc, doc, setDoc, getDoc, getDocs, serverTimestamp, updateDoc, deleteDoc, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadMessageAttachment, formatFileSize, isFileTypeAllowed } from '../utils/messagingApi.js';

// --- SVG Icon Components ---
const FlexwrkLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg">
         <defs>
            <linearGradient id="dashGradBlue" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#1e3a8a" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
            <linearGradient id="dashGradGreen" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#22c55e" /></linearGradient>
            <linearGradient id="dashGradCyan" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient>
        </defs>
        <path d="M15 10 C 25 50, 35 50, 45 10 L 40 70 L 20 70 Z" fill="url(#dashGradBlue)" />
        <path d="M75 10 C 65 50, 55 50, 45 10 L 50 70 L 70 70 Z" fill="url(#dashGradGreen)" opacity="0.9" />
        <path d="M40 40 L 60 10 L 80 40 L 60 70 Z" fill="url(#dashGradCyan)" opacity="0.8" />
    </svg>
);
const DashboardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const ProjectsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
const PortfolioIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const MessageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const SettingsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const LogoutIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const SendIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>;
const BriefcaseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const BookmarkIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const PenToolIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"></path><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="m2 2 7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>;
const VideoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const CodeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
const ImageIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const ScissorsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>;
const MusicIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;
const MegaphoneIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>;
const HeadphoneIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>;

// --- Utility Functions ---
const getDefaultAvatar = (name = 'User') => {
    const cleanName = name.trim() || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&size=200&background=667eea&color=fff&bold=true`;
};

// --- Skill Categories ---
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

// --- Mock Data ---
const freelancer = {
    name: '',
    email: '',
    title: '',
    location: '',
    hourlyRate: 0,
    bio: '',
    avatar: '',
    stats: { earnings: 0, projects: 0 },
    allProjects: [],
    portfolio: [],
    messages: [],
    jobListings: []
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
            case 'segment_approved':
            case 'segment_rejected':
            case 'completion_rejected':
                setActiveView('manage');
                break;
            case 'proposal_accepted':
            case 'proposal_rejected':
                setActiveView('projects');
                break;
            case 'job_posted':
            case 'new_job_match':
                setActiveView('find-jobs');
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
                                    cursor: ['message', 'segment_approved', 'segment_rejected', 'completion_rejected', 'proposal_accepted', 'proposal_rejected', 'job_posted', 'new_job_match'].includes(notification.type) ? 'pointer' : 'default',
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
                                    if (['message', 'segment_approved', 'segment_rejected', 'completion_rejected', 'proposal_accepted', 'proposal_rejected', 'job_posted', 'new_job_match'].includes(notification.type)) {
                                        e.currentTarget.style.transform = 'translateX(5px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (['message', 'segment_approved', 'segment_rejected', 'completion_rejected', 'proposal_accepted', 'proposal_rejected', 'job_posted', 'new_job_match'].includes(notification.type)) {
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
const FreelancerDashboardView = ({ styles, setActiveView }) => {
    const [profile, setProfile] = useState({ name: '', avatar: '', stats: { earnings: 0, projects: 0 } });
    const [activeProjects, setActiveProjects] = useState([]);
    const [completedProjects, setCompletedProjects] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [projectSegments, setProjectSegments] = useState({}); // Store segments by project ID

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (uid) {
            // Real-time listener for user profile to catch rating updates
            const unsubProfile = onSnapshot(
                doc(db, 'users', uid),
                (snap) => {
                    if (snap.exists()) {
                        const d = snap.data();
                        const userName = d.name || 'Freelancer';
                        setProfile(prev => ({
                            name: userName,
                            avatar: d.photoUrl || getDefaultAvatar(userName),
                            stats: {
                                ...prev.stats,
                                ...(d.stats || {})
                            }
                        }));
                    }
                },
                (err) => console.error('Failed to listen to profile updates:', err)
            );
            
            const unsubProjects = onSnapshot(
                query(collection(db, 'projects'), where('freelancerId', '==', uid)),
                (snap) => {
                    const allProjects = snap.docs.map(x=>({ id: x.id, ...x.data() }));
                    const active = allProjects.filter(p => p.status === 'Active');
                    const completed = allProjects.filter(p => p.status === 'Completed');
                    
                    // Calculate total earnings from completed projects
                    const totalEarnings = completed.reduce((sum, project) => {
                        return sum + (Number(project.budget) || 0);
                    }, 0);
                    
                    // Update profile with calculated earnings
                    setProfile(prev => ({
                        ...prev,
                        stats: {
                            ...prev.stats,
                            earnings: totalEarnings
                        }
                    }));
                    
                    setActiveProjects(active);
                    setCompletedProjects(completed);
                },
                (err) => console.error('Freelancer Dashboard projects query failed:', err)
            );
            // Load recent notifications with loading state and debugging
            setNotificationsLoading(true);
            // Load notifications for current user
            const simpleNotificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', uid)
            );

            let unsubNotifs = onSnapshot(
                simpleNotificationsQuery,
                (snapshot) => {
                    const notificationsList = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            createdAt: data.createdAt?.toDate() || new Date()
                        };
                    });
                    
                    // Sort by createdAt desc and limit to 5
                    const sortedNotifications = notificationsList
                        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
                        .slice(0, 5);
                    
                    setNotifications(sortedNotifications);
                    setNotificationsLoading(false);
                },
                (error) => {
                    console.error('Notifications query failed:', error);
                    setNotificationsLoading(false);
                    setNotifications([]);
                }
            );
            return () => { unsubProfile(); unsubProjects(); unsubNotifs(); };
        }
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

    const handleNotificationClick = (notification) => {
        console.log('Notification clicked:', notification);
        console.log('Notification type:', notification.type);
        
        // Mark as read when clicked
        if (!notification.read) {
            updateDoc(doc(db, 'notifications', notification.id), { read: true })
                .catch(e => console.error('Failed to mark notification as read', e));
        }
        
        // Navigate based on notification type
        switch (notification.type) {
            case 'message':
                if (notification.chatId) {
                    console.log('Navigating to messages');
                    setActiveView('messages');
                }
                break;
            case 'completion_rejected':
            case 'segment_approved':
            case 'segment_rejected':
            case 'segment_revision_requested':
            case 'project_assigned':
            case 'project_completed':
                console.log('Navigating to manage projects');
                setActiveView('manage');
                break;
            case 'proposal_accepted':
            case 'proposal_rejected':
                console.log('Navigating to my projects');
                setActiveView('projects');
                break;
            case 'job_posted':
            case 'new_job_match':
                console.log('Navigating to find jobs');
                setActiveView('find-jobs');
                break;
            default:
                console.log('Unknown notification type:', notification.type);
                break;
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.read);
            await Promise.all(unreadNotifications.map(n => 
                updateDoc(doc(db, 'notifications', n.id), { read: true })
            ));
        } catch (e) {
            console.error('Failed to mark notifications as read', e);
        }
    };

    // Debug function to create a test notification
    const createTestNotification = async () => {
        try {
            const uid = auth.currentUser?.uid;
            if (!uid) {
                console.error('No authenticated user found');
                return;
            }
            
            console.log('Creating test notification for user:', uid);
            
            const notificationData = {
                userId: uid,
                type: 'message',
                text: 'Test notification from system - this is a sample message',
                senderName: 'Test System',
                createdAt: serverTimestamp(),
                read: false
            };
            
            const docRef = await addDoc(collection(db, 'notifications'), notificationData);
            console.log('Test notification created successfully with ID:', docRef.id);
            alert('✅ Test notification created! Check the notifications section.');
        } catch (error) {
            console.error('Failed to create test notification:', error);
            alert('❌ Failed to create test notification: ' + error.message);
        }
    };

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
                        src={profile.avatar || getDefaultAvatar(profile.name)} 
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
                        }}>Welcome back, {profile.name || 'Freelancer'}!</h1>
                        <p style={{
                            color: '#64748B',
                            fontSize: '0.95rem',
                            margin: 0
                        }}>Here's your performance snapshot. Keep up the great work!</p>
                    </div>
                </div>
                <button 
                    style={{
                        background: '#3B82F6',
                        border: 'none',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                    onClick={() => setActiveView('find-jobs')}
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
                    Browse New Jobs
                </button>
            </div>
        </header>
        
        {/* Main Content Grid - Active Projects (Left) and Notifications (Right) */}
        <div style={{
            display: 'grid',
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
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
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
                        onClick={() => setActiveView('projects')}
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
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                        <p style={{ margin: 0, fontSize: '1rem' }}>No active projects yet</p>
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
                                Client: {p.clientName || 'Unknown'}
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
            <div style={{...styles.card('0.4s')}}>
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
                                    cursor: ['message', 'completion_rejected', 'segment_approved', 'segment_rejected', 'segment_revision_requested', 'project_assigned', 'project_completed', 'proposal_accepted', 'proposal_rejected', 'job_posted', 'new_job_match'].includes(notification.type) ? 'pointer' : 'default',
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
                                    if (['message', 'completion_rejected', 'segment_approved', 'segment_rejected', 'segment_revision_requested', 'project_assigned', 'project_completed', 'proposal_accepted', 'proposal_rejected', 'job_posted', 'new_job_match'].includes(notification.type)) {
                                        e.currentTarget.style.transform = 'translateX(3px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (['message', 'completion_rejected', 'segment_approved', 'segment_rejected', 'segment_revision_requested', 'project_assigned', 'project_completed', 'proposal_accepted', 'proposal_rejected', 'job_posted', 'new_job_match'].includes(notification.type)) {
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
                                        notification.type === 'completion_rejected' ?
                                        'linear-gradient(135deg, #EF4444, #DC2626)' :
                                        'linear-gradient(135deg, #10B981, #059669)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    flexShrink: 0
                                }}>
                                    {notification.type === 'message' ? '💬' : notification.type === 'completion_rejected' ? '❌' : '🔔'}
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
                        
                        {/* Mark all as read button */}
                        {notifications.some(n => !n.read) && (
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <button 
                                    style={{
                                        ...styles.primaryButton,
                                        fontSize: '0.85rem',
                                        padding: '0.5rem 1rem'
                                    }} 
                                    onClick={markAllAsRead}
                                >
                                    Mark all as read
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        
        {/* Statistics Cards - After Active Projects and Notifications */}
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        }}>
            {/* Active Projects Stat Card */}
            <div style={{
                background: '#FFFFFF',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: '1rem'
                }}>🚀</div>
                <h3 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#1E293B',
                    margin: '0 0 0.25rem 0'
                }}>{activeProjects.length}</h3>
                <p style={{
                    color: '#64748B',
                    fontSize: '0.875rem',
                    margin: 0,
                    fontWeight: '500'
                }}>Active Projects</p>
            </div>
            
            {/* Completed Projects Stat Card */}
            <div style={{
                background: '#FFFFFF',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: '1rem'
                }}>✅</div>
                <h3 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#1E293B',
                    margin: '0 0 0.25rem 0'
                }}>{completedProjects.length}</h3>
                <p style={{
                    color: '#64748B',
                    fontSize: '0.875rem',
                    margin: 0,
                    fontWeight: '500'
                }}>Completed Projects</p>
            </div>
            
            {/* Total Earnings Stat Card */}
            <div style={{
                background: '#FFFFFF',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: '1rem'
                }}>💰</div>
                <h3 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#1E293B',
                    margin: '0 0 0.25rem 0'
                }}>
                    ${(() => {
                        const earnings = Number(profile.stats.earnings || 0);
                        if (earnings >= 1000) {
                            return (earnings / 1000).toFixed(1) + 'k';
                        }
                        return earnings.toLocaleString();
                    })()}
                </h3>
                <p style={{
                    color: '#64748B',
                    fontSize: '0.875rem',
                    margin: 0,
                    fontWeight: '500'
                }}>Total Earnings</p>
            </div>
        </div>
    </div>
    );
};

const ProjectsView = ({ styles }) => {
    const [filter, setFilter] = useState('Active');
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        // Fetch all projects assigned to this freelancer
        // Expects documents in /projects with fields: title, clientName, budget, status, freelancerId
        const unsub = onSnapshot(
            query(collection(db, 'projects'), where('freelancerId', '==', auth.currentUser?.uid || 'none')),
            (snap) => setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
        return () => unsub();
    }, []);

    const filtered = projects.filter(p => p.status === filter);

    return (
        <div>
            <header style={styles.header}><h1 style={styles.welcomeTitle}>My Projects</h1></header>
            <div style={styles.tabs}>
                {['Active', 'Completed'].map(tab => (
                    <button key={tab} style={styles.tabButton(filter === tab)} onClick={() => setFilter(tab)}>{tab}</button>
                ))}
            </div>
            <div style={{...styles.card('0.2s', 'span 3'), ...styles.projectTable}}>
                <div style={styles.tableHeader}><span>Project</span><span>Client</span><span>Budget</span><span>Status</span></div>
                {filtered.map((p, i) => (
                    <div style={{...styles.tableRow, animationDelay: `${0.3 + i*0.1}s`}} className="table-row" key={p.id}>
                        <p style={styles.projectTitle}>{p.title || 'Untitled'}</p>
                        <p>{p.clientName || '—'}</p>
                        <p>{p.budget ? `$${Number(p.budget).toLocaleString()}` : '—'}</p>
                        <p>{p.status}</p>
                    </div>
                ))}
                {filtered.length === 0 && <p style={{padding: '1rem', color: '#558B2F'}}>No {filter.toLowerCase()} projects.</p>}
            </div>
        </div>
    );
};

const PortfolioView = ({ styles, showDialog }) => {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchPortfolioItems = async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            
            try {
                // Fetch portfolio projects from the projects collection
                const q = query(
                    collection(db, 'projects'),
                    where('freelancerId', '==', uid),
                    where('isPortfolioItem', '==', true)
                );
                
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const projects = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setPortfolioItems(projects);
                    setLoading(false);
                });
                
                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching portfolio items:', error);
                setLoading(false);
            }
        };
        
        fetchPortfolioItems();
    }, []);

    const openProjectModal = (project) => {
        setSelectedProject(project);
    };

    const closeProjectModal = () => {
        setSelectedProject(null);
    };
    
    const deletePortfolioItem = async (projectId, e) => {
        // Prevent modal from opening when clicking delete
        e.stopPropagation();
        
        showDialog('confirm', 'Delete portfolio project?', 'This action cannot be undone.', async () => {
        
        setDeletingId(projectId);
        try {
            await deleteDoc(doc(db, 'projects', projectId));
            // The portfolio items will be updated automatically through the onSnapshot listener
        } catch (error) {
            console.error('Error deleting portfolio project:', error);
            showDialog('error', 'Delete failed', 'Failed to delete portfolio project. Please try again.');
        } finally {
            setDeletingId(null);
        }
        });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#558B2F' }}>Loading portfolio...</p>
            </div>
        );
    }

    return (
        <div>
            <header style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
                borderRadius: '20px',
                padding: '3rem 2.5rem',
                marginBottom: '2.5rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {/* Professional background patterns */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                    opacity: 0.7
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(59, 130, 246, 0.1))',
                    borderRadius: '20px',
                    transform: 'rotate(15deg)',
                    animation: 'float 6s ease-in-out infinite'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '100px',
                    height: '100px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '50%',
                    animation: 'pulse 4s ease-in-out infinite'
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.8rem',
                                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
                                }}>💼</div>
                                <div>
                                    <h1 style={{
                                        color: '#FFFFFF',
                                        fontSize: '3rem',
                                        fontWeight: '800',
                                        margin: '0',
                                        letterSpacing: '-0.02em',
                                        lineHeight: '1'
                                    }}>Portfolio</h1>
                                    <div style={{
                                        width: '80px',
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                                        borderRadius: '2px',
                                        marginTop: '0.5rem'
                                    }}></div>
                                </div>
                            </div>
                            <p style={{ 
                                color: 'rgba(255, 255, 255, 0.8)', 
                                margin: 0,
                                fontSize: '1.2rem',
                                fontWeight: '400',
                                lineHeight: '1.6',
                                maxWidth: '500px'
                            }}>Showcase your professional work and attract high-value clients with stunning project presentations</p>
                        </div>
                
                        <button 
                            style={{
                                background: 'linear-gradient(135deg, #FFFFFF, #F1F5F9)',
                                color: '#0F172A',
                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                padding: '1rem 2rem',
                                borderRadius: '16px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                zIndex: 2,
                                backdropFilter: 'blur(20px)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={() => setShowAddModal(true)}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                                e.target.style.background = 'linear-gradient(135deg, #FFFFFF, #E2E8F0)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                                e.target.style.background = 'linear-gradient(135deg, #FFFFFF, #F1F5F9)';
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            New Project
                        </button>
                    </div>
                </div>
            </header>
            
            {portfolioItems.length === 0 ? (
                <div style={{
                    ...styles.card('0.2s', 'span 3'), 
                    textAlign: 'center', 
                    padding: '4rem 2rem',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                    border: '1px solid #E2E8F0',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
                        borderRadius: '20px',
                        transform: 'rotate(15deg)',
                        opacity: 0.5,
                        animation: 'float 8s ease-in-out infinite'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #E2E8F0, #CBD5E1)',
                        borderRadius: '50%',
                        opacity: 0.3,
                        animation: 'pulse 6s ease-in-out infinite'
                    }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem',
                            fontSize: '3rem',
                            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
                            animation: 'pulse 3s ease-in-out infinite'
                        }}>📂</div>
                        
                        <h3 style={{ 
                            color: '#0F172A', 
                            marginBottom: '1rem',
                            fontSize: '2.25rem',
                            fontWeight: '800',
                            letterSpacing: '-0.025em'
                        }}>Build Your Portfolio</h3>
                        
                        <p style={{ 
                            color: '#64748B', 
                            marginBottom: '2.5rem',
                            fontSize: '1.125rem',
                            maxWidth: '500px',
                            margin: '0 auto 2.5rem auto',
                            lineHeight: '1.7',
                            fontWeight: '400'
                        }}>Transform your work into compelling case studies that showcase your expertise and attract premium clients.</p>
                        <button 
                            style={{
                                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
                                transform: 'translateY(0)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            onClick={() => setShowAddModal(true)}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                                e.target.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)';
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                            Create First Project
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '1rem'
                }}>
                    {portfolioItems.map((project, i) => (
                        <div 
                            key={project.id} 
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                animationDelay: `${0.2 + i * 0.1}s`,
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                opacity: 0,
                                animation: `slideInUp 0.6s ease ${0.2 + i * 0.1}s forwards`
                            }}
                            onClick={() => openProjectModal(project)}
                            className="portfolio-card"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-12px)';
                                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                                e.currentTarget.style.borderColor = '#6366F1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                e.currentTarget.style.borderColor = '#E2E8F0';
                            }}
                        >
                            {/* Delete Button */}
                            <button
                                onClick={(e) => deletePortfolioItem(project.id, e)}
                                disabled={deletingId === project.id}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: deletingId === project.id ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    cursor: deletingId === project.id ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    zIndex: 10,
                                    transition: 'all 0.2s ease',
                                    opacity: 0.8
                                }}
                                onMouseEnter={(e) => {
                                    if (deletingId !== project.id) {
                                        e.target.style.background = 'rgba(239, 68, 68, 0.9)';
                                        e.target.style.opacity = '1';
                                        e.target.style.transform = 'scale(1.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (deletingId !== project.id) {
                                        e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                                        e.target.style.opacity = '0.8';
                                        e.target.style.transform = 'scale(1)';
                                    }
                                }}
                                title={deletingId === project.id ? 'Deleting...' : 'Delete portfolio project'}
                            >
                                {deletingId === project.id ? '⏳' : '🗑️'}
                            </button>
                            
                            {/* Professional hover overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                pointerEvents: 'none',
                                zIndex: 1
                            }} className="portfolio-hover-overlay"></div>
                            <div style={{
                                width: '100%',
                                height: '240px',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '0',
                                marginBottom: '0',
                                backgroundImage: project.imageUrl ? `url(${project.imageUrl})` : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                zIndex: 2
                            }}>
                                {!project.imageUrl && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: 'white',
                                        fontSize: '3rem',
                                        opacity: 0.7
                                    }}>
                                        📁
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(transparent, rgba(30, 64, 175, 0.8))',
                                    padding: '2rem 1rem 0.75rem',
                                    color: 'white',
                                    transform: 'translateY(100%)',
                                    transition: 'transform 0.3s ease'
                                }} className="project-overlay">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        🔍 <span>Click to view details</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Card Content */}
                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{
                                    color: '#0F172A',
                                    marginBottom: '0.75rem',
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    lineHeight: '1.3',
                                    letterSpacing: '-0.025em'
                                }}>
                                    {project.title || 'Untitled Project'}
                                </h3>
                            
                                <p style={{
                                    color: '#64748B',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.6',
                                    marginBottom: '1.25rem',
                                    display: '-webkit-box',
                                    '-webkit-line-clamp': 2,
                                    '-webkit-box-orient': 'vertical',
                                    overflow: 'hidden',
                                    fontWeight: '400'
                                }}>
                                {project.description || 'Professional project showcasing innovative solutions and creative excellence.'}
                            </p>
                            
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    {(project.technologies || project.skills || []).slice(0, 3).map((tech, idx) => (
                                        <span key={idx} style={{
                                            padding: '0.375rem 0.75rem',
                                            backgroundColor: '#F1F5F9',
                                            color: '#475569',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            letterSpacing: '0.025em'
                                        }}>
                                            {tech}
                                        </span>
                                    ))}
                                {(project.technologies || project.skills || []).length > 3 && (
                                    <span style={{
                                        padding: '0.3rem 0.8rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#6b7280',
                                        borderRadius: '15px',
                                        fontSize: '0.8rem'
                                    }}>
                                        +{(project.technologies || project.skills || []).length - 3}
                                    </span>
                                )}
                            </div>
                            
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid #F1F5F9'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#64748B',
                                        fontSize: '0.875rem',
                                        fontWeight: '500'
                                    }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: '#10B981',
                                            borderRadius: '50%'
                                        }}></div>
                                        {project.clientName || 'Portfolio Project'}
                                    </div>
                                    
                                    <span style={{ 
                                        color: '#6366F1',
                                        backgroundColor: '#F0F9FF',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        border: '1px solid #E0F2FE'
                                    }}>
                                        {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'View Details'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {selectedProject && (
                <ProjectDetailModal 
                    project={selectedProject} 
                    onClose={closeProjectModal} 
                    styles={styles} 
                />
            )}
            
            {showAddModal && (
                <AddProjectModal 
                    onClose={() => setShowAddModal(false)} 
                    styles={styles} 
                />
            )}
        </div>
    );
};

const ProjectDetailModal = ({ project, onClose, styles }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: '#6b7280',
                        zIndex: 10
                    }}
                >
                    <XIcon />
                </button>
                
                {/* Hero Image */}
                <div style={{
                    width: '100%',
                    height: '300px',
                    backgroundColor: '#f8fafc',
                    backgroundImage: project.imageUrl ? `url(${project.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '12px 12px 0 0',
                    position: 'relative'
                }}>
                    {!project.imageUrl && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontSize: '4rem',
                            opacity: 0.7
                        }}>
                            📁
                        </div>
                    )}
                </div>
                
                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    {/* Title and Technologies */}
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#558B2F',
                        marginBottom: '1rem',
                        lineHeight: '1.2'
                    }}>
                        {project.title || 'Untitled Project'}
                    </h2>
                    
                    <p style={{
                        color: '#6b7280',
                        fontSize: '1.1rem',
                        lineHeight: '1.6',
                        marginBottom: '2rem'
                    }}>
                        {project.description || 'No description available.'}
                    </p>
                    
                    {/* Technologies */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '2rem'
                    }}>
                        {(project.technologies || project.skills || []).map((tech, idx) => (
                            <span key={idx} style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#e8f5e9',
                                color: '#558B2F',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                    
                    {/* Project Details Sections */}
                    {project.challenge && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{
                                fontSize: '1.3rem',
                                fontWeight: '600',
                                color: '#558B2F',
                                marginBottom: '0.75rem'
                            }}>
                                The Challenge
                            </h3>
                            <p style={{
                                color: '#4b5563',
                                fontSize: '1rem',
                                lineHeight: '1.7'
                            }}>
                                {project.challenge}
                            </p>
                        </div>
                    )}
                    
                    {project.solution && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{
                                fontSize: '1.3rem',
                                fontWeight: '600',
                                color: '#558B2F',
                                marginBottom: '0.75rem'
                            }}>
                                The Solution
                            </h3>
                            <p style={{
                                color: '#4b5563',
                                fontSize: '1rem',
                                lineHeight: '1.7'
                            }}>
                                {project.solution}
                            </p>
                        </div>
                    )}
                    
                    {project.results && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{
                                fontSize: '1.3rem',
                                fontWeight: '600',
                                color: '#558B2F',
                                marginBottom: '0.75rem'
                            }}>
                                The Results
                            </h3>
                            <p style={{
                                color: '#4b5563',
                                fontSize: '1rem',
                                lineHeight: '1.7'
                            }}>
                                {project.results}
                            </p>
                        </div>
                    )}
                    
                    {/* Project Meta Information */}
                    <div style={{
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '1.5rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Client</h4>
                            <p style={{ fontSize: '1rem', color: '#374151' }}>{project.clientName || 'Client'}</p>
                        </div>
                        
                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Budget</h4>
                            <p style={{ fontSize: '1rem', color: '#374151' }}>
                                {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'Not disclosed'}
                            </p>
                        </div>
                        
                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Duration</h4>
                            <p style={{ fontSize: '1rem', color: '#374151' }}>
                                {project.duration || 'Not specified'}
                            </p>
                        </div>
                        
                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Status</h4>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                {project.status || 'Completed'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Project Link */}
                    {project.projectUrl && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <a 
                                href={project.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                    ...styles.primaryButton,
                                    display: 'inline-block',
                                    textDecoration: 'none',
                                    color: 'white'
                                }}
                            >
                                🔗 View Live Project
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AddProjectModal = ({ onClose, styles }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        challenge: '',
        solution: '',
        results: '',
        technologies: [],
        projectUrl: '',
        duration: '',
        budget: '',
        imageUrl: ''
    });
    const [techInput, setTechInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    
    const addTechnology = () => {
        if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, techInput.trim()]
            }));
            setTechInput('');
        }
    };
    
    const removeTechnology = (tech) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter(t => t !== tech)
        }));
    };
    
    const handleImageSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB.');
            return;
        }
        
        setSelectedFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };
    
    const uploadImage = async () => {
        if (!selectedFile) return null;
        
        setUploadingImage(true);
        try {
            const uid = auth.currentUser?.uid;
            const fileName = `portfolio/${uid}/${Date.now()}_${selectedFile.name}`;
            const storageRef = ref(storage, fileName);
            
            await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(storageRef);
            
            setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };
    
    const removeImage = () => {
        setSelectedFile(null);
        setImagePreview('');
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };
    
    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert('Please enter a project title.');
            return;
        }
        
        setSaving(true);
        try {
            const uid = auth.currentUser?.uid;
            if (!uid) throw new Error('Not authenticated');
            
            // Upload image first if selected
            let imageUrl = formData.imageUrl;
            if (selectedFile && !imageUrl) {
                imageUrl = await uploadImage();
                if (!imageUrl) {
                    setSaving(false);
                    return; // Stop if image upload failed
                }
            }
            
            // Get freelancer info
            let freelancerName = '';
            try {
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    freelancerName = userDoc.data().name || '';
                }
            } catch (error) {
                console.warn('Could not fetch freelancer name:', error);
            }
            
            const portfolioProjectData = {
                ...formData,
                imageUrl: imageUrl || '',
                freelancerId: uid,
                freelancerName,
                status: 'Completed', // This is for portfolio items
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isPortfolioItem: true
            };
            
            await addDoc(collection(db, 'projects'), portfolioProjectData);
            
            alert('Portfolio project added successfully!');
            onClose();
        } catch (error) {
            console.error('Error adding portfolio project:', error);
            alert('Failed to add project. Please try again.');
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '2rem',
                position: 'relative'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#6b7280'
                    }}
                >
                    <XIcon />
                </button>
                
                <h2 style={{ marginBottom: '2rem', color: '#558B2F' }}>Add Portfolio Project</h2>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {/* Project Cover Image */}
                    <div>
                        <label style={styles.formLabel}>Project Cover Image</label>
                        
                        {/* Image Preview */}
                        {imagePreview ? (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '200px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '2px solid #e2e8f0'
                                }}>
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            background: 'rgba(0, 0, 0, 0.7)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Remove image"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                border: '2px dashed #cbd5e1',
                                borderRadius: '8px',
                                padding: '2rem',
                                textAlign: 'center',
                                marginBottom: '1rem',
                                backgroundColor: '#f8fafc'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📁</div>
                                <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>Choose a cover image for your project</p>
                            </div>
                        )}
                        
                        {/* File Input */}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                backgroundColor: '#f8fafc',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            Supported: JPG, PNG, GIF. Max size: 5MB
                        </div>
                        
                        {uploadingImage && (
                            <div style={{ 
                                marginTop: '0.5rem', 
                                color: '#558B2F', 
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                📤 Uploading image...
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label style={styles.formLabel}>Project Title *</label>
                        <input 
                            type="text" 
                            style={styles.input}
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                            placeholder="Enter project title"
                        />
                    </div>
                    
                    <div>
                        <label style={styles.formLabel}>Description</label>
                        <textarea 
                            rows="3" 
                            style={styles.textarea}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                            placeholder="Brief description of the project"
                        />
                    </div>
                    
                    <div>
                        <label style={styles.formLabel}>The Challenge</label>
                        <textarea 
                            rows="3" 
                            style={styles.textarea}
                            value={formData.challenge}
                            onChange={(e) => setFormData(prev => ({...prev, challenge: e.target.value}))}
                            placeholder="What problem did this project solve?"
                        />
                    </div>
                    
                    <div>
                        <label style={styles.formLabel}>The Solution</label>
                        <textarea 
                            rows="3" 
                            style={styles.textarea}
                            value={formData.solution}
                            onChange={(e) => setFormData(prev => ({...prev, solution: e.target.value}))}
                            placeholder="How did you approach and solve the problem?"
                        />
                    </div>
                    
                    <div>
                        <label style={styles.formLabel}>The Results</label>
                        <textarea 
                            rows="3" 
                            style={styles.textarea}
                            value={formData.results}
                            onChange={(e) => setFormData(prev => ({...prev, results: e.target.value}))}
                            placeholder="What were the outcomes and impact?"
                        />
                    </div>
                    
                    <div>
                        <label style={styles.formLabel}>Technologies Used</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input 
                                type="text" 
                                style={{...styles.input, marginBottom: 0}}
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                                placeholder="Add technology (e.g., React, Node.js)"
                            />
                            <button 
                                type="button" 
                                onClick={addTechnology}
                                style={styles.primaryButton}
                            >
                                Add
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {formData.technologies.map((tech, idx) => (
                                <span key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#e8f5e9',
                                    color: '#558B2F',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem'
                                }}>
                                    {tech}
                                    <button
                                        onClick={() => removeTechnology(tech)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#558B2F',
                                            cursor: 'pointer',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={styles.formLabel}>Project URL (Optional)</label>
                            <input 
                                type="url" 
                                style={styles.input}
                                value={formData.projectUrl}
                                onChange={(e) => setFormData(prev => ({...prev, projectUrl: e.target.value}))}
                                placeholder="https://example.com"
                            />
                        </div>
                        <div>
                            <label style={styles.formLabel}>Duration</label>
                            <input 
                                type="text" 
                                style={styles.input}
                                value={formData.duration}
                                onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                                placeholder="e.g., 2 months, 6 weeks"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label style={styles.formLabel}>Budget (Optional)</label>
                        <input 
                            type="number" 
                            style={styles.input}
                            value={formData.budget}
                            onChange={(e) => setFormData(prev => ({...prev, budget: e.target.value}))}
                            placeholder="Project budget in USD"
                        />
                    </div>
                </div>
                
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            color: '#374151',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || uploadingImage}
                        style={{
                            ...styles.primaryButton,
                            opacity: (saving || uploadingImage) ? 0.7 : 1
                        }}
                    >
                        {uploadingImage ? '📤 Uploading Image...' : saving ? 'Saving Project...' : 'Add Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MessagesView = ({ styles, activeChatId, setActiveChatId }) => {
    return (
        <div style={{
            height: 'calc(100vh - 120px)',
            minHeight: '600px',
            backgroundColor: 'transparent'
        }}>
            <EnhancedChatPanel 
                initialChatId={activeChatId}
                onChatChange={setActiveChatId}
            />
        </div>
    );
};

const SettingsView = ({ styles }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saveStatus, setSaveStatus] = useState('Save Changes');
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

    return(
        <div>
            <header style={styles.header}><h1 style={styles.welcomeTitle}>Settings</h1></header>
            <div style={{...styles.card('0.2s', 'span 3')}}>
                <div>
                    <h3 style={styles.cardTitle}>Change Password</h3>
                    {error && <p style={{color: '#DC2626', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</p>}
                    <div style={styles.formGrid}>
                        <input 
                            type="password" 
                            placeholder="Current Password" 
                            style={styles.input}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <div />
                        <input 
                            type="password" 
                            placeholder="New Password" 
                            style={styles.input}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input 
                            type="password" 
                            placeholder="Confirm New Password" 
                            style={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #E8F5E9', marginTop: '2rem', paddingTop: '1.5rem' }}>
                    <button
                        style={{
                            ...styles.primaryButton,
                            backgroundColor: saveStatus === 'Saved!' ? '#388E3C' : '#4CAF50',
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
    )
};

const ApplicationModal = ({ job, onClose, styles, showDialog }) => {
    const [coverLetter, setCoverLetter] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submitProposal = async () => {
        if (!auth.currentUser) { showDialog('warning', 'Sign in required', 'Please sign in to apply.'); return; }
        if (!coverLetter.trim()) { showDialog('warning', 'Cover letter needed', 'Please add a short cover letter.'); return; }
        setSubmitting(true);
        try {
            const uid = auth.currentUser.uid;
            let freelancerName = '';
            let freelancerAvatar = '';
            try {
                const u = await getDoc(doc(db, 'users', uid));
                if (u.exists()) {
                    const d = u.data();
                    freelancerName = d.name || '';
                    freelancerAvatar = d.photoUrl || '';
                }
            } catch (_) {}
            const proposalId = `${job.id}_${uid}`;
            await setDoc(doc(db, 'proposals', proposalId), {
                jobId: job.id,
                clientId: job.clientId,
                freelancerId: uid,
                freelancerName,
                freelancerAvatar,
                coverLetter: coverLetter.trim(),
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            
            // Notify client about new proposal
            await addDoc(collection(db, 'notifications'), {
                userId: job.clientId,
                type: 'proposal_received',
                text: `${freelancerName || 'A freelancer'} submitted a proposal for "${job.title}"`,
                jobId: job.id,
                jobTitle: job.title,
                freelancerId: uid,
                freelancerName,
                createdAt: serverTimestamp(),
                read: false
            });
            
            showDialog('success', 'Application submitted', 'Your proposal has been sent to the client.');
            onClose();
        } catch (e) {
            console.error('Submit proposal failed', e);
            showDialog('error', 'Submission failed', 'Failed to submit proposal.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <button onClick={onClose} style={styles.modalCloseButton}><XIcon /></button>
            <h2 style={styles.modalTitle}>{job.title}</h2>
            <p style={styles.jobClient}>{job.clientName || 'Client'} - {job.location || 'Remote'}</p>
            <p style={styles.jobBudget}>{job.budget ? `$${Number(job.budget).toLocaleString()}` : 'Budget TBD'} <span style={styles.jobType}>({job.type || 'Fixed-Price'})</span></p>
            {Array.isArray(job.skills) && (<div style={{...styles.tagContainer, margin: '1.5rem 0'}}>
                {job.skills.map(skill => <span key={skill} style={styles.tag}>{skill}</span>)}
            </div>)}
            <h3 style={styles.cardTitle}>Job Description</h3>
            <p style={{color: '#33691E', marginBottom: '1.5rem'}}>{job.description}</p>
            <h3 style={styles.cardTitle}>Your Proposal</h3>
            <textarea style={styles.textarea} rows="5" placeholder="Write a compelling cover letter..." value={coverLetter} onChange={(e)=>setCoverLetter(e.target.value)}></textarea>
            <button style={{...styles.primaryButton, width: '100%', marginTop: '1rem'}} onClick={submitProposal} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
        </div>
    </div>
    );
};

const ProfileView = ({ styles }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [location, setLocation] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [bio, setBio] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [skills, setSkills] = useState([]);
    const [customSkill, setCustomSkill] = useState('');
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('Save Changes');

    useEffect(() => {
        // Load profile from /users/{uid}
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const refDoc = doc(db, 'users', uid);
        getDoc(refDoc).then(snap => {
            if (snap.exists()) {
                const d = snap.data();
                setName(d.name || ''); 
                setUsername(d.username || ''); 
                setLocation(d.location || ''); 
                setHourlyRate(d.hourlyRate || ''); 
                setBio(d.bio || ''); 
                setPhotoUrl(d.photoUrl || '');
                setSkills(d.skills || []);
            }
        });
    }, []);

    const toggleSkill = (skill) => {
        setSkills(prev => {
            if (prev.includes(skill)) {
                return prev.filter(s => s !== skill);
            } else {
                return [...prev, skill];
            }
        });
    };
    
    const addCustomSkill = () => {
        const trimmedSkill = customSkill.trim();
        if (trimmedSkill && !skills.includes(trimmedSkill)) {
            setSkills(prev => [...prev, trimmedSkill]);
            setCustomSkill('');
        }
    };
    
    const handleCustomSkillKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomSkill();
        }
    };
    
    const removeSkill = (skillToRemove) => {
        setSkills(prev => prev.filter(skill => skill !== skillToRemove));
    };

    const saveProfile = async () => {
        setStatus('Saving...');
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        await setDoc(doc(db, 'users', uid), { 
            uid, 
            name, 
            username, 
            location, 
            hourlyRate: Number(hourlyRate)||0, 
            bio, 
            photoUrl, 
            skills,
            userType: 'freelancer' 
        }, { merge: true });
        setStatus('Saved!');
        setTimeout(() => setStatus('Save Changes'), 1500);
    };

    const onPhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const uid = auth.currentUser?.uid;
            const sref = ref(storage, `avatars/${uid}`);
            await uploadBytes(sref, file);
            const url = await getDownloadURL(sref);
            setPhotoUrl(url);
        } finally {
            setUploading(false);
        }
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
                        id="avatar-upload" 
                        accept="image/*" 
                        onChange={onPhotoChange} 
                        style={{ display: 'none' }} 
                    />
                    <label 
                        htmlFor="avatar-upload"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                        {uploading ? '⏳ Uploading...' : 'Click the edit icon to change'}
                    </p>
                </div>
            </div>
            {/* Basic Information */}
            <div style={styles.formGrid}>
                <div className="form-row">
                    <label style={styles.formLabel}>Full Name *</label>
                    <input type="text" placeholder="Enter your full name" style={styles.input} value={name} onChange={(e)=>setName(e.target.value)} />
                </div>
                <div className="form-row">
                    <label style={{
                        ...styles.formLabel,
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
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
                                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                                border: '2px solid #E0F2FE',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '500',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                            }} 
                            value={username} 
                            onChange={(e)=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#6366F1';
                                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#E0F2FE';
                                e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6366F1',
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
                        💡 <span>Your unique handle that clients will use to find and mention you</span>
                    </div>
                </div>
                <div className="form-row">
                    <label style={styles.formLabel}>Location</label>
                    <input type="text" placeholder="City, Country" style={styles.input} value={location} onChange={(e)=>setLocation(e.target.value)} />
                </div>
                <div className="form-row">
                    <label style={styles.formLabel}>Hourly Rate (USD)</label>
                    <input type="number" placeholder="25" style={styles.input} value={hourlyRate} onChange={(e)=>setHourlyRate(e.target.value)} />
                </div>
            </div>
            
            {/* Skills Section with Predefined Categories */}
            <div className="form-row" style={{ marginTop: '1.5rem' }}>
                <label style={styles.formLabel}>Skills & Expertise *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    {skillCategories.map(skill => {
                        const isActive = skills.includes(skill.name);
                        return (
                            <button
                                key={skill.name}
                                type="button"
                                onClick={() => toggleSkill(skill.name)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '12px',
                                    border: isActive ? '2px solid #4f46e5' : '2px solid #e2e8f0',
                                    backgroundColor: isActive ? '#ede9fe' : '#ffffff',
                                    color: isActive ? '#4f46e5' : '#374151',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    transition: 'all 0.3s ease',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {skill.icon}
                                <span>{skill.name}</span>
                            </button>
                        );
                    })}
                </div>
                
                {/* Custom Skills Input */}
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0'
                }}>
                    <label style={{
                        ...styles.formLabel,
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#374151'
                    }}>Add Custom Skills</label>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Enter a skill (e.g., React, Photoshop, Content Writing)"
                            value={customSkill}
                            onChange={(e) => setCustomSkill(e.target.value)}
                            onKeyPress={handleCustomSkillKeyPress}
                            style={{
                                ...styles.input,
                                flex: 1,
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                padding: '0.75rem'
                            }}
                        />
                        <button
                            type="button"
                            onClick={addCustomSkill}
                            disabled={!customSkill.trim()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: customSkill.trim() ? '#6366F1' : '#D1D5DB',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: customSkill.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                fontSize: '0.9rem'
                            }}
                        >
                            Add
                        </button>
                    </div>
                </div>
                
                {/* Selected Skills Display */}
                {skills.length > 0 && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#F0F9FF',
                        borderRadius: '12px',
                        border: '1px solid #E0F2FE'
                    }}>
                        <label style={{
                            ...styles.formLabel,
                            marginBottom: '0.75rem',
                            fontSize: '0.9rem',
                            color: '#0369A1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            🎯 Your Selected Skills ({skills.length})
                        </label>
                        
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }}>
                            {skills.map((skill, index) => {
                                const isCustomSkill = !skillCategories.some(cat => cat.name === skill);
                                return (
                                    <div
                                        key={skill}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 0.75rem',
                                            backgroundColor: isCustomSkill ? '#DBEAFE' : '#E0F2FE',
                                            color: '#0369A1',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            border: '1px solid #B3E5FC',
                                            position: 'relative'
                                        }}
                                    >
                                        {isCustomSkill && <span style={{ fontSize: '0.7rem' }}>✨</span>}
                                        <span>{skill}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#DC2626',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                padding: '0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#FEE2E2';
                                                e.target.style.transform = 'scale(1.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.transform = 'scale(1)';
                                            }}
                                            title={`Remove ${skill}`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.75rem' }}>
                    💡 Select from categories above or add your own custom skills. Clients will use these to find you.
                </div>
            </div>
            <div className="form-row" style={{ marginTop: '1rem' }}>
                <textarea rows="5" style={{...styles.textarea, width:'100%'}} placeholder="Write your bio..." value={bio} onChange={(e)=>setBio(e.target.value)} />
            </div>
            <div style={{ borderTop: '1px solid #E8F5E9', marginTop: '1.5rem', paddingTop: '1rem' }}>
                <button style={styles.primaryButton} onClick={saveProfile} disabled={status!=='Save Changes'}>{status}</button>
            </div>
        </div>
    );
};

const ManageProjectsView = ({ styles, showDialog }) => {
    const [projects, setProjects] = useState([]);
    const [selected, setSelected] = useState(null);
    const [segmentTitle, setSegmentTitle] = useState('');
    const [segmentDesc, setSegmentDesc] = useState('');
    const [files, setFiles] = useState([]);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [completingProject, setCompletingProject] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');
    const [finalDeliverables, setFinalDeliverables] = useState([]);

    // Track all submitted segments by this freelancer (across projects)
    const [mySegments, setMySegments] = useState([]);

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'projects'), where('freelancerId', '==', auth.currentUser?.uid || 'none')),
            (snap) => {
                const arr = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => 
                    p.status === 'Active' || p.status === 'Completion Requested'
                );
                const uniq = Array.from(new Map(arr.map(x => [x.id, x])).values());
                setProjects(uniq);
                // Auto-select first active project if none selected yet
                if (!selected && uniq.length > 0) setSelected(uniq[0]);
            },
            (err) => console.error('Freelancer ManageProjects projects query failed:', err)
        );
        return () => unsub();
    }, []);

    // Listen to all segments authored by this freelancer (collection group)
    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        let unsubscribers = [];
        const attach = async () => {
            const list = projects;
            if (!list || list.length === 0) { setMySegments([]); return; }
            // Unsubscribe previous
            unsubscribers.forEach(u => u());
            unsubscribers = list.map(p => onSnapshot(
                query(collection(db, 'projects', p.id, 'segments')),
                (snap) => {
                    setMySegments(prev => {
                        // merge per-project segments, but only keep for current freelancer
                        const existing = new Map(prev.map(s => [s.__key, s]));
                        snap.docs.forEach(d => {
                            const data = { id: d.id, ...d.data() };
                            if (data.freelancerId === uid) {
                                existing.set(`${p.id}_${d.id}`, { ...data, __key: `${p.id}_${d.id}` });
                            }
                        });
                        const merged = Array.from(existing.values());
                        // sort by createdAt desc
                        merged.sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0));
                        return merged;
                    });
                }
            ));
        };
        attach();
        return () => { unsubscribers.forEach(u => u()); };
    }, [projects]);

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        const validFiles = selectedFiles.filter(file => {
            if (!isFileTypeAllowed(file)) {
                // Silently ignore invalid file here; use modal if needed
                // showDialog('warning', 'Invalid file', `"${file.name}" is not allowed.`);
                return false;
            }
            return true;
        });
        setFiles(prev => [...prev, ...validFiles]);
        event.target.value = ''; // Reset input
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    const removeFinalDeliverable = (index) => {
        setFinalDeliverables(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleFinalDeliverablesSelect = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        const validFiles = selectedFiles.filter(file => {
            if (!isFileTypeAllowed(file)) {
                // showDialog('warning', 'Invalid file', `"${file.name}" is not allowed.`);
                return false;
            }
            return true;
        });
        setFinalDeliverables(prev => [...prev, ...validFiles]);
        event.target.value = ''; // Reset input
    };
    
    const submitProjectCompletion = async () => {
        if (!selected) {
            alert('Please select a project to complete.');
            return;
        }
        
        setCompletingProject(true);
        
        try {
            // Upload final deliverables
            let deliverableAttachments = [];
            if (finalDeliverables.length > 0) {
                for (const file of finalDeliverables) {
                    try {
                        const tempChatId = `completion_${selected.id}_${Date.now()}`;
                        const uploadedFile = await uploadMessageAttachment(file, tempChatId);
                        deliverableAttachments.push({
                            name: uploadedFile.name,
                            url: uploadedFile.url,
                            size: uploadedFile.size,
                            type: uploadedFile.type,
                            uploadedAt: uploadedFile.uploadedAt
                        });
                    } catch (e) {
                        console.warn('Deliverable upload failed:', file?.name, e);
                        // showDialog('warning', 'Upload failed', `Failed to upload "${file.name}". Continuing with submission.`);
                    }
                }
            }
            
            // Create completion request document
            await addDoc(collection(db, 'projects', selected.id, 'completions'), {
                type: 'completion_request',
                freelancerId: auth.currentUser?.uid,
                freelancerName: auth.currentUser?.displayName || auth.currentUser?.email,
                projectId: selected.id,
                projectTitle: selected.title,
                clientId: selected.clientId,
                notes: completionNotes.trim(),
                finalDeliverables: deliverableAttachments,
                status: 'pending_review',
                submittedAt: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            
            // Update project status to completion requested
            await updateDoc(doc(db, 'projects', selected.id), {
                status: 'Completion Requested',
                completionRequestedAt: serverTimestamp(),
                completionRequestedBy: auth.currentUser?.uid,
                updatedAt: serverTimestamp()
            });
            
            // Reset form
            setCompletionNotes('');
            setFinalDeliverables([]);
            setShowCompletionModal(false);
            
            showDialog('success', 'Project completion submitted', 'The client will review your work and approve the completion.');
            
        } catch (error) {
            console.error('Error submitting project completion:', error);
            showDialog('error', 'Submission failed', 'Failed to submit project completion. Please try again.');
        } finally {
            setCompletingProject(false);
        }
    };

    const submitSegment = async () => {
        if (!auth.currentUser) { showDialog('warning', 'Sign in required', 'Please sign in.'); return; }
        if (!selected) { showDialog('warning', 'Select a project', 'Please select a project.'); return; }
        if (!segmentTitle.trim()) { showDialog('warning', 'Title required', 'Please enter a segment title.'); return; }
        
        setSaving(true);
        setUploading(files.length > 0);
        
        try {
            // Get project data
            let clientId = selected?.clientId || null;
            let projectTitle = selected?.title || 'Project';
            try {
                const pSnap = await getDoc(doc(db, 'projects', selected.id));
                if (pSnap.exists()) {
                    const pd = pSnap.data();
                    clientId = clientId || pd.clientId || null;
                    projectTitle = pd.title || projectTitle;
                }
            } catch (_) {}

            // Upload attachments using the enhanced messaging API
            let attachments = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    try {
                        // Create a temporary chat ID for consistent upload path
                        const tempChatId = `segment_${selected.id}_${Date.now()}`;
                        const uploadedFile = await uploadMessageAttachment(file, tempChatId);
                        attachments.push({
                            name: uploadedFile.name,
                            url: uploadedFile.url,
                            size: uploadedFile.size,
                            type: uploadedFile.type,
                            uploadedAt: uploadedFile.uploadedAt
                        });
                    } catch (e) {
                        console.warn('Attachment upload failed; continuing without this file:', file?.name, e);
                        // showDialog('warning', 'Upload failed', `Failed to upload "${file.name}". Continuing with submission.`);
                    }
                }
            }

            setUploading(false);

            await addDoc(collection(db, 'projects', selected.id, 'segments'), {
                title: segmentTitle.trim(),
                description: segmentDesc.trim(),
                status: 'pending',
                createdAt: serverTimestamp(),
                attachments,
                projectId: selected.id,
                clientId,
                projectTitle,
                freelancerId: auth.currentUser?.uid || null
            });
            
            // Notify client about new segment submission
            if (clientId) {
                try {
                    await addDoc(collection(db, 'notifications'), {
                        userId: clientId,
                        type: 'segment_submitted',
                        text: `New segment "${segmentTitle.trim()}" submitted for "${projectTitle}"`,
                        projectId: selected.id,
                        projectTitle,
                        segmentTitle: segmentTitle.trim(),
                        createdAt: serverTimestamp(),
                        read: false
                    });
                } catch (notifErr) {
                    console.warn('Failed to send segment notification:', notifErr);
                }
            }

            setSegmentTitle(''); 
            setSegmentDesc(''); 
            setFiles([]);
            showDialog('success', 'Segment submitted', 'Submitted for client approval.');
            
        } catch (e) {
            console.error('Submit segment failed', e);
            setUploading(false);
            
            let errorMessage = 'Failed to submit segment. Please try again.';
            if (e?.code === 'storage/unauthorized') {
                errorMessage = 'Permission denied uploading file. Please ensure you are signed in and try again.';
            } else if (e?.code === 'permission-denied') {
                errorMessage = 'Permission denied. Please ensure you have access to this project.';
            } else if (e?.message) {
                errorMessage = `Error: ${e.message}`;
            }
            showDialog('error', 'Submission failed', errorMessage);
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    const statusBadgeStyle = (status) => ({
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: status === 'approved' ? '#DBEAFE' : status === 'rejected' ? '#FFE4E6' : status === 'changes_requested' ? '#FEF9C3' : '#E2E8F0',
        color: '#0F172A'
    });

    return (
        <div>
            <header style={styles.header}><h1 style={styles.welcomeTitle}>Manage Projects</h1></header>
            <div style={{...styles.card('0.2s')}}>
                <label style={styles.formLabel}>Select Active Project</label>
                <select style={styles.input} value={selected?.id || ''} onChange={(e)=>setSelected(projects.find(p=>p.id===e.target.value) || null)}>
                    <option value="">-- Choose project --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title || p.id}</option>)}
                </select>
            </div>
            {selected && (
                <div style={{...styles.card('0.3s', 'span 3')}}>
                    <h3 style={styles.cardTitle}>Propose a Segment</h3>
                    
                    {/* Segment Title */}
                    <div className="form-row" style={{ marginBottom: '1rem' }}>
                        <label style={styles.formLabel}>Segment Title *</label>
                        <input 
                            style={styles.input} 
                            placeholder="Enter segment title" 
                            value={segmentTitle} 
                            onChange={(e)=>setSegmentTitle(e.target.value)} 
                        />
                    </div>
                    
                    {/* Segment Description */}
                    <div className="form-row" style={{ marginBottom: '1rem' }}>
                        <label style={styles.formLabel}>Description</label>
                        <textarea 
                            rows="4" 
                            style={styles.textarea} 
                            placeholder="Describe the work completed" 
                            value={segmentDesc} 
                            onChange={(e)=>setSegmentDesc(e.target.value)} 
                        />
                    </div>
                    
                    {/* File Upload Section */}
                    <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                        <label style={styles.formLabel}>Attach Files (Optional)</label>
                        <input 
                            type="file" 
                            multiple 
                            onChange={handleFileSelect} 
                            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z,.js,.html,.css,.json,.xml" 
                            style={{ marginBottom: '0.75rem' }}
                        />
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                            Supported: Images, Documents (PDF, DOC, TXT), Archives (ZIP, RAR), Code files. Max 10MB per file.
                        </div>
                        
                        {/* File Preview */}
                        {files && files.length > 0 && (
                            <div style={{ 
                                backgroundColor: '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '8px', 
                                padding: '0.75rem',
                                marginTop: '0.5rem'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                    {files.length} file{files.length > 1 ? 's' : ''} selected:
                                </div>
                                {files.map((file, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: '#10b981'
                                            }}></div>
                                            <span style={{ fontSize: '0.9rem' }}>{file.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>({formatFileSize(file.size)})</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(i)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                padding: '0.25rem 0.5rem'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Submit Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            style={{
                                ...styles.primaryButton, 
                                opacity: (saving || uploading) ? 0.7 : 1,
                                cursor: (saving || uploading) ? 'not-allowed' : 'pointer'
                            }} 
                            onClick={submitSegment} 
                            disabled={saving || uploading}
                        >
                            {uploading ? '📤 Uploading Files...' : saving ? '⏳ Submitting...' : '🚀 Submit for Approval'}
                        </button>
                        
                        {(saving || uploading) && (
                            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                {uploading ? 'Uploading attachments...' : 'Saving segment...'}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Rejection Feedback Alert */}
            {selected && selected.status === 'Active' && selected.completionRejectedAt && selected.rejectionFeedback && (
                <div style={{
                    ...styles.card('0.3s', 'span 3'),
                    marginTop: '1rem',
                    background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                    border: '2px solid #EF4444',
                    borderRadius: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            flexShrink: 0
                        }}>❌</div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{
                                margin: 0,
                                color: '#991B1B',
                                fontSize: '1.3rem',
                                fontWeight: '700'
                            }}>Completion Rejected - Revisions Required</h3>
                            <p style={{
                                margin: '0.5rem 0 0 0',
                                color: '#7F1D1D',
                                fontSize: '0.9rem'
                            }}>The client has requested changes before approving project completion.</p>
                            
                            {/* Client Feedback */}
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: '8px',
                                borderLeft: '4px solid #DC2626'
                            }}>
                                <h4 style={{
                                    margin: '0 0 0.5rem 0',
                                    color: '#991B1B',
                                    fontSize: '0.95rem',
                                    fontWeight: '600'
                                }}>Client Feedback:</h4>
                                <p style={{
                                    margin: 0,
                                    color: '#450A0A',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap'
                                }}>{selected.rejectionFeedback}</p>
                            </div>
                            
                            <p style={{
                                margin: '1rem 0 0 0',
                                color: '#991B1B',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}>💡 Please address the feedback and resubmit your project completion below.</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Project Completion Section */}
            {selected && (selected.status === 'Active' || selected.status === 'Completion Requested') && (
                <div style={{
                    ...styles.card('0.35s', 'span 3'),
                    marginTop: '1rem',
                    background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                    border: '2px solid #0EA5E9',
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
                            background: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>🎯</div>
                        <div>
                            {selected.status === 'Active' ? (
                                <>
                                    <h3 style={{
                                        margin: 0,
                                        color: '#0C4A6E',
                                        fontSize: '1.3rem',
                                        fontWeight: '700'
                                    }}>{selected.completionRejectedAt ? 'Resubmit Project Completion' : 'Ready to Complete Project?'}</h3>
                                    <p style={{
                                        margin: '0.25rem 0 0 0',
                                        color: '#075985',
                                        fontSize: '0.9rem'
                                    }}>{selected.completionRejectedAt ? 'Address the client feedback and submit your revised deliverables' : 'Submit your final deliverables and request project completion approval'}</p>
                                </>
                            ) : (
                                <>
                                    <h3 style={{
                                        margin: 0,
                                        color: '#D97706',
                                        fontSize: '1.3rem',
                                        fontWeight: '700'
                                    }}>Completion Submitted!</h3>
                                    <p style={{
                                        margin: '0.25rem 0 0 0',
                                        color: '#92400E',
                                        fontSize: '0.9rem'
                                    }}>Waiting for client approval. You can update your submission if needed.</p>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {selected.status === 'Active' ? (
                        <button
                            onClick={() => setShowCompletionModal(true)}
                            style={{
                                width: '100%',
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #059669, #047857)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
                            }}
                        >
                            🚀 <span>Submit Project Completion</span>
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{
                                flex: 1,
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
                                borderRadius: '12px',
                                textAlign: 'center',
                                border: '2px solid #F97316'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                                <div style={{ color: '#9A3412', fontWeight: '600' }}>Pending Review</div>
                                <div style={{ color: '#C2410C', fontSize: '0.8rem' }}>Client is reviewing your submission</div>
                            </div>
                            
                            <button
                                onClick={() => setShowCompletionModal(true)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                📝 <span>Update Submission</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {!selected && <p style={{color:'#558B2F'}}>Choose an active project to manage segments.</p>}

            {/* My Submitted Segments (across all projects) */}
            <div style={{...styles.card('0.4s', 'span 3')}}>
                <h3 style={styles.cardTitle}>My Submitted Segments</h3>
                {mySegments.length === 0 && <p style={{ color:'#558B2F' }}>No segments submitted yet.</p>}
                {mySegments.map((s, i) => (
                    <div key={s.__key || s.id} style={{ display:'flex', alignItems:'flex-start', gap:'1rem', padding:'0.75rem 0', borderBottom:'1px solid #E8F5E9' }}>
                        <div style={{ flex:1 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                <p style={{ fontWeight:600, margin:0 }}>{s.title || 'Segment'}</p>
                                <span style={statusBadgeStyle(s.status)}>
                                    {s.status === 'pending' ? 'Pending Approval' : s.status === 'approved' ? 'Approved' : s.status === 'rejected' ? 'Rejected' : s.status === 'changes_requested' ? 'Revise Requested' : (s.status || '—')}
                                </span>
                            </div>
                            <p style={{ color:'#558B2F', margin:'0.25rem 0' }}>{s.projectTitle || ''}</p>
                            {s.description && <p style={{ color:'#475569', margin:0 }}>{s.description}</p>}
                            {s.feedback && <p style={{ color:'#0F766E', marginTop:'0.25rem' }}><strong>Client feedback:</strong> {s.feedback}</p>}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Project Completion Modal */}
            {showCompletionModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #059669, #047857)',
                            color: 'white',
                            padding: '2rem',
                            borderRadius: '20px 20px 0 0',
                            position: 'relative'
                        }}>
                            <button 
                                onClick={() => {
                                    setShowCompletionModal(false);
                                    setCompletionNotes('');
                                    setFinalDeliverables([]);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    color: 'white'
                                }}
                            >
                                <XIcon />
                            </button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem'
                                }}>🎯</div>
                                <div>
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: '1.8rem',
                                        fontWeight: '800'
                                    }}>Submit Project Completion</h2>
                                    <p style={{
                                        margin: '0.5rem 0 0 0',
                                        fontSize: '1rem',
                                        opacity: 0.9
                                    }}>Request final approval from your client</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div style={{ padding: '2rem' }}>
                            {/* Project Info */}
                            <div style={{
                                background: '#F8FAFC',
                                padding: '1rem',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                border: '1px solid #E2E8F0'
                            }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Project: {selected?.title}</h4>
                                <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>Client: {selected?.clientName}</p>
                            </div>
                            
                            {/* Completion Notes */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>Completion Summary & Notes</label>
                                <textarea
                                    value={completionNotes}
                                    onChange={(e) => setCompletionNotes(e.target.value)}
                                    placeholder="Describe the completed work, key achievements, and any important notes for the client..."
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        resize: 'vertical',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            
                            {/* Final Deliverables */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>Final Deliverables (Optional)</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFinalDeliverablesSelect}
                                    accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z,.js,.html,.css,.json,.xml"
                                    style={{ marginBottom: '1rem' }}
                                />
                                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1rem' }}>
                                    Upload final files, completed designs, code, or other deliverables. Max 10MB per file.
                                </div>
                                
                                {/* Deliverables Preview */}
                                {finalDeliverables.length > 0 && (
                                    <div style={{
                                        background: '#F0F9FF',
                                        border: '1px solid #E0F2FE',
                                        borderRadius: '8px',
                                        padding: '1rem'
                                    }}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#0369A1' }}>
                                            {finalDeliverables.length} deliverable{finalDeliverables.length > 1 ? 's' : ''} ready to submit:
                                        </div>
                                        {finalDeliverables.map((file, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.5rem',
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #E0F2FE',
                                                borderRadius: '6px',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '1rem' }}>📁</span>
                                                    <span style={{ fontSize: '0.9rem' }}>{file.name}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>({formatFileSize(file.size)})</span>
                                                </div>
                                                <button
                                                    onClick={() => removeFinalDeliverable(i)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#DC2626',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        padding: '0.25rem 0.5rem'
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setShowCompletionModal(false);
                                        setCompletionNotes('');
                                        setFinalDeliverables([]);
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '8px',
                                        background: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitProjectCompletion}
                                    disabled={completingProject}
                                    style={{
                                        padding: '0.75rem 2rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: completingProject ? '#9CA3AF' : 'linear-gradient(135deg, #059669, #047857)',
                                        color: 'white',
                                        cursor: completingProject ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {completingProject ? (
                                        <>⏳ Submitting...</>
                                    ) : (
                                        <>🎉 Submit for Approval</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FindJobsView = ({ styles, showDialog }) => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        // Fetch open jobs posted by clients; sort client-side to avoid composite index requirements
        const qOpen = query(collection(db, 'jobs'), where('status', '==', 'Open'));
        const unsub = onSnapshot(qOpen, (snap) => {
            const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            arr.sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0));
            setJobs(arr);
        }, (err) => {
            console.error('Jobs query failed:', err);
        });
        return () => unsub();
    }, []);

    return (
    <div>
        <header style={styles.header}><h1 style={styles.welcomeTitle}>Find Your Next Project</h1></header>
        <div style={{...styles.card('0.2s', 'span 3'), ...styles.findJobsGrid}}>
            {jobs.map((job, i) => (
                <div key={job.id} className="job-card" style={{animationDelay: `${0.3 + i*0.1}s`}}>
                    <div style={styles.jobCardHeader}>
                        <h3 style={styles.jobTitle}>{job.title}</h3>
                        <BookmarkIcon />
                    </div>
                    <p style={styles.jobClient}>{job.clientName || 'Client'} - {job.location || 'Remote'}</p>
                    <p style={styles.jobBudget}>{job.budget ? `$${Number(job.budget).toLocaleString()}` : 'Budget TBD'} <span style={styles.jobType}>({job.type || 'Fixed-Price'})</span></p>
                    {Array.isArray(job.skills) && <div style={styles.tagContainer}>{job.skills.map(skill => <span key={skill} style={styles.tag}>{skill}</span>)}</div>}
                    <div style={styles.jobCardFooter}>
                        <p style={styles.jobPosted}>Posted {job.posted || ''}</p>
                        <button style={styles.primaryButton} onClick={() => setSelectedJob(job)}>Apply Now</button>
                    </div>
                </div>
            ))}
            {jobs.length === 0 && <p style={{padding: '1rem', color: '#475569'}}>No open jobs right now.</p>}
        </div>
        {selectedJob && <ApplicationModal job={selectedJob} onClose={() => setSelectedJob(null)} styles={styles} showDialog={showDialog} />}
    </div>
    );
};


import SimpleModal from '../components/SimpleModal.jsx';

export default function FreelancerDashboard() {
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
            height: '100vh' 
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

        profileCard: { textAlign: 'center' },
        profileAvatar: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem auto', border: '4px solid #FFFFFF', boxShadow: '0 0 10px rgba(0,0,0,0.1)' },
        profileName: { fontSize: '1.4rem', fontWeight: 'bold' },
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #E8F5E9', paddingTop: '1.5rem' },
        statItem: { textAlign: 'center' },
        statValue: { fontSize: '1.5rem', fontWeight: 'bold' },
        statLabel: { fontSize: '0.8rem', color: '#558B2F' },

        projectList: {},
        projectItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #E8F5E9' },
        projectTitle: { fontWeight: '600' },
        projectClient: { fontSize: '0.9rem', color: '#475569' },
        projectProgress: { width: '100px', backgroundColor: '#DBEAFE', borderRadius: '8px', height: '8px' },
        progressBar: (progress) => ({ width: `${progress}%`, backgroundColor: '#3B82F6', height: '8px', borderRadius: '8px' }),
       
        messageList: {},
        messageItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 0' },
        messageAvatar: { width: '40px', height: '40px', borderRadius: '50%' },
        messageName: { fontWeight: '600' },
        messageLast: { fontSize: '0.9rem', color: '#558B2F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '150px' },
       
        tabs: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #DCEDC8' },
        tabButton: (isActive) => ({ padding: '0.8rem 1.5rem', border: 'none', backgroundColor: 'transparent', color: isActive ? '#0F172A' : '#475569', cursor: 'pointer', borderBottom: isActive ? '3px solid #3B82F6' : '3px solid transparent', fontWeight: isActive ? '600' : '500' }),
       
        projectTable: { padding: '0.5rem' },
        tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', color: '#558B2F', padding: '0.8rem 1.5rem', fontSize: '0.9rem', textTransform: 'uppercase' },
        tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '0.5rem', opacity: 0, animation: 'fade-slide-up 0.5s ease forwards' },

        fullPortfolioGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' },
        fullPortfolioItem: { position: 'relative', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '200px' },
       
        contactList: { width: '300px', borderRight: '1px solid #E8F5E9', padding: '0', overflowY: 'auto' },
        contactItem: (isActive) => ({ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer', backgroundColor: isActive ? '#F1F8E9' : 'transparent', borderLeft: isActive ? '4px solid #4CAF50' : '4px solid transparent' }),
        chatWindow: { flex: 1, display: 'flex', flexDirection: 'column' },
        chatHeader: { padding: '1.5rem', borderBottom: '1px solid #E8F5E9' },
        messageArea: { flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' },
        messageBubble: (isSender) => ({ alignSelf: isSender ? 'flex-end' : 'flex-start', backgroundColor: isSender ? '#4CAF50' : '#E8F5E9', color: isSender ? '#FFFFFF' : '#1B5E20', padding: '0.75rem 1rem', borderRadius: '16px', maxWidth: '70%' }),
        messageInputContainer: { display: 'flex', padding: '1rem', borderTop: '1px solid #E8F5E9' },
        messageInput: { flex: 1, border: '1px solid #C5E1A5', borderRadius: '8px', padding: '0.75rem', outline: 'none' },
        sendButton: { border: 'none', backgroundColor: '#4CAF50', color: '#FFFFFF', borderRadius: '8px', padding: '0.75rem', marginLeft: '0.5rem', cursor: 'pointer' },
       
        formGrid: { 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '1rem' : '1.5rem' 
        },
        
        formLabel: { 
            fontWeight: '600', 
            marginBottom: '0.5rem', 
            display: 'block', 
            color: '#374151',
            fontSize: isMobile ? '0.9rem' : '1rem'
        },
        
        input: { 
            width: '100%', 
            padding: isMobile ? '0.8rem' : '0.9rem 1rem',
            border: '1px solid #CBD5E1', 
            backgroundColor: '#F8FAFC', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.95rem' : '1rem',
            boxSizing: 'border-box' 
        },
        
        textarea: { 
            width: '100%', 
            padding: isMobile ? '0.8rem' : '0.9rem 1rem',
            border: '1px solid #CBD5E1', 
            backgroundColor: '#F8FAFC', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.95rem' : '1rem',
            boxSizing: 'border-box', 
            resize: 'vertical',
            minHeight: isMobile ? '100px' : '120px'
        },
        
        primaryButton: { 
            padding: isMobile ? '0.8rem 1rem' : '0.9rem 1.5rem',
            backgroundColor: '#3B82F6', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: '500', 
            cursor: 'pointer', 
            transition: 'background-color 0.3s ease',
            width: isMobile ? '100%' : 'auto'
        },
   
        // Find Jobs View
        findJobsGrid: { 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: isMobile ? '1.5rem' : '1.5rem' 
        },
        jobCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        jobTitle: { fontSize: '1.2rem', fontWeight: '600' },
        jobClient: { color: '#33691E', fontWeight: '500', margin: '0.25rem 0' },
        jobBudget: { fontSize: '1.1rem', fontWeight: 'bold', margin: '1rem 0' },
        jobType: { fontWeight: 'normal', color: '#558B2F', fontSize: '0.9rem' },
        tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0' },
        tag: { backgroundColor: '#E8F5E9', color: '#33691E', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem' },
        jobCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid #E8F5E9', paddingTop: '1rem' },
        jobPosted: { fontSize: '0.8rem', color: '#558B2F' },
       
        // Application Modal
        modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(27, 94, 32, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, animation: 'fade-in 0.3s' },
        modalContent: { backgroundColor: '#FFFFFF', borderRadius: '16px', width: '90%', maxWidth: '600px', padding: '2rem', animation: 'fade-slide-up 0.4s ease forwards', position: 'relative' },
        modalCloseButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#558B2F' },
        modalTitle: { fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' },
        modalTextarea: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #C5E1A5', backgroundColor: '#F9FBE7', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },
       
        // Settings View
        notificationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #E8F5E9' },
        notificationLabel: { fontWeight: '600' },
        notificationDesc: { fontSize: '0.9rem', color: '#558B2F' },

    };

    const keyframes = `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .portfolio-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2); }
        .portfolio-card:hover .portfolio-hover-overlay { opacity: 1; }
        .portfolio-card:hover .project-overlay { transform: translateY(0); }
.nav-item-hover:hover { background-color: #1E40AF; }
        .portfolio-item:hover .portfolio-image { transform: scale(1.05); }
        .portfolio-item:hover .portfolio-overlay { opacity: 1; }
        .table-row:hover { background-color: #F1F5F9; }
        .message-bubble { animation: fade-slide-up 0.4s ease forwards; opacity: 0; }
        .job-card { background-color: #FFFFFF; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); opacity: 0; animation: fade-slide-up 0.5s ease forwards; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .job-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
    `;

    const renderView = () => {
        switch(activeView) {
            case 'find-jobs': return <FindJobsView styles={styles} showDialog={showDialog} />;
            case 'projects': return <ProjectsView styles={styles} />;
            case 'manage': return <ManageProjectsView styles={styles} showDialog={showDialog} />;
            case 'portfolio': return <PortfolioView styles={styles} showDialog={showDialog} />;
            case 'messages': return <MessagesView styles={styles} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />;
            case 'notifications': return <NotificationsView styles={styles} setActiveView={setActiveView} />;
            case 'profile': return <ProfileView styles={styles} />;
            case 'settings': return <SettingsView styles={styles} />;
            case 'dashboard':
            default:
                return <FreelancerDashboardView styles={styles} setActiveView={setActiveView} />;
        }
    }

    return (
        <>
        <SimpleModal
            isOpen={dialog.open}
            onClose={closeDialog}
            onConfirm={dialog.onConfirm}
            type={dialog.type}
            title={dialog.title}
            message={dialog.message}
            confirmLabel={dialog.confirmLabel}
        />
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
                <div style={styles.navItem(activeView === 'find-jobs')} className="nav-item-hover" onClick={() => { setActiveView('find-jobs'); setIsMobileMenuOpen(false); }}><BriefcaseIcon /><span>Find Jobs</span></div>
                <div style={styles.navItem(activeView === 'projects')} className="nav-item-hover" onClick={() => { setActiveView('projects'); setIsMobileMenuOpen(false); }}><ProjectsIcon /><span>My Projects</span></div>
                <div style={styles.navItem(activeView === 'manage')} className="nav-item-hover" onClick={() => { setActiveView('manage'); setIsMobileMenuOpen(false); }}><ProjectsIcon /><span>Manage Projects</span></div>
                <div style={styles.navItem(activeView === 'portfolio')} className="nav-item-hover" onClick={() => { setActiveView('portfolio'); setIsMobileMenuOpen(false); }}><PortfolioIcon /><span>Portfolio</span></div>
                <div style={styles.navItem(activeView === 'messages')} className="nav-item-hover" onClick={() => { setActiveView('messages'); setIsMobileMenuOpen(false); }}><MessageIcon /><span>Messages</span></div>
                <div style={styles.navItem(activeView === 'profile')} className="nav-item-hover" onClick={() => { setActiveView('profile'); setIsMobileMenuOpen(false); }}><SettingsIcon /><span>Profile</span></div>

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
