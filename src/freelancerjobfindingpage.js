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
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const LocationIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
const BriefcaseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const BookmarkIcon = ({ filled }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#4CAF50" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>;
const ProfileIcon = () => (
    <div className="profile-icon" style={{ cursor: 'pointer', transition: 'transform 0.2s ease, opacity 0.2s ease' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#DCEDC8"/>
            <path d="M20 25C16.13 25 13 27.12 13 29V30H27V29C27 27.12 23.87 25 20 25ZM20 23C22.21 23 24 21.21 24 19C24 16.79 22.21 15 20 15C17.79 15 16 16.79 16 19C16 21.21 17.79 23 20 23Z" fill="#33691E"/>
        </svg>
    </div>
);


// --- Mock Job Data ---
const initialJobListings = [
    { title: 'Senior UX Designer', company: 'Innovatech Solutions', location: 'Remote', type: 'Full-time', tags: ['UX', 'UI', 'Figma'], date: '2d ago', logo: 'https://placehold.co/100x100/A5D6A7/1B5E20?text=IS', bookmarked: false },
    { title: 'Lead Frontend Developer', company: 'QuantumLeap Tech', location: 'New York, NY', type: 'Contract', tags: ['React', 'TypeScript', 'GraphQL'], date: '4d ago', logo: 'https://placehold.co/100x100/C5E1A5/1B5E20?text=QL', bookmarked: true },
    { title: 'Data Scientist', company: 'DataDriven Inc.', location: 'San Francisco, CA', type: 'Full-time', tags: ['Python', 'Machine Learning', 'SQL'], date: '1w ago', logo: 'https://placehold.co/100x100/DCEDC8/1B5E20?text=DD', bookmarked: false },
    { title: 'Product Manager', company: 'Synergy Labs', location: 'Austin, TX', type: 'Full-time', tags: ['Agile', 'Roadmap', 'SaaS'], date: '1w ago', logo: 'https://placehold.co/100x100/A5D6A7/1B5E20?text=SL', bookmarked: false },
    { title: 'Social Media Manager', company: 'ConnectSphere', location: 'Remote', type: 'Freelance', tags: ['Marketing', 'Content', 'SEO'], date: '2w ago', logo: 'https://placehold.co/100x100/C5E1A5/1B5E20?text=CS', bookmarked: false },
    { title: 'Mobile App Developer', company: 'Apex Apps', location: 'Boston, MA', type: 'Contract', tags: ['React Native', 'iOS', 'Android'], date: '3w ago', logo: 'https://placehold.co/100x100/DCEDC8/1B5E20?text=AA', bookmarked: true },
];


export default function FindWorkPage() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [jobListings, setJobListings] = useState(initialJobListings);

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const handleBookmark = (index) => {
        const updatedJobs = [...jobListings];
        updatedJobs[index].bookmarked = !updatedJobs[index].bookmarked;
        setJobListings(updatedJobs);
    };

    const styles = {
        container: { fontFamily: '"Poppins", sans-serif', backgroundColor: '#F1F8E9', color: '#1B5E20', minHeight: '100vh' },
        header: { position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'center', padding: '1rem 7%', backgroundColor: 'rgba(241, 248, 233, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #DCEDC8' },
        nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1400px' },
        logoContainer: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' },
        navLinks: { display: 'flex', alignItems: 'center', gap: '2.5rem' },
        navLink: { color: '#1B5E20', textDecoration: 'none', fontWeight: '500' },
        navButtons: { display: 'flex', alignItems: 'center', gap: '1rem' },

        mainContent: { padding: '0 7% 3rem' },
        contentWrapper: { maxWidth: '1400px', margin: '0 auto' },
        
        heroSection: { 
            display: 'flex', alignItems: 'center', gap: '2rem',
            padding: '4rem 0', textAlign: 'left',
            opacity: 0, animation: 'fade-slide-up 0.8s ease 0.2s forwards',
        },
        heroText: { flex: 1.2 },
        heroTitle: { fontSize: '3rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '1rem' },
        heroSubtitle: { fontSize: '1.1rem', color: '#33691E', marginBottom: '2rem' },
        heroImageContainer: { flex: 1, display: 'flex', justifyContent: 'center' },
        heroImage: { width: '100%', maxWidth: '400px', borderRadius: '16px', animation: 'hero-float 8s ease-in-out infinite' },
        
        filterBar: { 
            display: 'grid', gridTemplateColumns: '3fr 2fr 1.5fr 1fr', gap: '1px', 
            backgroundColor: '#C5E1A5',
            borderRadius: '12px', overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            opacity: 0, animation: 'fade-slide-up 0.6s ease 0.4s forwards',
        },
        filterInputContainer: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.2rem', backgroundColor: '#FFFFFF' },
        filterInput: { flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '1rem' },
        searchButton: { backgroundColor: '#4CAF50', color: '#FFFFFF', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' },
        
        jobListingsContainer: { marginTop: '3rem' },
        listingsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', opacity: 0, animation: 'fade-slide-up 0.6s ease 0.6s forwards' },
        listingsTitle: { fontSize: '1.5rem', fontWeight: '600' },
        sortBy: { color: '#33691E' },
        
        jobCard: (delay) => ({
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem',
            border: '1px solid transparent',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
            opacity: 0, animation: `fade-slide-up 0.5s ease ${delay}s forwards`,
        }),
        companyLogo: { width: '60px', height: '60px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', fontWeight: 'bold', fontSize: '1.5rem' },
        jobInfo: { flex: 1 },
        jobTitle: { fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.25rem' },
        jobDetails: { display: 'flex', alignItems: 'center', gap: '1rem', color: '#33691E', fontSize: '0.9rem', marginBottom: '0.75rem' },
        jobTags: { display: 'flex', gap: '0.5rem' },
        tag: { backgroundColor: '#E8F5E9', color: '#33691E', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem' },
        jobActions: { textAlign: 'right' },
        postDate: { fontSize: '0.9rem', color: '#558B2F', marginBottom: '1rem' },
        applyButton: { backgroundColor: 'transparent', color: '#1B5E20', border: '1px solid #C5E1A5', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
    };

    const keyframes = `
        @keyframes fade-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hero-float { 
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
        .job-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
            border-color: #4CAF50;
        }
        .apply-button:hover {
            background-color: #4CAF50;
            color: #FFFFFF;
        }
        .bookmark-icon {
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .bookmark-icon:hover {
            transform: scale(1.2);
        }
    `;

    return (
        <>
            <style>{keyframes}</style>
            <div style={styles.container}>
                <header style={styles.header}>
                    <nav style={styles.nav}>
                        <div style={styles.logoContainer}><FlexwrkLogo /><span>FLEXwrk</span></div>
                        <div style={styles.navLinks}>
                            <a href="#" style={styles.navLink}>Home</a>
                            <a href="#" style={{...styles.navLink, fontWeight: 'bold', color: '#4CAF50'}}>Find Work</a>
                            <a href="#" style={styles.navLink}>About</a>
                        </div>
                        <div style={styles.navButtons}><ProfileIcon /></div>
                    </nav>
                </header>

                <main style={styles.mainContent}>
                    <div style={styles.contentWrapper}>
                        <div style={styles.heroSection}>
                            <div style={styles.heroText}>
                                <h1 style={styles.heroTitle}>Find Your Next Opportunity</h1>
                                <p style={styles.heroSubtitle}>Browse thousands of jobs and projects from top companies. Your dream gig is just a search away.</p>
                            </div>
                            <div style={styles.heroImageContainer}>
                                <img src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Team collaborating on a project" style={styles.heroImage} />
                            </div>
                        </div>

                        <div style={styles.filterBar}>
                            <div style={styles.filterInputContainer}>
                                <SearchIcon color="#558B2F"/>
                                <input type="text" placeholder="Job title or keyword" style={styles.filterInput} />
                            </div>
                             <div style={styles.filterInputContainer}>
                                <LocationIcon color="#558B2F"/>
                                <input type="text" placeholder="City or remote" style={styles.filterInput} />
                            </div>
                             <div style={styles.filterInputContainer}>
                                <BriefcaseIcon color="#558B2F"/>
                                <input type="text" placeholder="Job type" style={styles.filterInput} />
                            </div>
                            <button style={styles.searchButton}>Find Jobs</button>
                        </div>

                        <div style={styles.jobListingsContainer}>
                            <div style={styles.listingsHeader}>
                                <h2 style={styles.listingsTitle}>All Jobs ({jobListings.length})</h2>
                                <p style={styles.sortBy}>Sort by: <strong>Newest</strong></p>
                            </div>
                            
                            {jobListings.map((job, index) => (
                                <div key={index} style={styles.jobCard(0.7 + index * 0.1)} className="job-card">
                                    <div style={styles.companyLogo}>{job.logo.includes('placehold') ? job.company.substring(0,2).toUpperCase() : <img src={job.logo} alt={`${job.company} logo`} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}}/>}</div>
                                    <div style={styles.jobInfo}>
                                        <h3 style={styles.jobTitle}>{job.title}</h3>
                                        <div style={styles.jobDetails}>
                                            <span>{job.company}</span> &bull; <span>{job.location}</span> &bull; <span>{job.type}</span>
                                        </div>
                                        <div style={styles.jobTags}>
                                            {job.tags.map(tag => <span key={tag} style={styles.tag}>{tag}</span>)}
                                        </div>
                                    </div>
                                    <div style={styles.jobActions}>
                                        <p style={styles.postDate}>{job.date}</p>
                                        <button style={styles.applyButton} className="apply-button">Apply Now</button>
                                    </div>
                                    <div className="bookmark-icon" onClick={() => handleBookmark(index)}>
                                        <BookmarkIcon filled={job.bookmarked}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

