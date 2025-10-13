import React, { useState, useEffect } from 'react';
import ChatPanel from '../components/ChatPanel.jsx';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebase.js';
import { collection, query, where, onSnapshot, orderBy, addDoc, doc, setDoc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- SVG Icon Components ---
const FlexwrkLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg">
         <defs>
            <linearGradient id="dashGradBlue" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E0E0E0" /></linearGradient>
            <linearGradient id="dashGradGreen" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E0E0E0" /></linearGradient>
            <linearGradient id="dashGradCyan" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E0E0E0" /></linearGradient>
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

// --- Mock Data ---
const freelancer = {
    name: '',
    email: '',
    title: '',
    location: '',
    hourlyRate: 0,
    bio: '',
    avatar: '',
    stats: { earnings: 0, projects: 0, rating: 0 },
    allProjects: [],
    portfolio: [],
    messages: [],
    jobListings: []
};

// --- View Components ---
const DashboardView = ({ styles }) => {
    const [profile, setProfile] = useState({ name: '', avatar: '', stats: { earnings: 0, projects: 0, rating: 0 } });
    const [activeProjects, setActiveProjects] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (uid) {
            getDoc(doc(db, 'users', uid)).then(snap => {
                if (snap.exists()) {
                    const d = snap.data();
                    setProfile({
                        name: d.name || '',
                        avatar: d.photoUrl || '',
                        stats: d.stats || { earnings: 0, projects: 0, rating: 0 }
                    });
                }
            });
            const unsubProjects = onSnapshot(
                query(collection(db, 'projects'), where('freelancerId', '==', uid)),
                (snap) => {
                    const arr = snap.docs.map(x=>({ id: x.id, ...x.data() })).filter(p => p.status === 'Active');
                    setActiveProjects(arr);
                },
                (err) => console.error('Freelancer Dashboard active projects query failed:', err)
            );
            // Notifications with fallback if index (read+createdAt) is missing
            const qPrimaryNotifs = query(
                collection(db, 'notifications'),
                where('userId','==', uid),
                where('read','==', false),
                orderBy('createdAt','desc')
            );
            let unsubNotifs = onSnapshot(
                qPrimaryNotifs,
                (snap) => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
                (err) => {
                    console.warn('Primary notifications query failed; falling back without orderBy. Consider creating index for (userId, read) + createdAt.', err);
                    const qFallback = query(collection(db, 'notifications'), where('userId','==', uid), where('read','==', false));
                    unsubNotifs();
                    unsubNotifs = onSnapshot(qFallback, (snap2) => {
                        const arr = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
                        // Sort client-side by createdAt desc if present
                        arr.sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0));
                        setNotifications(arr);
                    });
                }
            );
            return () => { unsubProjects(); unsubNotifs(); };
        }
    }, []);

    const markAllAsRead = async () => {
        try {
            await Promise.all(notifications.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
        } catch (e) {
            console.error('Failed to mark notifications as read', e);
        }
    };

    return (
    <div>
        <header style={styles.header}>
            <div>
                <h1 style={styles.welcomeTitle}>Welcome Back, {profile.name || 'Freelancer'}!</h1>
                <p style={styles.welcomeSubtitle}>Here's your performance snapshot for this month.</p>
            </div>
        </header>
        <div style={styles.mainGrid}>
            <div style={{...styles.card('0.2s'), ...styles.profileCard}}>
                <img src={profile.avatar || 'https://via.placeholder.com/100'} alt={profile.name} style={styles.profileAvatar}/>
                <h3 style={styles.profileName}>{profile.name || 'Your Name'}</h3>
                <div style={styles.statsGrid}>
                    <div style={styles.statItem}><div style={styles.statValue}>${(Number(profile.stats.earnings||0) / 1000).toFixed(1)}k</div><div style={styles.statLabel}>Earnings</div></div>
                    <div style={styles.statItem}><div style={styles.statValue}>{Number(profile.stats.projects||0)}</div><div style={styles.statLabel}>Projects</div></div>
                    <div style={styles.statItem}><div style={styles.statValue}>{Number(profile.stats.rating||0)}</div><div style={styles.statLabel}>Rating</div></div>
                </div>
            </div>
            <div style={{...styles.card('0.3s'), ...styles.projectList}}>
                <h3 style={styles.cardTitle}>Active Projects</h3>
                {activeProjects.slice(0, 3).map(p => (
                    <div style={styles.projectItem} key={p.id}>
                        <div><p style={styles.projectTitle}>{p.title || 'Untitled'}</p><p style={styles.projectClient}>{p.clientName || ''}</p></div>
                        <div style={styles.projectProgress}><div style={styles.progressBar(p.progress || 0)}></div></div>
                    </div>
                ))}
                {activeProjects.length === 0 && <p style={{ color: '#558B2F' }}>No active projects.</p>}
            </div>
            <div style={{...styles.card('0.4s')}}>
                <h3 style={styles.cardTitle}>Notifications</h3>
                {notifications.length === 0 && <p style={{ color: '#558B2F' }}>No new notifications.</p>}
                {notifications.slice(0,5).map(n => (
                    <div key={n.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #E8F5E9' }}>
                        <p style={{ margin: 0 }}>{n.text}</p>
                    </div>
                ))}
                {notifications.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <button style={styles.primaryButton} onClick={markAllAsRead}>Mark all as read</button>
                    </div>
                )}
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
                {['Active', 'Completed', 'Archived'].map(tab => (
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

const PortfolioView = ({ styles }) => (
    <div>
        <header style={styles.header}>
            <h1 style={styles.welcomeTitle}>My Portfolio</h1>
            <button style={{...styles.primaryButton, padding:'0.8rem 1.5rem'}}>+ Add New Project</button>
        </header>
        <div style={styles.fullPortfolioGrid}>
            {freelancer.portfolio.map((item, i) => (
                <div key={item.title} className="portfolio-item" style={{...styles.fullPortfolioItem, animationDelay: `${0.2 + i * 0.1}s`}}>
                    <img src={item.image} alt={item.title} style={styles.portfolioImage} className="portfolio-image"/>
                    <div style={styles.portfolioOverlay} className="portfolio-overlay"><p>{item.title}</p></div>
                </div>
            ))}
        </div>
    </div>
);

const MessagesView = ({ styles }) => {
    return (
        <div style={{...styles.card('0.2s', 'span 3'), padding: 0}}>
            <ChatPanel />
        </div>
    );
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

const SettingsView = ({ styles }) => {
    const [activeTab, setActiveTab] = useState('Password');
    const [saveStatus, setSaveStatus] = useState('Save Changes');

    const handleSave = () => {
        setSaveStatus('Saving...');
        setTimeout(() => {
            setSaveStatus('Saved!');
            setTimeout(() => {
                setSaveStatus('Save Changes');
            }, 2000);
        }, 1500);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'Notifications':
                return (
                    <div>
                        <h3 style={styles.cardTitle}>Notification Settings</h3>
                        <p style={{color: '#33691E', marginBottom: '2rem', maxWidth: '80%'}}>Manage how you receive notifications about your account activity.</p>
                        <div style={styles.notificationRow}><div><p style={styles.notificationLabel}>Email Notifications</p><p style={styles.notificationDesc}>Receive updates in your inbox.</p></div><ToggleSwitch checked={true} /></div>
                        <div style={styles.notificationRow}><div><p style={styles.notificationLabel}>New Messages</p><p style={styles.notificationDesc}>Get notified when you receive a new message from a client.</p></div><ToggleSwitch checked={true} /></div>
                        <div style={styles.notificationRow}><div><p style={styles.notificationLabel}>Project Updates</p><p style={styles.notificationDesc}>Updates on milestones, feedback, and project completion.</p></div><ToggleSwitch checked={true} /></div>
                    </div>
                );
            case 'Password':
            default:
                return (
                    <div>
                        <h3 style={styles.cardTitle}>Change Password</h3>
                        <div style={styles.formGrid}>
                            <input type="password" placeholder="Current Password" style={styles.input} />
                            <div />
                            <input type="password" placeholder="New Password" style={styles.input} />
                            <input type="password" placeholder="Confirm New Password" style={styles.input} />
                        </div>
                    </div>
                );
        }
    }

    return(
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
                            backgroundColor: saveStatus === 'Saved!' ? '#388E3C' : '#4CAF50',
                        }}
                        onClick={handleSave}
                        disabled={saveStatus !== 'Save Changes'}
                    >
                        {saveStatus}
                    </button>
                </div>
            </div>
        </div>
    )
};

const ApplicationModal = ({ job, onClose, styles }) => {
    const [coverLetter, setCoverLetter] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submitProposal = async () => {
        if (!auth.currentUser) return alert('Please sign in.');
        if (!coverLetter.trim()) return alert('Please add a short cover letter.');
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
            alert('Proposal submitted!');
            onClose();
        } catch (e) {
            console.error('Submit proposal failed', e);
            alert('Failed to submit proposal.');
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
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [bio, setBio] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
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
                setName(d.name || ''); setTitle(d.title || ''); setLocation(d.location || ''); setHourlyRate(d.hourlyRate || ''); setBio(d.bio || ''); setPhotoUrl(d.photoUrl || '');
            }
        });
    }, []);

    const saveProfile = async () => {
        setStatus('Saving...');
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        await setDoc(doc(db, 'users', uid), { uid, name, title, location, hourlyRate: Number(hourlyRate)||0, bio, photoUrl, userType: 'freelancer' }, { merge: true });
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
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <img src={photoUrl || 'https://via.placeholder.com/96'} alt="Avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #E8F5E9' }} />
                <div>
                    <input type="file" accept="image/*" onChange={onPhotoChange} />
                    {uploading && <p style={{ color: '#558B2F' }}>Uploading...</p>}
                </div>
            </div>
            <div style={styles.formGrid}>
                <input type="text" placeholder="Full Name" style={styles.input} value={name} onChange={(e)=>setName(e.target.value)} />
                <input type="text" placeholder="Title" style={styles.input} value={title} onChange={(e)=>setTitle(e.target.value)} />
                <input type="text" placeholder="Location" style={styles.input} value={location} onChange={(e)=>setLocation(e.target.value)} />
                <input type="number" placeholder="Hourly Rate ($)" style={styles.input} value={hourlyRate} onChange={(e)=>setHourlyRate(e.target.value)} />
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

const ManageProjectsView = ({ styles }) => {
    const [projects, setProjects] = useState([]);
    const [selected, setSelected] = useState(null);
    const [segmentTitle, setSegmentTitle] = useState('');
    const [segmentDesc, setSegmentDesc] = useState('');
    const [files, setFiles] = useState([]);
    const [saving, setSaving] = useState(false);

    // Track all submitted segments by this freelancer (across projects)
    const [mySegments, setMySegments] = useState([]);

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'projects'), where('freelancerId', '==', auth.currentUser?.uid || 'none')),
            (snap) => {
                const arr = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status === 'Active');
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
        // Use collectionGroup via Firestore SDK imported in Client; here we can read via projects/*/segments
        // We don't have collectionGroup imported directly, so use per-project aggregation as fallback
        let unsubscribers = [];
        const attach = async () => {
            // If projects aren't loaded yet, wait a tick
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

    const submitSegment = async () => {
        if (!auth.currentUser) { alert('Please sign in.'); return; }
        if (!selected) { alert('Please select a project.'); return; }
        if (!segmentTitle.trim()) { alert('Please enter a segment title.'); return; }
        setSaving(true);
        try {
            // Ensure we have authoritative project data (clientId, title)
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

            // Upload attachments first so we can include them in the initial document write (avoids update permission issues)
            let attachments = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    try {
                        const tempId = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
                        const path = `attachments/${auth.currentUser?.uid}/projects/${selected.id}/segments/${tempId}/${file.name}`;
                        const sref = ref(storage, path);
                        await uploadBytes(sref, file, { contentType: file.type || 'application/octet-stream', customMetadata: { clientId: clientId || '', projectId: selected.id, freelancerId: auth.currentUser?.uid || '' } });
                        // Store a compact record to avoid Firestore document size issues; include path for later URL resolution on client
                        let url = '';
                        try { url = await getDownloadURL(sref); } catch (_) { /* URL will be resolved in client if missing */ }
                        attachments.push({ name: file.name, path, url: url || undefined, contentType: file.type || 'application/octet-stream', size: file.size || null });
                    } catch (e) {
                        console.warn('Attachment upload failed; continuing without this file:', file?.name, e);
                    }
                }
            }

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

            setSegmentTitle(''); setSegmentDesc(''); setFiles([]);
            alert('Segment submitted for client approval.');
        } catch (e) {
            console.error('Submit segment failed', e);
            const msg = e?.code === 'storage/unauthorized' ? 'Permission denied uploading file. Please ensure Storage rules are published and you are signed in.' : (e?.message || 'Unknown error');
            alert(`Failed to submit segment: ${msg}`);
        } finally {
            setSaving(false);
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
                    <div className="form-row"><input style={styles.input} placeholder="Segment title" value={segmentTitle} onChange={(e)=>setSegmentTitle(e.target.value)} /></div>
                    <div className="form-row"><textarea rows="4" style={styles.textarea} placeholder="Describe the work" value={segmentDesc} onChange={(e)=>setSegmentDesc(e.target.value)} /></div>
                    <div className="form-row" style={{marginTop: '0.75rem'}}>
                        <label style={styles.formLabel}>Attach files (optional)</label>
                        <input type="file" multiple onChange={(e)=>setFiles(Array.from(e.target.files || []))} accept="*/*" />
                        {files && files.length > 0 && (
                            <ul style={{ color: '#558B2F', marginTop: '0.5rem' }}>
                                {files.map((f, i) => (<li key={i}>{f.name}</li>))}
                            </ul>
                        )}
                    </div>
                    <button style={{...styles.primaryButton, marginTop:'1rem'}} onClick={submitSegment} disabled={saving}>{saving?'Submitting...':'Submit for Approval'}</button>
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
        </div>
    );
};

const FindJobsView = ({ styles }) => {
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
        {selectedJob && <ApplicationModal job={selectedJob} onClose={() => setSelectedJob(null)} styles={styles} />}
    </div>
    );
};


export default function FreelancerDashboard() {
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
       
        mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', alignItems: 'start' },
       
        card: (delay, gridSpan = 'span 1') => ({ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', opacity: 0, animation: `fade-slide-up 0.6s ease ${delay} forwards`, gridColumn: gridSpan }),
        cardTitle: { fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' },

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
       
        formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
        input: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
        primaryButton: { padding: '0.9rem 1.5rem', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.3s ease' },
   
        // Find Jobs View
        findJobsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
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
        textarea: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #C5E1A5', backgroundColor: '#F9FBE7', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },
       
        // Settings View
        notificationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #E8F5E9' },
        notificationLabel: { fontWeight: '600' },
        notificationDesc: { fontSize: '0.9rem', color: '#558B2F' },

    };

    const keyframes = `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
            case 'find-jobs': return <FindJobsView styles={styles} />;
            case 'projects': return <ProjectsView styles={styles} />;
            case 'manage': return <ManageProjectsView styles={styles} />;
            case 'portfolio': return <PortfolioView styles={styles} />;
            case 'messages': return <MessagesView styles={styles} />;
            case 'profile': return <ProfileView styles={styles} />;
            case 'settings': return <SettingsView styles={styles} />;
            case 'dashboard':
            default:
                return <DashboardView styles={styles} />;
        }
    }

    return (
        <>
        <style>{keyframes}</style>
        <div style={styles.dashboardContainer}>
            <aside style={styles.sidebar}>
                <div style={styles.sidebarHeader}><FlexwrkLogo /><span>FLEXwrk</span></div>
                <div style={styles.navItem(activeView === 'dashboard')} onClick={() => setActiveView('dashboard')}><DashboardIcon /><span>Dashboard</span></div>
                <div style={styles.navItem(activeView === 'find-jobs')} className="nav-item-hover" onClick={() => setActiveView('find-jobs')}><BriefcaseIcon /><span>Find Jobs</span></div>
                <div style={styles.navItem(activeView === 'projects')} className="nav-item-hover" onClick={() => setActiveView('projects')}><ProjectsIcon /><span>My Projects</span></div>
                <div style={styles.navItem(activeView === 'manage')} className="nav-item-hover" onClick={() => setActiveView('manage')}><ProjectsIcon /><span>Manage Projects</span></div>
                <div style={styles.navItem(activeView === 'portfolio')} className="nav-item-hover" onClick={() => setActiveView('portfolio')}><PortfolioIcon /><span>Portfolio</span></div>
                <div style={styles.navItem(activeView === 'messages')} className="nav-item-hover" onClick={() => setActiveView('messages')}><MessageIcon /><span>Messages</span></div>
                <div style={styles.navItem(activeView === 'profile')} className="nav-item-hover" onClick={() => setActiveView('profile')}><SettingsIcon /><span>Profile</span></div>

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
