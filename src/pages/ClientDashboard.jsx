import React, { useState, useEffect } from 'react';
import ChatPanel from '../components/ChatPanel.jsx';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebase.js';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, onSnapshot, query, where, updateDoc, orderBy, getDocs, collectionGroup, limit, writeBatch } from 'firebase/firestore';
import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';
import { ref, uploadBytes } from 'firebase/storage';

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

// --- View Components ---
const ClientDashboardView = ({ styles, setActiveView }) => {
    const [activeProjects, setActiveProjects] = useState([]);

    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        const q = query(collection(db, 'projects'), where('clientId','==', uid));
        const unsub = onSnapshot(q,
            (snap) => {
                // Filter to Active here to avoid composite index
                const arr = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status === 'Active');
                const uniq = Array.from(new Map(arr.map(x => [x.id, x])).values());
                setActiveProjects(uniq);
            },
            (err) => console.error('Client dashboard projects query failed:', err)
        );
        return () => unsub();
    }, []);

    return (
    <div>
        <header style={styles.header}>
            <div>
                <h1 style={styles.welcomeTitle}>Welcome!</h1>
                <p style={styles.welcomeSubtitle}>Let's get your projects moving.</p>
            </div>
            <button style={{...styles.primaryButton, padding:'0.8rem 1.5rem'}} onClick={() => setActiveView('post-job')}>+ Post a New Job</button>
        </header>
        <div style={styles.mainGrid}>
            <div style={{...styles.card('0.2s', 'span 2')}}>
                 <h3 style={styles.cardTitle}>Active Projects</h3>
                 {activeProjects.length === 0 && <p style={{color:'#558B2F'}}>No active projects yet.</p>}
                 {activeProjects.map(p => (
                    <div style={styles.projectItem} key={p.id} className="project-item-hover" onClick={() => setActiveView('manage')}>
                        <div><p style={styles.projectTitle}>{p.title || 'Project'}</p><p style={styles.projectClient}>Freelancer: {p.freelancerName || p.freelancerId}</p></div>
                    </div>
                 ))}
            </div>
             <div style={{...styles.card('0.3s')}}>
                <h3 style={styles.cardTitle}>Recent Segments</h3>
                <RecentSegmentsList styles={styles} />
            </div>
            <div style={{...styles.card('0.4s', 'span 3')}}>
                <h3 style={styles.cardTitle}>Your Job Postings</h3>
                <div style={styles.tableHeader}><span>Job Title</span><span>Proposals</span><span>Status</span></div>
                <p style={{color:'#558B2F', padding:'0.5rem 1rem'}}>Browse View Proposals and Post a Job for details.</p>
            </div>
        </div>
    </div>
    );
};

const PostJobView = ({ styles }) => {
    const [selectedCategory, setSelectedCategory] = useState('Design & Creative');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState('');
    const [budget, setBudget] = useState('');
    const [timeline, setTimeline] = useState('');
    const [posting, setPosting] = useState(false);

    const postJob = async () => {
        if (!title.trim()) return alert('Please provide a title');
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
                status: 'Open',
                clientId: uid,
                clientName,
                createdAt: serverTimestamp(),
            });
            setTitle(''); setDescription(''); setSkills(''); setBudget(''); setTimeline('');
            alert('Job posted! It will now appear in freelancers\' Find Jobs.');
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
                    <h3 style={styles.cardTitle}>5. Set your budget</h3>
                    <div style={styles.formGrid}>
                        <div className="form-row"><label style={styles.formLabel}>Project Budget ($)</label><input type="number" style={styles.input} placeholder="e.g., 2500" value={budget} onChange={(e)=>setBudget(e.target.value)} /></div>
                        <div className="form-row"><label style={styles.formLabel}>Estimated Timeline</label><input style={styles.input} placeholder="e.g., 2-4 Weeks" value={timeline} onChange={(e)=>setTimeline(e.target.value)} /></div>
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
                            <img src={freelancer.avatar} alt={freelancer.name} style={{...styles.freelancerAvatar, width: '120px', height: '120px'}}/>
                            <h2 style={{...styles.modalTitle, margin: 0}}>{freelancer.name}</h2>
                            <p style={styles.freelancerTitle}>{freelancer.title}</p>
                            <p style={{color: '#558B2F'}}>{freelancer.location}</p>
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


const BrowseFreelancersView = ({ styles, setActiveView }) => {
    const [selectedFreelancer, setSelectedFreelancer] = useState(null);
    const [freelancers, setFreelancers] = useState([]);

    useEffect(() => {
        // Load freelancers from Firestore
        const unsub = onSnapshot(
            query(collection(db, 'users'), where('userType', '==', 'freelancer')),
            (snap) => setFreelancers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
        return () => unsub();
    }, []);

    return (
        <div>
            <header style={styles.header}>
                <h1 style={styles.welcomeTitle}>Browse & Hire Top Talent</h1>
                <div style={styles.searchBox}>
                    <input type="text" placeholder="Search by skill, name, or title..." style={{...styles.input, marginBottom: 0, minWidth: '300px'}} />
                </div>
            </header>
            <div style={styles.freelancerGrid}>
                {freelancers.map((f, i) => (
                    <div key={f.id} className="freelancer-card" style={{animationDelay: `${0.2 + i*0.1}s`}}>
                        <img src={f.photoUrl || 'https://via.placeholder.com/80'} alt={f.name} style={styles.freelancerAvatar}/>
                        <h3 style={styles.freelancerName}>{f.name || '—'}</h3>
                        <p style={styles.freelancerTitle}>{f.title || ''}</p>
                        <div style={{margin: '1rem 0', color: '#558B2F'}}>
                            <strong>{f.hourlyRate ? `$${f.hourlyRate}/hr` : ''}</strong>
                        </div>
                        <div style={{...styles.tagContainer, justifyContent: 'center', height: '50px', overflow: 'hidden'}}>
                            {(f.skills || []).slice(0, 3).map(s => <span key={s} style={styles.tag}>{s}</span>)}
                        </div>
                        <button style={{...styles.secondaryButton, width: '100%', marginTop: '1.5rem'}} onClick={() => setSelectedFreelancer(f)}>View Profile</button>
                    </div>
                ))}
                {freelancers.length === 0 && <p style={{ color: '#558B2F' }}>No freelancers yet.</p>}
            </div>
            {selectedFreelancer && <FreelancerProfileModal freelancer={selectedFreelancer} onClose={() => setSelectedFreelancer(null)} styles={styles} setActiveView={setActiveView} />}
        </div>
    );
};

const ViewProposalsView = ({ styles }) => {
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
        if (!p) {
            alert('No proposal selected.');
            return;
        }

        // Validate required fields
        if (!p.clientId || !p.freelancerId || !p.jobId) {
            alert('Proposal is missing required information. Please refresh and try again.');
            return;
        }

        setApproving(true);
        try {
            // Prevent duplicates if already approved
            if (p.status === 'approved' || p.projectId) {
                alert('This proposal has already been approved.');
                return;
            }

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

            alert('🎉 Proposal approved successfully! Project has been created and the freelancer has been notified.');
            
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
                alert('❌ Permission denied. You may not have the required permissions to approve this proposal. Please check your account settings or contact support.');
            } else if (err?.code === 'not-found') {
                alert('❌ Some required data was not found. The job or proposal may have been deleted. Please refresh the page and try again.');
            } else if (err?.code === 'failed-precondition') {
                alert('❌ Database operation failed. This might be due to security rules. Please try again or contact support.');
            } else if (err?.message?.includes('offline')) {
                alert('❌ You appear to be offline. Please check your internet connection and try again.');
            } else {
                alert(`❌ Failed to approve the proposal: ${err?.message || 'Unknown error'}. Please try again or contact support if the problem persists.`);
            }
        } finally {
            setApproving(false);
        }
    };

    const reject = async (p) => {
        if (!p) {
            alert('No proposal selected.');
            return;
        }

        const confirmed = window.confirm('Are you sure you want to reject this proposal? This action cannot be undone.');
        if (!confirmed) return;

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

            alert('✅ Proposal has been rejected successfully.');
            
        } catch (err) {
            console.error('Reject proposal failed:', err);
            if (err?.code === 'permission-denied') {
                alert('❌ Permission denied. You may not have the required permissions to reject this proposal.');
            } else {
                alert(`❌ Failed to reject the proposal: ${err?.message || 'Unknown error'}. Please try again.`);
            }
        } finally {
            setRejecting(false);
        }
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
        <div>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.welcomeTitle}>Proposals</h1>
                    <p style={styles.welcomeSubtitle}>{proposals.length} received</p>
                </div>
            </header>
            <div style={{display: 'flex', gap: '2rem', alignItems: 'start'}}>
                <div style={{...styles.card('0.2s'), flex: 1}}>
                    {loading && <p style={{color:'#558B2F'}}>Loading...</p>}
                {proposals.map((p,i) => (
                        <div key={p.id} className="proposal-item" style={{...styles.proposalItem(selectedProposal && p.id === selectedProposal.id), animationDelay: `${0.3 + i * 0.1}s`}} onClick={() => setSelectedProposal(p)}>
                            <img src={(p.freelancerAvatar)||'https://via.placeholder.com/40'} alt={p.freelancerId} style={{width: '40px', height: '40px', borderRadius: '50%'}}/>
                            <div>
                                <p style={{fontWeight: '600'}}>{p.freelancerName || nameCache[p.freelancerId] || p.freelancerId}</p>
                                <p style={{fontSize: '0.9rem', color: '#558B2F'}}>{p.status}</p>
                            </div>
                        </div>
                    ))}
                    {!loading && proposals.length === 0 && <p style={{color:'#558B2F'}}>No proposals yet.</p>}
                </div>
                {selectedProposal && 
                    <div style={{...styles.card('0.4s'), flex: 2}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                            <div>
                                <h3 style={styles.cardTitle}>{selectedProposal.freelancerName || selectedProposal.freelancerId}</h3>
                                <p>Status: {selectedProposal.status}</p>
                            </div>
                            {selectedProposal.status === 'pending' && (
                              <div style={{display:'flex', gap:'0.5rem'}}>
                                <button 
                                    style={{
                                        ...styles.primaryButton, 
                                        opacity: (approving || rejecting) ? 0.7 : 1,
                                        cursor: (approving || rejecting) ? 'not-allowed' : 'pointer'
                                    }} 
                                    onClick={()=>approve(selectedProposal)} 
                                    disabled={approving || rejecting}
                                >
                                    {approving ? '⏳ Approving...' : 'Approve'}
                                </button>
                                <button 
                                    style={{
                                        ...styles.secondaryButton, 
                                        opacity: (approving || rejecting) ? 0.7 : 1,
                                        cursor: (approving || rejecting) ? 'not-allowed' : 'pointer'
                                    }} 
                                    onClick={()=>reject(selectedProposal)} 
                                    disabled={approving || rejecting}
                                >
                                    {rejecting ? '⏳ Rejecting...' : 'Reject'}
                                </button>
                              </div>
                            )}
                        </div>
                        <p style={{margin: '1.5rem 0'}}>{selectedProposal.coverLetter}</p>
                    </div>
                }
            </div>
        </div>
    );
}

const ManageProjectView = ({ styles }) => {
    const [projects, setProjects] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [segments, setSegments] = useState([]);
    const [feedbackById, setFeedbackById] = useState({});
    const [updatingId, setUpdatingId] = useState('');

    // Load projects where current user is the client
    useEffect(() => {
        const uid = auth.currentUser?.uid || 'none';
        const qPrimary = query(collection(db, 'projects'), where('clientId', '==', uid), where('status','in', ['Active','Pending']));
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
                // Filter client-side to Active/Pending
                const arr2 = snap2.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => ['Active','Pending'].includes(p.status));
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
                            const itemRef = storageRef(storage, a.path);
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
            await updateDoc(doc(db, 'projects', selectedId, 'segments', segmentId), {
                status,
                feedback: feedbackById[segmentId] || ''
            });
            // Optimistically update local state so buttons hide immediately
            setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status, feedback: feedbackById[segmentId] || '' } : s));
        } finally {
            setUpdatingId('');
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
            </div>
        </div>
    )
};

const ToggleSwitch = ({ checked }) => {
    const [isChecked, setIsChecked] = useState(checked);
    return(
        <label style={{position: 'relative', display: 'inline-block', width: '44px', height: '24px'}}>
            <input type="checkbox" style={{opacity: 0, width: 0, height: 0}} checked={isChecked} onChange={() => setIsChecked(!isChecked)}/>
            <span style={{position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isChecked ? '#3B82F6' : '#ccc', transition: '.4s', borderRadius: '24px'}}>
                <span style={{position: 'absolute', content: '""', height: '20px', width: '20px', left: '2px', bottom: '2px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: isChecked ? 'translateX(20px)' : 'translateX(0px)'}}></span>
            </span>
        </label>
    )
};

const MessagesView = ({ styles }) => {
    return (
        <div style={{ background: 'transparent' }}>
            <ChatPanel />
        </div>
    );
};

const ProfileView = ({ styles }) => {
    const [name, setName] = useState('');
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
                setName(d.name || ''); setAge(d.age || ''); setEmail(d.email || ''); setPhone(d.phone || ''); setPhotoUrl(d.photoUrl || '');
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
        await setDoc(doc(db, 'users', uid), { uid, name, age: Number(age)||null, email, phone, photoUrl, userType: 'client' }, { merge: true });
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus('Save Changes'), 2000);
    };

    return (
        <div style={{...styles.card('0.2s', 'span 3')}}>
            <h3 style={styles.cardTitle}>Profile</h3>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <img src={photoUrl || 'https://via.placeholder.com/96'} alt="Avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #E8F5E9' }} />
                <div>
                    <input type="file" accept="image/*" onChange={onPhotoChange} />
                    {saving && <p style={{ color: '#558B2F' }}>Uploading...</p>}
                </div>
            </div>
            <div style={styles.formGrid}>
                <div className="form-row" style={{animationDelay: '0.2s'}}>
                    <label style={styles.formLabel}>Name</label>
                    <input type="text" style={styles.input} placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
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
    const [activeTab, setActiveTab] = useState('Password');
    const [saveStatus, setSaveStatus] = useState('Save Changes');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSave = () => {
        setSaveStatus('Saving...');
        setTimeout(() => {
            setSaveStatus('Saved!');
            setTimeout(() => setSaveStatus('Save Changes'), 2000);
        }, 1000);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'Notifications':
                return (
                    <div className="form-section">
                        <h3 style={styles.cardTitle}>Notification Settings</h3>
                        <p style={{color: '#33691E', marginBottom: '2rem', maxWidth: '80%'}}>Manage how you receive notifications. This helps you stay on top of updates.</p>
                        <div className="form-row" style={{animationDelay: '0.3s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>Email Notifications</p><p style={styles.notificationDesc}>Receive updates in your inbox.</p></div><ToggleSwitch checked={true} /></div></div>
                        <div className="form-row" style={{animationDelay: '0.4s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>New Messages</p><p style={styles.notificationDesc}>Get notified when you receive a message.</p></div><ToggleSwitch checked={true} /></div></div>
                        <div className="form-row" style={{animationDelay: '0.5s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>Project Updates</p><p style={styles.notificationDesc}>Milestones and other project updates.</p></div><ToggleSwitch checked={true} /></div></div>
                    </div>
                );
            case 'Password':
            default:
                return (
                    <div className="form-section">
                        <h3 style={styles.cardTitle}>Change Password</h3>
                        <div style={styles.formGrid}>
                            <div className="form-row" style={{animationDelay: '0.3s'}}>
                                <label style={styles.formLabel}>Current Password</label>
                                <div style={styles.passwordInputContainer}>
                                    <input type={showCurrentPassword ? 'text' : 'password'} style={styles.input} />
                                    <button style={styles.eyeButton} onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                        {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                            <div />
                            <div className="form-row" style={{animationDelay: '0.4s'}}>
                                <label style={styles.formLabel}>New Password</label>
                                <div style={styles.passwordInputContainer}>
                                    <input type={showNewPassword ? 'text' : 'password'} style={styles.input} />
                                    <button style={styles.eyeButton} onClick={() => setShowNewPassword(!showNewPassword)}>
                                        {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-row" style={{animationDelay: '0.5s'}}>
                                <label style={styles.formLabel}>Confirm New Password</label>
                                <div style={styles.passwordInputContainer}>
                                    <input type={showConfirmPassword ? 'text' : 'password'} style={styles.input} />
                                    <button style={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div>
            <header style={styles.header}><h1 style={styles.welcomeTitle}>Settings</h1></header>
            <div style={styles.tabs}>
                {['Password', 'Notifications'].map(tab => (
                    <button key={tab} style={styles.tabButton(activeTab === tab)} onClick={() => setActiveTab(tab)}>{tab}</button>
                ))}
            </div>
            <div style={{...styles.card('0.2s', 'span 3')}}>
                {renderContent()}
                <div style={{ borderTop: '1px solid #E8F5E9', marginTop: '2rem', paddingTop: '1.5rem' }}>
                    <button
                        style={{
                            ...styles.primaryButton,
                            backgroundColor: saveStatus === 'Saved!' ? '#1D4ED8' : '#3B82F6',
                        }}
                        onClick={handleSave}
                        disabled={saveStatus !== 'Save Changes'}
                    >
                        {saveStatus}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function ClientDashboard() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');
    const navigate = useNavigate();

    useEffect(() => {
      setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const handleLogout = async () => {
      const ok = window.confirm('Are you sure you want to log out?');
      if (!ok) return;
      try {
        await signOut(auth);
        navigate('/');
      } catch (e) {
        console.error('Logout failed', e);
      }
    };

    const styles = {
        dashboardContainer: { fontFamily: '"Poppins", sans-serif', backgroundColor: '#F8FAFC', display: 'flex', minHeight: '100vh', color: '#0F172A' },
        sidebar: { width: '250px', backgroundColor: '#0F172A', color: '#E2E8F0', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.5s ease', transform: isLoaded ? 'translateX(0)' : 'translateX(-100%)' },
        sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem', color: '#FFFFFF' },
        navItem: (isActive) => ({ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', backgroundColor: isActive ? '#1E40AF' : 'transparent', color: isActive ? '#FFFFFF' : '#E2E8F0', transition: 'background-color 0.2s, color 0.2s' }),
        
        mainContent: { flex: 1, padding: '2rem 3rem', opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease 0.3s', overflowY: 'auto', height: '100vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
        welcomeTitle: { fontSize: '2rem', fontWeight: 'bold' },
        welcomeSubtitle: { color: '#475569' },
        
        // Tabs (match Freelancer Dashboard behavior)
        tabs: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #E2E8F0' },
        tabButton: (isActive) => ({ padding: '0.8rem 1.5rem', border: 'none', backgroundColor: 'transparent', color: isActive ? '#0F172A' : '#475569', cursor: 'pointer', borderBottom: isActive ? '3px solid #3B82F6' : '3px solid transparent', fontWeight: isActive ? '600' : '500' }),
        
        mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', alignItems: 'start' },
        card: (delay, gridSpan = 'span 1') => ({ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', opacity: 0, animation: `fade-slide-up 0.6s ease ${delay} forwards`, gridColumn: gridSpan }),
        cardTitle: { fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' },

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

        primaryButton: { padding: '0.7rem 1.2rem', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.3s ease' },
        secondaryButton: { padding: '0.9rem 1.5rem', backgroundColor: '#EFF6FF', color: '#0F172A', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' },
        
        postJobContainer: { maxWidth: '800px', margin: '0 auto' },
        categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' },
        categoryCard: (isSelected) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', border: isSelected ? '2px solid #3B82F6' : '2px solid #E2E8F0', backgroundColor: isSelected ? '#FFFFFF' : '#F1F5F9', transform: isSelected ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s ease' }),
        formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
        formLabel: { fontWeight: '600', marginBottom: '0.5rem', display: 'block' },
        input: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
        textarea: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },

        freelancerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
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
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
.nav-item-hover:hover { background-color: #1E40AF; }
.table-row:hover { background-color: #F1F5F9; }
        .form-section { opacity: 0; animation: fade-slide-up 0.5s ease forwards; margin-bottom: 2.5rem; }
        .freelancer-card { opacity: 0; animation: fade-slide-up 0.5s ease forwards; background-color: #FFFFFF; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
        .proposal-item { opacity: 0; animation: fade-slide-up 0.5s ease forwards; }
.proposal-item:hover { background-color: #F1F5F9; }
        .project-item-hover:hover { background-color: #F9FBE7; cursor: pointer; transform: scale(1.02); }
        .message-bubble { animation: fade-slide-up 0.4s ease forwards; opacity: 0; }
        .form-row { opacity: 0; animation: fade-slide-up 0.5s ease forwards; }
        .file-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 6px; transition: background-color 0.2s ease; cursor: pointer; }
.file-item:hover { background-color: #F1F5F9; }
.category-card-hover:hover { transform: scale(1.05); border-color: #3B82F6; }
        .modal-view { animation: fade-in 0.4s; }
    `;

    const renderView = () => {
        switch(activeView) {
            case 'post-job': return <PostJobView styles={styles} />;
            case 'browse': return <BrowseFreelancersView styles={styles} setActiveView={setActiveView} />;
            case 'proposals': return <ViewProposalsView styles={styles} />;
            case 'manage': return <ManageProjectView styles={styles} />;
            case 'messages': return <MessagesView styles={styles} />;
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
        <div style={styles.dashboardContainer}>
            <aside style={styles.sidebar}>
                <div style={styles.sidebarHeader}><FlexwrkLogo /><span>FLEXwrk</span></div>
                <div style={styles.navItem(activeView === 'dashboard')} onClick={() => setActiveView('dashboard')}><DashboardIcon /><span>Dashboard</span></div>
                <div style={styles.navItem(activeView === 'post-job')} className="nav-item-hover" onClick={() => setActiveView('post-job')}><PostJobIcon /><span>Post a Job</span></div>
                <div style={styles.navItem(activeView === 'browse')} className="nav-item-hover" onClick={() => setActiveView('browse')}><BrowseIcon /><span>Browse Freelancers</span></div>
                <div style={styles.navItem(activeView === 'proposals')} className="nav-item-hover" onClick={() => setActiveView('proposals')}><ProposalsIcon /><span>View Proposals</span></div>
                <div style={styles.navItem(activeView === 'manage')} className="nav-item-hover" onClick={() => setActiveView('manage')}><ProjectsIcon /><span>Manage Projects</span></div>
                <div style={styles.navItem(activeView === 'messages')} className="nav-item-hover" onClick={() => setActiveView('messages')}><MessageIcon /><span>Messages</span></div>
                <div style={styles.navItem(activeView === 'profile')} className="nav-item-hover" onClick={() => setActiveView('profile')}><ProfileIcon /><span>Profile</span></div>
                <div style={{ marginTop: 'auto' }}>
                    <div style={styles.navItem(activeView === 'settings')} className="nav-item-hover" onClick={() => setActiveView('settings')}><SettingsIcon /><span>Settings</span></div>
                    <div style={styles.navItem(false)} className="nav-item-hover" onClick={handleLogout}><LogoutIcon /><span>Log Out</span></div>
                </div>
            </aside>
            <main style={styles.mainContent}>
                {renderView()}
            </main>
        </div>
        </>
    );
}

