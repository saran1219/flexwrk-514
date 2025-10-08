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
const ProjectsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
const PortfolioIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const MessageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const SettingsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const LogoutIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const SendIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>;
const BriefcaseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const BookmarkIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const EyeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;


// --- Mock Data ---
const freelancer = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    title: 'Senior UI/UX Designer',
    location: 'Austin, TX',
    hourlyRate: 75,
    bio: 'I am a passionate UI/UX designer with over 8 years of experience creating delightful and user-centric digital products. I specialize in building complex web applications and have a deep love for clean, efficient design systems.',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    stats: { earnings: 12450, projects: 18, rating: 4.9 },
    allProjects: [
        { title: 'E-commerce Redesign', client: 'Innovatech', status: 'Completed', progress: 100, budget: 3500, image: 'https://images.pexels.com/photos/38519/macbook-laptop-ipad-apple-38519.jpeg?auto=compress&cs=tinysrgb&w=600', startDate: 'Aug 1, 2023', endDate: 'Sep 15, 2023', milestones: [{name: 'Initial Wireframes', status: 'Completed'}, {name: 'High-Fidelity Mockups', status: 'Completed'}, {name: 'Prototype', status: 'Completed'}] },
        { title: 'SaaS Dashboard', client: 'QuantumLeap', status: 'Active', progress: 75, budget: 5000, image: 'https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=600', startDate: 'Sep 5, 2023', endDate: 'Oct 20, 2023', milestones: [{name: 'Data Visualization Concepts', status: 'Completed'}, {name: 'Component Library', status: 'In Progress'}, {name: 'API Integration', status: 'Pending'}] },
        { title: 'Mobile Banking App', client: 'Synergy Labs', status: 'Active', progress: 95, budget: 8000, image: 'https://images.pexels.com/photos/4386341/pexels-photo-4386341.jpeg?auto=compress&cs=tinysrgb&w=600', startDate: 'Sep 20, 2023', endDate: 'Nov 30, 2023', milestones: [{name: 'User Flow Mapping', status: 'Completed'}, {name: 'UI Design', status: 'Completed'}, {name: 'Final Review', status: 'In Progress'}] },
        { title: 'Brand Identity', client: 'Creative Co.', status: 'Completed', progress: 100, budget: 1500, image: 'https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=600', startDate: 'Jul 10, 2023', endDate: 'Aug 5, 2023', milestones: [{name: 'Logo Concepts', status: 'Completed'}, {name: 'Style Guide', status: 'Completed'}] },
        { title: 'Marketing Website', client: 'Growth Inc.', status: 'Archived', progress: 100, budget: 2200, image: 'https://images.pexels.com/photos/1995730/pexels-photo-1995730.jpeg?auto=compress&cs=tinysrgb&w=600', startDate: 'Jun 1, 2023', endDate: 'Jul 1, 2023', milestones: [{name: 'Web Pages Design', status: 'Completed'}, {name: 'Development Handoff', status: 'Completed'}] },
    ],
    portfolio: [
        { title: 'E-commerce Redesign', image: 'https://images.pexels.com/photos/38519/macbook-laptop-ipad-apple-38519.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'UI/UX Design', description: 'A complete redesign of a major e-commerce platform focusing on improving user flow and conversion rates.', tools: ['Figma', 'Adobe XD'] },
        { title: 'SaaS Dashboard', image: 'https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Web Development', description: 'Developed a complex data analytics dashboard using React and D3.js, providing users with real-time insights.', tools: ['React', 'D3.js', 'GraphQL'] },
        { title: 'Mobile Banking App', image: 'https://images.pexels.com/photos/4386341/pexels-photo-4386341.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Mobile Design', description: 'Designed a user-friendly mobile banking application for iOS and Android, focusing on security and ease of use.', tools: ['Sketch', 'InVision', 'Zeplin'] },
        { title: 'Branding Project', image: 'https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Branding', description: 'Created a complete brand identity for a new startup, including logo, color palette, and marketing materials.', tools: ['Adobe Illustrator', 'Photoshop'] },
        { title: 'Marketing Website', image: 'https://images.pexels.com/photos/1995730/pexels-photo-1995730.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Web Development', description: 'Built a fully responsive marketing website on Webflow with custom animations and CMS integration.', tools: ['Webflow', 'Figma', 'Lottie'] },
        { title: 'Illustration Set', image: 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Illustration', description: 'Designed a set of 20 custom illustrations for a tech company\'s blog and social media channels.', tools: ['Procreate', 'Adobe Illustrator'] },
    ],
    messages: [
        { name: 'John Smith', project: 'SaaS Dashboard', lastMessage: 'Great, I will send the files over.', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', online: true, unread: 2, timestamp: '10:42 AM', conversation: [ {sender: 'other', text: 'Hi Jane, how is the project coming along?'}, {sender: 'me', text: 'Hey John! It\'s going great.'}, {sender: 'other', text: 'Great, I will send the files over.'} ]},
        { name: 'Steven Terry', project: 'E-commerce Redesign', lastMessage: 'Payment has been released for the...', avatar: 'https://randomuser.me/api/portraits/men/76.jpg', online: false, unread: 0, timestamp: 'Yesterday', conversation: [ {sender: 'other', text: 'Payment has been released for the final milestone.'} ]},
        { name: 'Maria Garcia', project: 'Mobile Banking App', lastMessage: 'Let\'s schedule a call for tomorrow.', avatar: 'https://randomuser.me/api/portraits/women/75.jpg', online: true, unread: 0, timestamp: 'Yesterday', conversation: [ {sender: 'other', text: 'Hey Jane, I reviewed the designs. They look fantastic!'}, {sender: 'me', text: 'Thanks, Maria! Glad you like them.'}, {sender: 'other', text: 'Let\'s schedule a call for tomorrow to discuss the next steps.'} ]},
        { name: 'Chris Lee', project: 'Internal Project', lastMessage: 'Can you check the latest commit?', avatar: 'https://randomuser.me/api/portraits/men/78.jpg', online: false, unread: 1, timestamp: '2d ago', conversation: [ {sender: 'other', text: 'Can you check the latest commit? I pushed the changes for the login flow.'} ]},
        { name: 'Emily White', project: 'Branding Project', lastMessage: 'The new branding is perfect!', avatar: 'https://randomuser.me/api/portraits/women/78.jpg', online: true, unread: 0, timestamp: '4d ago', conversation: [ {sender: 'other', text: 'The new branding is perfect! Our team loves it.'} ]},
    ],
    jobListings: [
        { title: 'Video Editor for YouTube Channel', client: 'Creator Hub', location: 'Remote', type: 'Hourly', budget: '$25 - $40/hr', skills: ['Premiere Pro', 'After Effects', 'Storytelling'], posted: '1d ago', description: 'Seeking a creative video editor to produce engaging content for a fast-growing YouTube channel. Long-term collaboration potential.' },
        { title: 'Social Media Graphic Designer', client: 'Maven Marketing', location: 'Remote', type: 'Fixed-Price', budget: '$800', skills: ['Canva', 'Photoshop', 'Branding'], posted: '3d ago', description: 'We need a designer to create a batch of 30 social media graphics for an upcoming campaign. Must have a strong portfolio of social media work.' },
        { title: 'Content Writer for Tech Blog', client: 'ByteSize News', location: 'Remote', type: 'Fixed-Price', budget: '$150 per article', skills: ['Writing', 'SEO', 'Tech'], posted: '5d ago', description: 'Experienced tech writer needed for 4 blog posts per month (1000-1500 words each) on topics related to AI and software development.' },
        { title: 'Virtual Assistant for E-commerce', client: 'Shopify Gurus', location: 'Remote', type: 'Hourly', budget: '$15 - $20/hr', skills: ['Admin', 'Customer Support', 'Shopify'], posted: '1w ago', description: 'Looking for a reliable virtual assistant to handle customer service inquiries, order processing, and administrative tasks for our Shopify store.'},
        { title: 'Voice Over Artist for Podcast Intro', client: 'AudioScape', location: 'Remote', type: 'Fixed-Price', budget: '$250', skills: ['Voice Acting', 'Audio Editing'], posted: '1w ago', description: 'We need a professional voice over for a 30-second podcast intro. Male or female voice with a clear, energetic tone.'},
        { title: 'WordPress Developer for Site Revamp', client: 'GreenLeaf Organics', location: 'Remote', type: 'Contract', budget: '$2,500', skills: ['WordPress', 'PHP', 'CSS'], posted: '2w ago', description: 'We are looking to revamp our existing WordPress website. The project involves a theme update, plugin customization, and performance optimization.'},
        { title: 'Illustrator for Children\'s Book', client: 'StoryWeaver Press', location: 'Remote', type: 'Fixed-Price', budget: '$1,200', skills: ['Illustration', 'Adobe Illustrator', 'Character Design'], posted: '2w ago', description: 'We are looking for a talented illustrator to create 20 full-page illustrations for a new children\'s book. A whimsical and colorful style is preferred.'},
        { title: 'Music Producer for Podcast Theme', client: 'SoundWaves Media', location: 'Remote', type: 'Fixed-Price', budget: '$500', skills: ['Music Production', 'Logic Pro X', 'Sound Design'], posted: '3w ago', description: 'Create a catchy and professional 30-60 second theme song for a new true-crime podcast. Must deliver in high-quality WAV format.'},
        { title: 'Technical Translator (English to Spanish)', client: 'Global Connect', location: 'Remote', type: 'Hourly', budget: '$30 - $45/hr', skills: ['Translation', 'Spanish', 'Technical Writing'], posted: '4w ago', description: 'We need a native Spanish speaker to translate technical documentation for a software product. Experience with localization and software terminology is a must.'}
    ]
};

// --- View Components ---
const DashboardView = ({ styles }) => (
    <div>
        <header style={styles.header}>
            <div>
                <h1 style={styles.welcomeTitle}>Welcome Back, {freelancer.name}!</h1>
                <p style={styles.welcomeSubtitle}>Here's your performance snapshot for this month.</p>
            </div>
        </header>
        <div style={styles.mainGrid}>
            <div style={{...styles.card('0.2s'), ...styles.profileCard}}>
                <img src={freelancer.avatar} alt={freelancer.name} style={styles.profileAvatar}/>
                <h3 style={styles.profileName}>{freelancer.name}</h3>
                <div style={styles.statsGrid}>
                    <div style={styles.statItem}><div style={styles.statValue}>${(freelancer.stats.earnings / 1000).toFixed(1)}k</div><div style={styles.statLabel}>Earnings</div></div>
                    <div style={styles.statItem}><div style={styles.statValue}>{freelancer.stats.projects}</div><div style={styles.statLabel}>Projects</div></div>
                    <div style={styles.statItem}><div style={styles.statValue}>{freelancer.stats.rating}</div><div style={styles.statLabel}>Rating</div></div>
                </div>
            </div>
            <div style={{...styles.card('0.3s'), ...styles.projectList}}>
                <h3 style={styles.cardTitle}>Last Projects</h3>
                {freelancer.allProjects.slice(0, 3).map(p => (
                    <div style={styles.projectItem} key={p.title}>
                        <div><p style={styles.projectTitle}>{p.title}</p><p style={styles.projectClient}>{p.client}</p></div>
                        <div style={styles.projectProgress}><div style={styles.progressBar(p.progress)}></div></div>
                    </div>
                ))}
            </div>
            <div style={{...styles.card('0.4s'), ...styles.messageList}}>
                <h3 style={styles.cardTitle}>Recent Messages</h3>
                {freelancer.messages.map(m => (
                    <div style={styles.messageItem} key={m.name}>
                        <img src={m.avatar} alt={m.name} style={styles.messageAvatar}/>
                        <div><p style={styles.messageName}>{m.name}</p><p style={styles.messageLast}>{m.lastMessage}</p></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ProjectDetailModal = ({ project, onClose, styles }) => (
    <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.projectDetailPanel} onClick={e => e.stopPropagation()}>
            <button onClick={onClose} style={styles.modalCloseButton}><XIcon /></button>
            <h2 style={styles.modalTitle}>{project.title}</h2>
            <p style={styles.jobClient}>Client: {project.client}</p>
            
            <div style={{...styles.tagContainer, margin: '1rem 0'}}>
                <span style={styles.tag}>{project.startDate} - {project.endDate}</span>
                <span style={styles.tag}>${project.budget.toLocaleString()}</span>
            </div>

            <h3 style={styles.cardTitle}>Overall Progress</h3>
            <div style={styles.projectProgress}><div style={styles.progressBar(project.progress)}></div></div>

            <h3 style={{...styles.cardTitle, marginTop: '2rem'}}>Milestones</h3>
            <div>
                {project.milestones.map((m, i) => (
                    <div key={i} style={styles.milestoneItem}>
                        {m.status === 'Completed' ? <CheckCircleIcon color="#4CAF50"/> : <ClockIcon color="#F57F17"/>}
                        <p>{m.name}</p>
                        <span style={styles.milestoneStatus(m.status)}>{m.status}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ProjectsView = ({ styles }) => {
    const [filter, setFilter] = useState('Active');
    const [selectedProject, setSelectedProject] = useState(null);
    const filteredProjects = freelancer.allProjects.filter(p => p.status === filter);

    return (
        <div>
            <header style={styles.header}><h1 style={styles.welcomeTitle}>My Projects</h1></header>
            <div style={styles.tabs}>
                {['Active', 'Completed', 'Archived'].map(tab => (
                    <button key={tab} style={styles.tabButton(filter === tab)} onClick={() => setFilter(tab)}>{tab} ({freelancer.allProjects.filter(p => p.status === tab).length})</button>
                ))}
            </div>
             <div style={styles.projectsGrid}>
                {filteredProjects.map((p, i) => (
                    <div key={p.title} className="project-card" style={{animationDelay: `${0.2 + i*0.1}s`}} onClick={() => setSelectedProject(p)}>
                        <img src={p.image} alt={p.title} style={styles.projectCardImage}/>
                        <div style={styles.projectCardContent}>
                            <span style={styles.statusBadge(p.status)}>{p.status}</span>
                            <h3 style={styles.projectCardTitle}>{p.title}</h3>
                            <p style={styles.projectCardClient}>Client: {p.client}</p>
                            <div style={styles.projectCardFooter}>
                                <span style={styles.projectCardBudget}>${p.budget.toLocaleString()}</span>
                                <div style={{width: '50%'}}>
                                    <p style={{textAlign: 'right', fontSize: '0.8rem', marginBottom: '4px'}}>{p.progress}%</p>
                                    <div style={styles.projectProgress}><div style={styles.progressBar(p.progress)}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} styles={styles} />}
        </div>
    );
};

const PortfolioView = ({ styles }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    return (
        <div>
            <header style={styles.header}>
                <h1 style={styles.welcomeTitle}>My Portfolio</h1>
                <button style={{...styles.primaryButton, padding:'0.8rem 1.5rem'}}>+ Add New Project</button>
            </header>
            <div style={styles.fullPortfolioGrid}>
                {freelancer.portfolio.map((item, i) => (
                    <div key={item.title} className="portfolio-item" style={{...styles.fullPortfolioItem, animationDelay: `${0.2 + i * 0.1}s`}} onClick={() => setSelectedItem(item)}>
                        <img src={item.image} alt={item.title} style={styles.portfolioImage} className="portfolio-image"/>
                        <div style={styles.portfolioOverlay} className="portfolio-overlay">
                            <p style={styles.portfolioCardTitle}>{item.title}</p>
                            <span style={styles.portfolioCardCategory}>{item.category}</span>
                        </div>
                    </div>
                ))}
            </div>
            {selectedItem && 
                <div style={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
                    <div style={{...styles.modalContent, maxWidth: '800px'}} onClick={e => e.stopPropagation()}>
                         <button onClick={() => setSelectedItem(null)} style={styles.modalCloseButton}><XIcon /></button>
                         <img src={selectedItem.image} alt={selectedItem.title} style={{width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem'}}/>
                         <h2 style={styles.modalTitle}>{selectedItem.title}</h2>
                         <div style={{...styles.tagContainer, margin: '1rem 0'}}>
                            <span style={styles.tag}>{selectedItem.category}</span>
                         </div>
                         <p style={{color: '#33691E', marginBottom: '1.5rem'}}>{selectedItem.description}</p>
                         <h3 style={styles.cardTitle}>Tools Used</h3>
                         <div style={styles.tagContainer}>
                            {selectedItem.tools.map(tool => <span key={tool} style={styles.tag}>{tool}</span>)}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

const MessagesView = ({ styles }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [conversations, setConversations] = useState(freelancer.messages);
    const [activeConversation, setActiveConversation] = useState(freelancer.messages[0]);
    
    useEffect(() => {
        const filtered = freelancer.messages.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setConversations(filtered);
    }, [searchTerm]);

    const handleSelectConversation = (c) => {
        setActiveConversation(null);
        setTimeout(() => setActiveConversation(c), 50); // Small delay to allow re-render animation
    };

    return(
        <div style={{...styles.card('0.2s', 'span 3'), display:'flex', height: 'calc(100vh - 8rem)', padding: 0}}>
            <div style={styles.contactList}>
                <div style={styles.messageListHeader}>
                    <h2 style={styles.cardTitle}>Messages</h2>
                    <div style={styles.searchBox}>
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            style={styles.messageSearchInput} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div style={styles.contactItemsWrapper}>
                    {conversations.map((c, i) => (
                        <div key={c.name} className="contact-item" style={{...styles.contactItem(c.name === activeConversation?.name), animationDelay: `${0.2 + i*0.05}s`}} onClick={() => handleSelectConversation(c)}>
                            <div style={{position: 'relative'}}>
                                <img src={c.avatar} alt={c.name} style={styles.messageAvatar} />
                                {c.online && <span style={styles.onlineIndicator}></span>}
                            </div>
                            <div style={{flex: 1}}>
                                <p style={styles.messageName}>{c.name}</p>
                                <p style={styles.messageLast}>{c.lastMessage}</p>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <p style={styles.messageTimestamp}>{c.timestamp}</p>
                                {c.unread > 0 && <span style={styles.unreadBadge}>{c.unread}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={styles.chatWindow}>
                 {activeConversation ? (
                    <>
                        <div style={styles.chatHeader} key={activeConversation.name}>
                            <div>
                                <h2 style={styles.cardTitle}>{activeConversation.name}</h2>
                                <p style={styles.chatHeaderSubtitle}>Project: {activeConversation.project}</p>
                            </div>
                        </div>
                        <div style={styles.messageArea}>
                            {activeConversation.conversation.map((msg, i) => (
                                <div key={i} style={{...styles.messageBubble(msg.sender === 'me'), animationDelay: `${0.1 + i*0.15}s`}} className="message-bubble">{msg.text}</div>
                            ))}
                        </div>
                        <div style={styles.messageInputContainer}>
                            <input type="text" placeholder="Type a message..." style={styles.messageInput}/>
                            <button style={styles.sendButton}><SendIcon/></button>
                        </div>
                    </>
                 ) : (
                    <div style={styles.chatPlaceholder}>
                        <MessageIcon />
                        <h3>Select a conversation</h3>
                        <p>Search for people and start a new chat.</p>
                    </div>
                 )}
            </div>
        </div>
    )
};

const ToggleSwitch = ({ checked }) => {
    const [isChecked, setIsChecked] = useState(checked);
    return(
        <label style={{position: 'relative', display: 'inline-block', width: '44px', height: '24px'}}>
            <input type="checkbox" style={{opacity: 0, width: 0, height: 0}} checked={isChecked} onChange={() => setIsChecked(!isChecked)}/>
            <span style={{position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isChecked ? '#4CAF50' : '#ccc', transition: '.4s', borderRadius: '24px'}}>
                <span style={{position: 'absolute', content: '""', height: '20px', width: '20px', left: '2px', bottom: '2px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: isChecked ? 'translateX(20px)' : 'translateX(0px)'}}></span>
            </span>
        </label>
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
                        <p style={{color: '#33691E', marginBottom: '2rem', maxWidth: '80%'}}>Manage how you receive notifications about your account activity. This helps you stay on top of new messages, project updates, and job opportunities.</p>
                        <div className="form-row" style={{animationDelay: '0.3s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>Email Notifications</p><p style={styles.notificationDesc}>Receive updates in your inbox.</p></div><ToggleSwitch checked={true} /></div></div>
                        <div className="form-row" style={{animationDelay: '0.4s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>New Messages</p><p style={styles.notificationDesc}>Get notified when you receive a new message from a client.</p></div><ToggleSwitch checked={true} /></div></div>
                        <div className="form-row" style={{animationDelay: '0.5s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>Project Updates</p><p style={styles.notificationDesc}>Updates on milestones, feedback, and project completion.</p></div><ToggleSwitch checked={true} /></div></div>
                        <div className="form-row" style={{animationDelay: '0.6s'}}><div style={styles.notificationRow}><div><p style={styles.notificationLabel}>Job Invitations</p><p style={styles.notificationDesc}>Get notified when a client invites you to a project.</p></div><ToggleSwitch checked={false} /></div></div>
                    </div>
                );
            case 'Profile':
            default:
                return (
                    <div className="form-section">
                        <h3 style={styles.cardTitle}>Edit Profile</h3>
                        <div style={styles.formGrid}>
                            <div className="form-row" style={{animationDelay: '0.3s'}}><label style={styles.formLabel}>Full Name</label><input type="text" style={styles.input} defaultValue={freelancer.name} /></div>
                            <div className="form-row" style={{animationDelay: '0.4s'}}><label style={styles.formLabel}>Email Address</label><input type="email" style={styles.input} defaultValue={freelancer.email} /></div>
                            <div className="form-row" style={{animationDelay: '0.5s'}}><label style={styles.formLabel}>Professional Title</label><input type="text" style={styles.input} defaultValue={freelancer.title} /></div>
                            <div className="form-row" style={{animationDelay: '0.6s'}}><label style={styles.formLabel}>Location</label><input type="text" style={styles.input} defaultValue={freelancer.location} /></div>
                            <div className="form-row" style={{animationDelay: '0.7s'}}><label style={styles.formLabel}>Hourly Rate ($)</label><input type="number" style={styles.input} defaultValue={freelancer.hourlyRate} /></div>
                            <div className="form-row" style={{gridColumn: 'span 2', animationDelay: '0.8s'}}><label style={styles.formLabel}>About Me</label><textarea style={styles.textarea} rows="5" defaultValue={freelancer.bio}></textarea></div>
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

const ApplicationModal = ({ job, onClose, styles }) => (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <button onClick={onClose} style={styles.modalCloseButton}><XIcon /></button>
            <h2 style={styles.modalTitle}>{job.title}</h2>
            <p style={styles.jobClient}>{job.client} - {job.location}</p>
            <p style={styles.jobBudget}>{job.budget} <span style={styles.jobType}>({job.type})</span></p>
            <div style={{...styles.tagContainer, margin: '1.5rem 0'}}>
                {job.skills.map(skill => <span key={skill} style={styles.tag}>{skill}</span>)}
            </div>
            <h3 style={styles.cardTitle}>Job Description</h3>
            <p style={{color: '#33691E', marginBottom: '1.5rem'}}>{job.description}</p>
            <h3 style={styles.cardTitle}>Your Proposal</h3>
            <textarea style={styles.textarea} rows="5" placeholder="Write a compelling cover letter..."></textarea>
            <button style={{...styles.primaryButton, width: '100%', marginTop: '1rem'}}>Submit Application</button>
        </div>
    </div>
);

const FindJobsView = ({ styles }) => {
    const [selectedJob, setSelectedJob] = useState(null);

    return (
    <div>
        <header style={styles.header}><h1 style={styles.welcomeTitle}>Find Your Next Project</h1></header>
        <div style={{...styles.card('0.2s', 'span 3'), ...styles.findJobsGrid}}>
            {freelancer.jobListings.map((job, i) => (
                <div key={i} className="job-card" style={{animationDelay: `${0.3 + i*0.1}s`}}>
                    <div style={styles.jobCardHeader}>
                        <h3 style={styles.jobTitle}>{job.title}</h3>
                        <BookmarkIcon />
                    </div>
                    <p style={styles.jobClient}>{job.client} - {job.location}</p>
                    <p style={styles.jobBudget}>{job.budget} <span style={styles.jobType}>({job.type})</span></p>
                    <div style={styles.tagContainer}>
                        {job.skills.map(skill => <span key={skill} style={styles.tag}>{skill}</span>)}
                    </div>
                    <div style={styles.jobCardFooter}>
                        <p style={styles.jobPosted}>Posted {job.posted}</p>
                        <button style={styles.primaryButton} onClick={() => setSelectedJob(job)}>Apply Now</button>
                    </div>
                </div>
            ))}
        </div>
        {selectedJob && <ApplicationModal job={selectedJob} onClose={() => setSelectedJob(null)} styles={styles} />}
    </div>
    );
};


export default function FreelancerDashboard() {
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
        projectClient: { fontSize: '0.9rem', color: '#558B2F' },
        projectProgress: { width: '100%', backgroundColor: '#DCEDC8', borderRadius: '8px', height: '8px' },
        progressBar: (progress) => ({ width: `${progress}%`, backgroundColor: '#4CAF50', height: '8px', borderRadius: '8px' }),
        
        messageList: {},
        messageItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 0' },
        
        tabs: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #DCEDC8' },
        tabButton: (isActive) => ({ padding: '0.8rem 1.5rem', border: 'none', backgroundColor: 'transparent', color: isActive ? '#1B5E20' : '#558B2F', cursor: 'pointer', borderBottom: isActive ? '3px solid #4CAF50' : '3px solid transparent', fontWeight: isActive ? '600' : '500' }),
        
        projectsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
        projectCardContent: { padding: '1rem' },
        projectCardImage: { width: '100%', height: '150px', objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' },
        statusBadge: (status) => ({
            backgroundColor: status === 'Active' ? '#FFF9C4' : status === 'Completed' ? '#C8E6C9' : '#FFCDD2',
            color: status === 'Active' ? '#F57F17' : status === 'Completed' ? '#1B5E20' : '#B71C1C',
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '600',
            float: 'right'
        }),
        projectCardTitle: { fontSize: '1.2rem', fontWeight: '700', margin: '1rem 0 0.25rem' },
        projectCardClient: { color: '#558B2F', marginBottom: '1rem' },
        projectCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' },
        projectCardBudget: { fontWeight: '700', fontSize: '1.1rem' },


        fullPortfolioGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' },
        fullPortfolioItem: { position: 'relative', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '250px', cursor: 'pointer' },
        portfolioCardTitle: { fontWeight: '600', fontSize: '1.1rem' },
        portfolioCardCategory: { fontSize: '0.9rem', opacity: 0.8 },
        
        contactList: { width: '350px', borderRight: '1px solid #E8F5E9', display: 'flex', flexDirection: 'column' },
        messageListHeader: { padding: '1.5rem 1.5rem 1rem' },
        searchBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#E8F5E9', padding: '0.5rem 1rem', borderRadius: '8px' },
        messageSearchInput: { flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent' },
        contactItemsWrapper: { flex: 1, overflowY: 'auto', padding: '0.5rem' },
        contactItem: (isActive) => ({ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '8px', cursor: 'pointer', backgroundColor: isActive ? '#DCEDC8' : 'transparent', transition: 'background-color 0.2s ease' }),
        messageAvatar: { width: '48px', height: '48px', borderRadius: '50%' },
        messageName: { fontWeight: '600' },
        messageLast: { fontSize: '0.9rem', color: '#558B2F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' },
        onlineIndicator: { position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', backgroundColor: '#8BC34A', borderRadius: '50%', border: '2px solid #FFFFFF' },
        unreadBadge: { backgroundColor: '#4CAF50', color: 'white', borderRadius: '50%', fontSize: '0.7rem', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
        messageTimestamp: { fontSize: '0.8rem', color: '#558B2F', marginBottom: '0.25rem' },

        chatWindow: { flex: 1, display: 'flex', flexDirection: 'column' },
        chatPlaceholder: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' },
        chatHeader: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid #E8F5E9', animation: 'fade-in 0.3s' },
        chatHeaderSubtitle: { fontSize: '0.9rem', color: '#558B2F' },
        messageArea: { flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' },
        messageBubble: (isSender) => ({ alignSelf: isSender ? 'flex-end' : 'flex-start', backgroundColor: isSender ? '#4CAF50' : '#E8F5E9', color: isSender ? '#FFFFFF' : '#1B5E20', padding: '0.75rem 1rem', borderRadius: '16px', maxWidth: '70%' }),
        messageInputContainer: { display: 'flex', padding: '1rem', borderTop: '1px solid #E8F5E9' },
        messageInput: { flex: 1, border: '1px solid #C5E1A5', borderRadius: '8px', padding: '0.75rem', outline: 'none' },
        sendButton: { border: 'none', backgroundColor: '#4CAF50', color: '#FFFFFF', borderRadius: '8px', padding: '0.75rem', marginLeft: '0.5rem', cursor: 'pointer' },
        
        formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' },
        formLabel: { fontWeight: '600', marginBottom: '0.5rem', display: 'block' },
        input: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #C5E1A5', backgroundColor: '#F9FBE7', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
        textarea: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #C5E1A5', backgroundColor: '#F9FBE7', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },
        primaryButton: { padding: '0.9rem 1.5rem', backgroundColor: '#4CAF50', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.3s ease' },
    
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
        
        // Application & Project Detail Modals
        modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(27, 94, 32, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, animation: 'fade-in 0.3s' },
        projectDetailPanel: { position: 'fixed', top: 0, right: 0, height: '100%', width: '450px', backgroundColor: '#FFFFFF', boxShadow: '-5px 0 20px rgba(0,0,0,0.1)', animation: 'slide-in-right 0.4s ease forwards', padding: '2rem', boxSizing: 'border-box', overflowY: 'auto' },
        modalContent: { backgroundColor: '#FFFFFF', borderRadius: '16px', width: '90%', maxWidth: '600px', padding: '2rem', animation: 'fade-slide-up 0.4s ease forwards', position: 'relative' },
        modalCloseButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#558B2F' },
        modalTitle: { fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' },
        
        milestoneItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 0', borderBottom: '1px solid #E8F5E9' },
        milestoneStatus: (status) => ({ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: '500', color: status === 'Completed' ? '#4CAF50' : '#F57F17' }),

        // Settings View
        notificationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #E8F5E9' },
        notificationLabel: { fontWeight: '600' },
        notificationDesc: { fontSize: '0.9rem', color: '#558B2F' },
        passwordInputContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
        eyeButton: { position: 'absolute', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#558B2F' },

        // Portfolio View
        portfolioOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem', color: 'white', opacity: 0, transition: 'opacity 0.3s ease' },
        portfolioImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' },

    };

    const keyframes = `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .nav-item-hover:hover { background-color: #33691E; }
        .portfolio-item:hover .portfolio-image { transform: scale(1.05); }
        .portfolio-item:hover .portfolio-overlay { opacity: 1; }
        .project-card { cursor: pointer; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); opacity: 0; animation: fade-slide-up 0.5s ease forwards; transition: transform 0.2s ease, box-shadow 0.2s ease; overflow: hidden; }
        .project-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .message-bubble { animation: fade-slide-up 0.4s ease forwards; opacity: 0; }
        .job-card { background-color: #FFFFFF; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); opacity: 0; animation: fade-slide-up 0.5s ease forwards; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .job-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .form-section { animation: fade-in 0.5s; }
        .form-row { opacity: 0; animation: fade-slide-up 0.5s ease forwards; }
        .contact-item { animation: fade-slide-up 0.4s ease forwards; opacity: 0; }
        .contact-item:hover { background-color: #F1F8E9; }

    `;

    const renderView = () => {
        switch(activeView) {
            case 'projects': return <ProjectsView styles={styles} />;
            case 'portfolio': return <PortfolioView styles={styles} />;
            case 'messages': return <MessagesView styles={styles} />;
            case 'settings': return <SettingsView styles={styles} />;
            case 'find-jobs': return <FindJobsView styles={styles} />;
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
                <div style={styles.navItem(activeView === 'projects')} className="nav-item-hover" onClick={() => setActiveView('projects')}><ProjectsIcon /><span>My Projects</span></div>
                <div style={styles.navItem(activeView === 'portfolio')} className="nav-item-hover" onClick={() => setActiveView('portfolio')}><PortfolioIcon /><span>Portfolio</span></div>
                <div style={styles.navItem(activeView === 'messages')} className="nav-item-hover" onClick={() => setActiveView('messages')}><MessageIcon /><span>Messages</span></div>
                <div style={styles.navItem(activeView === 'find-jobs')} className="nav-item-hover" onClick={() => setActiveView('find-jobs')}><BriefcaseIcon /><span>Find Jobs</span></div>

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

