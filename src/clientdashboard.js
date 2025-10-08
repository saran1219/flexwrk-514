import React, { useState, useEffect } from 'react';

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
    name: "John Carter",
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    company: 'Innovatech Solutions',
    email: 'john.carter@innovatech.com',
    activeProjects: [
        { title: 'SaaS Dashboard', freelancer: 'Jane Doe', progress: 75, budget: 5000, milestones: [{name: 'Data Visualization Concepts', status: 'Completed', paid: 1500}, {name: 'Component Library', status: 'In Progress', paid: 0}, {name: 'API Integration', status: 'Pending', paid: 0}] },
        { title: 'Mobile Banking App', freelancer: 'Maria Garcia', progress: 95, budget: 8000, milestones: [{name: 'User Flow Mapping', status: 'Completed', paid: 2000}, {name: 'UI Design', status: 'Completed', paid: 4000}, {name: 'Final Review', status: 'In Progress', paid: 0}] },
    ],
    postedJobs: [
        { title: 'Video Editor for YouTube Channel', proposals: 12, status: 'Open' },
        { title: 'Content Writer for Tech Blog', proposals: 8, status: 'Open' },
        { title: 'Brand Identity', proposals: 25, status: 'Closed' },
    ],
    freelancers: [
        { name: 'Jane Doe', title: 'Senior UI/UX Designer', rating: 4.9, skills: ['Figma', 'UI/UX', 'Webflow'], avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400', hourlyRate: 75, location: 'Austin, TX', jobsCompleted: 28, bio: 'Passionate UI/UX designer with over 8 years of experience creating delightful and user-centric digital products. Specializes in e-commerce and SaaS platforms.' },
        { name: 'Alex Johnson', title: 'Lead Frontend Developer', rating: 4.8, skills: ['React', 'TypeScript', 'Node.js'], avatar: 'https://randomuser.me/api/portraits/men/22.jpg', hourlyRate: 90, location: 'New York, NY', jobsCompleted: 42, bio: 'Expert in building scalable and performant web applications. My focus is on writing clean, maintainable code and leading development teams to success.' },
        { name: 'Emily White', title: 'Brand & Graphic Designer', rating: 5.0, skills: ['Branding', 'Illustrator', 'Photoshop'], avatar: 'https://randomuser.me/api/portraits/women/78.jpg', hourlyRate: 65, location: 'Remote', jobsCompleted: 35, bio: 'I help brands tell their story through compelling visuals. From logo design to complete brand guides, I create identities that resonate with audiences.' },
        { name: 'Chris Lee', title: 'Full-Stack Developer', rating: 4.9, skills: ['Python', 'Django', 'Vue.js'], avatar: 'https://randomuser.me/api/portraits/men/78.jpg', hourlyRate: 80, location: 'San Francisco, CA', jobsCompleted: 31, bio: 'Building robust back-end systems and dynamic front-end experiences. I enjoy tackling complex problems and bringing ideas to life from start to finish.' },

    ],
    proposals: [
        { name: 'Alex Johnson', proposedRate: '$85/hr', coverLetter: 'I have extensive experience building complex dashboards with React and TypeScript...', rating: 4.8, avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
        { name: 'Samantha Bee', proposedRate: '$70/hr', coverLetter: 'As a senior frontend developer, I am confident I can deliver a high-quality product that meets your needs...', rating: 4.7, avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
    ],
    messages: [
        { name: 'Jane Doe', lastMessage: 'Hey John! It\'s going great.', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400', conversation: [ {sender: 'me', text: 'Hi Jane, how is the project coming along?'}, {sender: 'other', text: 'Hey John! It\'s going great.'}, {sender: 'me', text: 'Great, I will send the files over.'} ] },
        { name: 'Maria Garcia', lastMessage: 'Let\'s schedule a call for tomorrow.', avatar: 'https://randomuser.me/api/portraits/women/75.jpg', conversation: [ {sender: 'me', text: 'Hey Maria, I reviewed the designs. They look fantastic!'}, {sender: 'other', text: 'Thanks, John! Glad you like them.'}, {sender: 'other', text: 'Let\'s schedule a call for tomorrow to discuss the next steps.'} ]}
    ]
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

// --- View Components ---
const ClientDashboardView = ({ styles, setActiveView }) => (
    <div>
        <header style={styles.header}>
            <div>
                <h1 style={styles.welcomeTitle}>Welcome, {clientData.name}!</h1>
                <p style={styles.welcomeSubtitle}>Let's get your projects moving.</p>
            </div>
            <button style={{...styles.primaryButton, padding:'0.8rem 1.5rem'}} onClick={() => setActiveView('post-job')}>+ Post a New Job</button>
        </header>
        <div style={styles.mainGrid}>
            <div style={{...styles.card('0.2s', 'span 2')}}>
                 <h3 style={styles.cardTitle}>Active Projects</h3>
                 {clientData.activeProjects.map(p => (
                    <div style={styles.projectItem} key={p.title} className="project-item-hover" onClick={() => setActiveView('manage')}>
                        <div><p style={styles.projectTitle}>{p.title}</p><p style={styles.projectClient}>Freelancer: {p.freelancer}</p></div>
                        <div style={{width: '200px', textAlign: 'right'}}>
                            <p style={{fontSize: '0.8rem', marginBottom: '4px'}}>{p.progress}% complete</p>
                            <div style={styles.projectProgress}><div style={styles.progressBar(p.progress)}></div></div>
                        </div>
                    </div>
                 ))}
            </div>
             <div style={{...styles.card('0.3s')}}>
                <h3 style={styles.cardTitle}>Recent Messages</h3>
                {clientData.messages.slice(0,2).map(m => (
                    <div style={styles.messageItem} key={m.name}>
                        <img src={m.avatar} alt={m.name} style={styles.messageAvatar}/>
                        <div><p style={styles.messageName}>{m.name}</p><p style={styles.messageLast}>{m.lastMessage}</p></div>
                    </div>
                ))}
            </div>
            <div style={{...styles.card('0.4s', 'span 3')}}>
                <h3 style={styles.cardTitle}>Your Job Postings</h3>
                <div style={styles.tableHeader}><span>Job Title</span><span>Proposals</span><span>Status</span></div>
                {clientData.postedJobs.map((job, i) => (
                    <div className="table-row" style={{...styles.tableRow, animationDelay: `${0.5 + i*0.1}s`}} key={job.title}>
                        <p>{job.title}</p>
                        <p>{job.proposals}</p>
                        <p><span style={styles.statusBadge(job.status)}>{job.status}</span></p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const PostJobView = ({ styles }) => {
    const [selectedCategory, setSelectedCategory] = useState('Design & Creative');
    return(
        <div>
            <header style={styles.header}><h1 style={styles.welcomeTitle}>Create a New Job Posting</h1></header>
            <div style={styles.postJobContainer}>
                <div className="form-section" style={{animationDelay: '0.2s'}}>
                    <h3 style={styles.cardTitle}>1. What's the title of your project?</h3>
                    <input style={styles.input} placeholder="e.g., Video Editor for YouTube Channel"/>
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
                    <textarea style={styles.textarea} rows="6" placeholder="Provide a detailed description of the deliverables, timeline, and expectations..."></textarea>
                </div>
                
                <div className="form-section" style={{animationDelay: '0.5s'}}>
                     <h3 style={styles.cardTitle}>4. What skills are required?</h3>
                     <input style={styles.input} placeholder="e.g., Figma, Webflow, UI Design (comma-separated)"/>
                </div>

                <div className="form-section" style={{animationDelay: '0.6s'}}>
                    <h3 style={styles.cardTitle}>5. Set your budget</h3>
                    <div style={styles.formGrid}>
                        <div className="form-row"><label style={styles.formLabel}>Project Budget ($)</label><input type="number" style={styles.input} placeholder="e.g., 2500"/></div>
                        <div className="form-row"><label style={styles.formLabel}>Estimated Timeline</label><input style={styles.input} placeholder="e.g., 2-4 Weeks"/></div>
                    </div>
                </div>
                
                 <div className="form-section" style={{animationDelay: '0.7s', textAlign: 'right'}}>
                    <button style={styles.primaryButton}>Post Job</button>
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
    return (
        <div>
            <header style={styles.header}>
                <h1 style={styles.welcomeTitle}>Browse & Hire Top Talent</h1>
                <div style={styles.searchBox}>
                    <input type="text" placeholder="Search by skill, name, or title..." style={{...styles.input, marginBottom: 0, minWidth: '300px'}} />
                </div>
            </header>
            <div style={styles.freelancerGrid}>
                {clientData.freelancers.map((f, i) => (
                    <div key={f.name} className="freelancer-card" style={{animationDelay: `${0.2 + i*0.1}s`}}>
                        <img src={f.avatar} alt={f.name} style={styles.freelancerAvatar}/>
                        <h3 style={styles.freelancerName}>{f.name}</h3>
                        <p style={styles.freelancerTitle}>{f.title}</p>
                        <div style={{margin: '1rem 0', color: '#558B2F'}}>
                            <strong>${f.hourlyRate}/hr</strong> &bull; <span>{f.rating} ★</span>
                        </div>
                        <div style={{...styles.tagContainer, justifyContent: 'center', height: '50px', overflow: 'hidden'}}>
                            {f.skills.slice(0, 3).map(s => <span key={s} style={styles.tag}>{s}</span>)}
                        </div>
                        <button style={{...styles.secondaryButton, width: '100%', marginTop: '1.5rem'}} onClick={() => setSelectedFreelancer(f)}>View Profile</button>
                    </div>
                ))}
            </div>
            {selectedFreelancer && <FreelancerProfileModal freelancer={selectedFreelancer} onClose={() => setSelectedFreelancer(null)} styles={styles} setActiveView={setActiveView} />}
        </div>
    );
};

const ViewProposalsView = ({ styles }) => {
    const [selectedProposal, setSelectedProposal] = useState(clientData.proposals[0]);
    return (
        <div>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.welcomeTitle}>Proposals for "Video Editor"</h1>
                    <p style={styles.welcomeSubtitle}>{clientData.proposals.length} freelancers have applied.</p>
                </div>
            </header>
            <div style={{display: 'flex', gap: '2rem', alignItems: 'start'}}>
                <div style={{...styles.card('0.2s'), flex: 1}}>
                    {clientData.proposals.map((p,i) => (
                        <div key={p.name} className="proposal-item" style={{...styles.proposalItem(p === selectedProposal), animationDelay: `${0.3 + i * 0.1}s`}} onClick={() => setSelectedProposal(p)}>
                            <img src={p.avatar} alt={p.name} style={{width: '40px', height: '40px', borderRadius: '50%'}}/>
                            <div>
                                <p style={{fontWeight: '600'}}>{p.name}</p>
                                <p style={{fontSize: '0.9rem', color: '#558B2F'}}>{p.proposedRate}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedProposal && 
                    <div style={{...styles.card('0.4s'), flex: 2}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                            <div>
                                <h3 style={styles.cardTitle}>{selectedProposal.name}</h3>
                                <p>Rating: {selectedProposal.rating} ★</p>
                            </div>
                             <button style={styles.primaryButton}>Hire Now</button>
                        </div>
                        <p style={{margin: '1.5rem 0'}}>{selectedProposal.coverLetter}</p>
                    </div>
                }
            </div>
        </div>
    );
}

const ManageProjectView = ({ styles }) => {
    const project = clientData.activeProjects[0];
    return(
        <div>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.welcomeTitle}>Manage: {project.title}</h1>
                    <p style={styles.welcomeSubtitle}>Freelancer: {project.freelancer}</p>
                </div>
            </header>
            <div style={styles.manageProjectGrid}>
                <div style={{...styles.card('0.2s', 'span 2')}}>
                    <h3 style={styles.cardTitle}>Project Milestones</h3>
                    {project.milestones.map((m, i) => (
                        <div key={i} style={{...styles.milestoneItem, animationDelay: `${0.3 + i*0.1}s`}} className="form-row">
                            {m.status === 'Completed' ? <CheckCircleIcon color="#4CAF50"/> : <ClockIcon color="#558B2F"/>}
                            <div style={{flex: 1}}>
                                <p style={{fontWeight: '600'}}>{m.name}</p>
                                <p style={{fontSize: '0.9rem', color: '#558B2F'}}>Payment: ${m.paid.toLocaleString()}</p>
                            </div>
                            {m.status === 'In Progress' ? (
                                <button style={styles.primaryButton}>Approve Milestone</button>
                            ) : (
                                <span style={styles.milestoneStatus(m.status)}>{m.status}</span>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{...styles.card('0.3s')}}>
                     <h3 style={styles.cardTitle}>Project Files</h3>
                     <div style={styles.fileList}>
                        <div className="file-item"><FileIcon/> <span>Initial_Wireframes.fig</span></div>
                        <div className="file-item"><FileIcon/> <span>User_Flow_Diagram.pdf</span></div>
                     </div>
                </div>
                <div style={{...styles.card('0.4s', 'span 3'), padding: 0, overflow: 'hidden'}}>
                    <div style={{display: 'flex', height: '100%'}}>
                        <div style={{flex: 1, padding: '1.5rem', borderRight: '1px solid #E8F5E9'}}>
                            <h3 style={styles.cardTitle}>Project Chat</h3>
                            <div style={styles.messageArea}>
                                {clientData.messages[0].conversation.map((msg, i) => (
                                    <div key={i} style={{...styles.messageBubble(msg.sender !== 'me'), animationDelay: `${0.1 + i*0.15}s`}} className="message-bubble">{msg.text}</div>
                                ))}
                            </div>
                            <div style={styles.messageInputContainer}>
                                <input type="text" placeholder={`Type a message to ${project.freelancer}...`} style={styles.messageInput}/>
                                <button style={styles.sendButton}><SendIcon/></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const SettingsView = ({ styles }) => {
    const [activeTab, setActiveTab] = useState('Profile');
    const [saveStatus, setSaveStatus] = useState('Save Changes');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            case 'Password':
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
            case 'Notifications':
                return (
                    <div className="form-section">
                        <h3 style={styles.cardTitle}>Notification Settings</h3>
                        <p style={{color: '#33691E', marginBottom: '2rem', maxWidth: '80%'}}>Manage how you receive notifications. This helps you stay on top of project updates and proposals.</p>
                        <div className="form-row" style={{animationDelay: '0.3s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>Email Notifications</p><p style={styles.notificationDesc}>Receive updates in your inbox.</p></div><ToggleSwitch checked={true} /></div></div>
                        <div className="form-row" style={{animationDelay: '0.4s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>New Proposals</p><p style={styles.notificationDesc}>Get notified when a freelancer applies to your job post.</p></div><ToggleSwitch checked={true} /></div></div>
                        <div className="form-row" style={{animationDelay: '0.5s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>Milestone Approvals</p><p style={styles.notificationDesc}>Updates when a freelancer completes a milestone.</p></div><ToggleSwitch checked={true} /></div></div>
                    </div>
                );
            case 'Profile':
            default:
                return (
                    <div className="form-section">
                        <h3 style={styles.cardTitle}>Company Profile</h3>
                        <div style={styles.formGrid}>
                            <div className="form-row" style={{animationDelay: '0.3s'}}><label style={styles.formLabel}>Company Name</label><input type="text" style={styles.input} defaultValue={clientData.company} /></div>
                            <div className="form-row" style={{animationDelay: '0.4s'}}><label style={styles.formLabel}>Contact Name</label><input type="email" style={styles.input} defaultValue={clientData.name} /></div>
                            <div className="form-row" style={{animationDelay: '0.5s'}}><label style={styles.formLabel}>Contact Email</label><input type="text" style={styles.input} defaultValue={clientData.email} /></div>
                        </div>
                    </div>
                );
        }
    }

    return(
        <div>
            <header style={styles.header}><h1 style={styles.welcomeTitle}>Settings</h1></header>
            <div style={styles.tabs}>
                {['Profile', 'Password', 'Notifications'].map(tab => (
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


export default function ClientDashboard() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
      setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const styles = {
        dashboardContainer: { fontFamily: '"Poppins", sans-serif', backgroundColor: '#F1F8E9', display: 'flex', minHeight: '100vh', color: '#1B5E20' },
        sidebar: { width: '250px', backgroundColor: '#1B5E20', color: '#E8F5E9', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.5s ease', transform: isLoaded ? 'translateX(0)' : 'translateX(-100%)' },
        sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem', color: '#FFFFFF' },
        navItem: (isActive) => ({ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', backgroundColor: isActive ? '#33691E' : 'transparent', color: isActive ? '#FFFFFF' : '#E8F5E9', transition: 'background-color 0.2s, color 0.2s' }),
        
        mainContent: { flex: 1, padding: '2rem 3rem', opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease 0.3s', overflowY: 'auto', height: '100vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
        welcomeTitle: { fontSize: '2rem', fontWeight: 'bold' },
        welcomeSubtitle: { color: '#558B2F' },
        
        mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', alignItems: 'start' },
        card: (delay, gridSpan = 'span 1') => ({ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', opacity: 0, animation: `fade-slide-up 0.6s ease ${delay} forwards`, gridColumn: gridSpan }),
        cardTitle: { fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' },

        projectItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', borderRadius: '8px', transition: 'background-color 0.2s ease, transform 0.2s ease' },
        projectTitle: { fontWeight: '600' },
        projectClient: { fontSize: '0.9rem', color: '#558B2F' },
        projectProgress: { width: '100%', backgroundColor: '#DCEDC8', borderRadius: '8px', height: '8px' },
        progressBar: (progress) => ({ width: `${progress}%`, backgroundColor: '#4CAF50', height: '8px', borderRadius: '8px' }),
        
        messageItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 0' },
        messageAvatar: { width: '40px', height: '40px', borderRadius: '50%' },
        messageName: { fontWeight: '600' },
        messageLast: { fontSize: '0.9rem', color: '#558B2F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '150px' },
        
        tableHeader: { display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', color: '#558B2F', padding: '0.8rem 1.5rem', fontSize: '0.9rem', textTransform: 'uppercase' },
        tableRow: { display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '0.5rem', opacity: 0, animation: 'fade-slide-up 0.5s ease forwards' },
        statusBadge: (status) => ({
            backgroundColor: status === 'Open' ? '#C8E6C9' : '#FFCDD2',
            color: status === 'Open' ? '#1B5E20' : '#B71C1C',
            padding: '0.2rem 0.8rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'inline-block'
        }),

        primaryButton: { padding: '0.7rem 1.2rem', backgroundColor: '#4CAF50', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.3s ease' },
        secondaryButton: { padding: '0.9rem 1.5rem', backgroundColor: '#E8F5E9', color: '#1B5E20', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' },
        
        postJobContainer: { maxWidth: '800px', margin: '0 auto' },
        categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' },
        categoryCard: (isSelected) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', border: isSelected ? '2px solid #4CAF50' : '2px solid #E8F5E9', backgroundColor: isSelected ? '#FFFFFF' : '#F9FBE7', transform: isSelected ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s ease' }),
        formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
        formLabel: { fontWeight: '600', marginBottom: '0.5rem', display: 'block' },
        input: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #C5E1A5', backgroundColor: '#FFFFFF', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
        textarea: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #C5E1A5', backgroundColor: '#FFFFFF', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },

        freelancerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
        freelancerAvatar: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '4px solid #FFFFFF', boxShadow: '0 0 10px rgba(0,0,0,0.1)' },
        freelancerName: { fontWeight: 'bold', fontSize: '1.2rem' },
        freelancerTitle: { fontSize: '0.9rem', color: '#558B2F' },
        tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
        tag: { backgroundColor: '#E8F5E9', color: '#33691E', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem' },

        proposalItem: (isActive) => ({ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', borderRadius: '8px', cursor: 'pointer', backgroundColor: isActive ? '#E8F5E9' : 'transparent', border: isActive ? '1px solid #C5E1A5' : '1px solid transparent' }),
        
        modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(27, 94, 32, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, animation: 'fade-in 0.3s' },
        modalContent: { backgroundColor: '#FFFFFF', borderRadius: '16px', width: '90%', maxWidth: '600px', padding: '2rem', animation: 'fade-slide-up 0.4s ease forwards', position: 'relative', overflow: 'hidden', minHeight: '400px' },
        modalCloseButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#558B2F' },
        modalTitle: { fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' },
        projectDetailPanel: { position: 'fixed', top: 0, right: 0, height: '100%', width: '450px', backgroundColor: '#FFFFFF', boxShadow: '-5px 0 20px rgba(0,0,0,0.1)', animation: 'slide-in-right 0.4s ease forwards', padding: '2rem', boxSizing: 'border-box', overflowY: 'auto' },
        milestoneItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 0', borderBottom: '1px solid #E8F5E9' },
        milestoneStatus: (status) => ({ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: '500', color: status === 'Completed' ? '#4CAF50' : '#558B2F' }),
        fileList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
        
        messageBubble: (isSender) => ({ alignSelf: isSender ? 'flex-end' : 'flex-start', backgroundColor: isSender ? '#4CAF50' : '#E8F5E9', color: isSender ? '#FFFFFF' : '#1B5E20', padding: '0.75rem 1rem', borderRadius: '16px', maxWidth: '70%' }),
        messageArea: { flex: 1, padding: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' },
        messageInputContainer: { display: 'flex', padding: '1rem 0 0', borderTop: '1px solid #E8F5E9' },
        messageInput: { flex: 1, border: '1px solid #C5E1A5', borderRadius: '8px', padding: '0.75rem', outline: 'none' },
        sendButton: { border: 'none', backgroundColor: '#4CAF50', color: '#FFFFFF', borderRadius: '8px', padding: '0.75rem', marginLeft: '0.5rem', cursor: 'pointer' },
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
        .nav-item-hover:hover { background-color: #33691E; }
        .table-row:hover { background-color: #F9FBE7; }
        .form-section { opacity: 0; animation: fade-slide-up 0.5s ease forwards; margin-bottom: 2.5rem; }
        .freelancer-card { opacity: 0; animation: fade-slide-up 0.5s ease forwards; background-color: #FFFFFF; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
        .proposal-item { opacity: 0; animation: fade-slide-up 0.5s ease forwards; }
        .proposal-item:hover { background-color: #F1F8E9; }
        .project-item-hover:hover { background-color: #F9FBE7; cursor: pointer; transform: scale(1.02); }
        .message-bubble { animation: fade-slide-up 0.4s ease forwards; opacity: 0; }
        .form-row { opacity: 0; animation: fade-slide-up 0.5s ease forwards; }
        .file-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 6px; transition: background-color 0.2s ease; cursor: pointer; }
        .file-item:hover { background-color: #F1F8E9; }
        .category-card-hover:hover { transform: scale(1.05); border-color: #4CAF50; }
        .modal-view { animation: fade-in 0.4s; }
    `;

    const renderView = () => {
        switch(activeView) {
            case 'post-job': return <PostJobView styles={styles} />;
            case 'browse': return <BrowseFreelancersView styles={styles} setActiveView={setActiveView} />;
            case 'proposals': return <ViewProposalsView styles={styles} />;
            case 'manage': return <ManageProjectView styles={styles} />;
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
                <div style={{ marginTop: 'auto' }}>
                    <div style={styles.navItem(activeView === 'settings')} className="nav-item-hover" onClick={() => setActiveView('settings')}><SettingsIcon /><span>Settings</span></div>
                    <div style={styles.navItem(false)} className="nav-item-hover"><LogoutIcon /><span>Log Out</span></div>
                </div>
            </aside>
            <main style={styles.mainContent}>
                {renderView()}
            </main>
        </div>
        </>
    );
}

