import React, { useState, useEffect } from 'react';

// --- SVG Icon Components ---
const FlexwrkLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gradBlue" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E0E0E0" /></linearGradient>
            <linearGradient id="gradGreen" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E0E0E0" /></linearGradient>
             <linearGradient id="gradCyan" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E0E0E0" /></linearGradient>
        </defs>
        <path d="M15 10 C 25 50, 35 50, 45 10 L 40 70 L 20 70 Z" fill="url(#gradBlue)" />
        <path d="M75 10 C 65 50, 55 50, 45 10 L 50 70 L 70 70 Z" fill="url(#gradGreen)" opacity="0.9" />
        <path d="M40 40 L 60 10 L 80 40 L 60 70 Z" fill="url(#gradCyan)" opacity="0.8" />
    </svg>
);
const DashboardIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const ContactIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const TeamIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ProfileIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const SettingsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const LogoutIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const BellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const DownloadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;

// --- Mock Data ---
const activeProjects = [
    { name: 'Steven Terry', project: 'Landing page', price: 800, delivered: '1 days 2 hours', progress: 90, img: 'https://randomuser.me/api/portraits/men/75.jpg' },
    { name: 'Audrey Jones', project: 'Development', price: 300, delivered: '4 days 8 hours', progress: 50, img: 'https://randomuser.me/api/portraits/women/75.jpg' },
    { name: 'Brian Fisher', project: 'Translator', price: 180, delivered: '14 days 2 hours', progress: 95, img: 'https://randomuser.me/api/portraits/men/76.jpg' },
    { name: 'Molly Mills', project: 'Data Analyst', price: 920, delivered: '8 days 20 hours', progress: 20, img: 'https://randomuser.me/api/portraits/women/76.jpg' },
];
const applicationStatus = [
    { title: 'Chinese Translator', company: 'Tech Troopers (Jiangxi East, Singapore)', status: 'Applied', date: 'Jan 22', tags: ['Remote', 'Contract'] },
    { title: 'Frontend Developer', company: 'PT Invision Digital Indonesia', status: 'Not selected', date: 'Jan 01', tags: ['1-3 years exp', 'Freelance'] },
    { title: 'Website Designer', company: 'Vergano Studio (Sydney, Australia)', status: 'Interview', date: 'Dec 20', tags: ['3 months contract'] },
];

export default function FreelancerDashboard() {
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
      setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const styles = {
        dashboardContainer: { fontFamily: '"Poppins", sans-serif', backgroundColor: '#F1F8E9', display: 'flex', minHeight: '100vh', color: '#1B5E20' },
        sidebar: { width: '250px', backgroundColor: '#1B5E20', color: '#E8F5E9', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.5s ease', transform: isLoaded ? 'translateX(0)' : 'translateX(-100%)' },
        sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem', color: '#FFFFFF' },
        navSection: { marginBottom: '2rem' },
        navTitle: { fontSize: '0.8rem', textTransform: 'uppercase', color: '#A5D6A7', marginBottom: '1rem', letterSpacing: '1px' },
        navItem: (isActive) => ({ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', backgroundColor: isActive ? '#33691E' : 'transparent', color: isActive ? '#FFFFFF' : '#E8F5E9', transition: 'background-color 0.2s, color 0.2s' }),
        mainContent: { flex: 1, padding: '2rem 3rem', opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease 0.3s' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
        headerLeft: {},
        welcomeTitle: { fontSize: '2rem', fontWeight: 'bold' },
        headerRight: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
        searchBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
        searchInput: { border: 'none', outline: 'none', backgroundColor: 'transparent' },
        iconButton: { color: '#33691E', cursor: 'pointer' },
        
        mainGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' },
        leftColumn: { display: 'flex', flexDirection: 'column', gap: '2rem' },
        rightColumn: { display: 'flex', flexDirection: 'column', gap: '2rem' },
        
        card: (delay) => ({ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', opacity: 0, animation: `fade-slide-up 0.6s ease ${delay} forwards` }),
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
        cardTitle: { fontSize: '1.2rem', fontWeight: '600' },

        profileCard: { backgroundColor: '#DCEDC8', textAlign: 'center', padding: '2rem' },
        profileImage: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem auto', border: '4px solid #FFFFFF' },
        profileName: { fontSize: '1.4rem', fontWeight: 'bold' },
        profileLocation: { color: '#33691E', marginBottom: '1.5rem' },
        editProfileButton: { backgroundColor: '#33691E', color: '#FFFFFF', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', width: '100%' },

        applicationStatusList: {},
        applicationItem: { borderBottom: '1px solid #E8F5E9', padding: '1rem 0' },
        applicationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        applicationTitle: { fontWeight: '600' },
        applicationStatus: (status) => ({ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', color: status === 'Applied' ? '#1B5E20' : status === 'Interview' ? '#0D47A1' : '#D32F2F', backgroundColor: status === 'Applied' ? '#C8E6C9' : status === 'Interview' ? '#BBDEFB' : '#FFCDD2' }),
        
        activeProjectsTable: {},
        tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', color: '#558B2F', padding: '0 1rem', marginBottom: '0.5rem', fontSize: '0.9rem' },
        tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', alignItems: 'center', backgroundColor: '#F1F8E9', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '0.5rem' },
        clientCell: { display: 'flex', alignItems: 'center', gap: '1rem' },
        clientImage: { width: '36px', height: '36px', borderRadius: '50%' },
        progressCell: { width: '100%', backgroundColor: '#DCEDC8', borderRadius: '8px', height: '8px' },
        progressBar: (progress) => ({ width: `${progress}%`, backgroundColor: '#4CAF50', height: '8px', borderRadius: '8px' }),

    };

    const keyframes = `
        @keyframes fade-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .nav-item-hover:hover { background-color: #33691E; }
    `;

    return (
        <>
        <style>{keyframes}</style>
        <div style={styles.dashboardContainer}>
            <aside style={styles.sidebar}>
                <div style={styles.sidebarHeader}><FlexwrkLogo /><span>FLEXwrk</span></div>
                <div style={styles.navSection}>
                    <p style={styles.navTitle}>Main Menu</p>
                    <div style={styles.navItem(true)}><DashboardIcon /><span>Dashboard</span></div>
                    <div style={styles.navItem(false)} className="nav-item-hover"><ContactIcon /><span>Contact Info</span></div>
                    <div style={styles.navItem(false)} className="nav-item-hover"><TeamIcon /><span>My Team</span></div>
                </div>
                <div style={styles.navSection}>
                    <p style={styles.navTitle}>Preference</p>
                    <div style={styles.navItem(false)} className="nav-item-hover"><ProfileIcon /><span>Profile</span></div>
                    <div style={styles.navItem(false)} className="nav-item-hover"><SettingsIcon /><span>Settings</span></div>
                </div>
                <div style={{...styles.navSection, marginTop: 'auto'}}>
                    <div style={styles.navItem(false)} className="nav-item-hover"><LogoutIcon /><span>Log Out</span></div>
                </div>
            </aside>
            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <div style={styles.headerLeft}>
                        <h1 style={styles.welcomeTitle}>Welcome back, John! 👋</h1>
                    </div>
                    <div style={styles.headerRight}>
                        <button style={{display:'flex', alignItems:'center', gap: '8px', border:'1px solid #C5E1A5', padding:'0.5rem 1rem', borderRadius:'8px', backgroundColor:'transparent', cursor:'pointer'}}><DownloadIcon/> Download report</button>
                        <div style={styles.searchBox}><SearchIcon /><input type="text" placeholder="Search..." style={styles.searchInput}/></div>
                        <div style={styles.iconButton}><BellIcon /></div>
                    </div>
                </header>

                <div style={styles.mainGrid}>
                    <div style={styles.leftColumn}>
                        {/* A placeholder for Analytics and Earning reports */}
                        <div style={styles.card('0.3s')}>
                            <h3 style={styles.cardTitle}>Analytics & Reports</h3>
                            <p>Analytics and earning reports will be displayed here.</p>
                        </div>

                        <div style={{...styles.card('0.4s'), ...styles.activeProjectsTable}}>
                            <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Active projects ({activeProjects.length})</h3> <button style={{backgroundColor:'#33691E', color:'#FFFFFF', border:'none', padding:'0.5rem 1rem', borderRadius:'8px', cursor:'pointer'}}>+ Add new project</button></div>
                            <div style={styles.tableHeader}>
                                <span>Client Name</span><span>Project</span><span>Price</span><span>Delivered in</span><span>Progress</span>
                            </div>
                            {activeProjects.map(p => (
                                <div style={styles.tableRow} key={p.name}>
                                    <div style={styles.clientCell}><img src={p.img} alt={p.name} style={styles.clientImage}/> <div>{p.name}<br/><span style={{fontSize:'0.8rem', color:'#558B2F'}}>View order</span></div></div>
                                    <span>{p.project}</span>
                                    <span>${p.price}</span>
                                    <span>{p.delivered}</span>
                                    <div><div style={styles.progressCell}><div style={styles.progressBar(p.progress)}></div></div></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.rightColumn}>
                        <div style={{...styles.card('0.3s'), ...styles.profileCard}}>
                            <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="John Doe" style={styles.profileImage}/>
                            <h3 style={styles.profileName}>John doe</h3>
                            <p style={styles.profileLocation}>CA, California</p>
                            <button style={styles.editProfileButton}>Edit profile</button>
                        </div>
                        <div style={{...styles.card('0.4s'), ...styles.applicationStatusList}}>
                            <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Application status</h3><span>...</span></div>
                            {applicationStatus.map(app => (
                                <div style={styles.applicationItem} key={app.title}>
                                    <div style={styles.applicationHeader}>
                                        <h4 style={styles.applicationTitle}>{app.title}</h4>
                                        <span style={{fontSize:'0.8rem', color:'#558B2F'}}>Applied on {app.date}</span>
                                    </div>
                                    <p style={{fontSize:'0.9rem', color:'#33691E', margin:'0.3rem 0'}}>{app.company}</p>
                                    <div>{app.tags.map(t => <span key={t} style={{fontSize:'0.8rem', backgroundColor:'#E8F5E9', padding:'0.2rem 0.5rem', borderRadius:'6px', marginRight:'0.5rem'}}>{t}</span>)}</div>
                                    <div style={{textAlign:'right', marginTop:'-1rem'}}><span style={styles.applicationStatus(app.status)}>{app.status}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </>
    );
}
