import React, { useState, useEffect } from 'react';
import {Link } from 'react-router-dom';

// This function will be called by Google's library when a user signs in
const handleCredentialResponse = (response) => {
    // `response.credential` is the ID token you need to send to your backend
    console.log("ID Token received: " + response.credential);

    // You would typically send this token to your backend server for verification
    // and to get the user's profile information securely.
    // The state of your application can be updated here, for example, to redirect the user.
};

// --- SVG Icon Components ---
const FlexwrkLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="loginGradBlue" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#1e3a8a" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
            <linearGradient id="loginGradGreen" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#22c55e" /></linearGradient>
            <linearGradient id="loginGradCyan" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient>
        </defs>
        <path d="M15 10 C 25 50, 35 50, 45 10 L 40 70 L 20 70 Z" fill="url(#loginGradBlue)" />
        <path d="M75 10 C 65 50, 55 50, 45 10 L 50 70 L 70 70 Z" fill="url(#loginGradGreen)" opacity="0.9" />
        <path d="M40 40 L 60 10 L 80 40 L 60 70 Z" fill="url(#loginGradCyan)" opacity="0.8" />
    </svg>
);

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.4H18.19C17.93 15.75 17.22 16.91 16.14 17.63V20.12H19.94C21.66 18.53 22.56 15.63 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12 23C15.24 23 17.95 21.92 19.94 20.12L16.14 17.63C15.08 18.35 13.67 18.75 12 18.75C9.13 18.75 6.69 16.88 5.84 14.39H1.94V16.94C3.72 20.47 7.56 23 12 23Z" fill="#34A853"/>
        <path d="M5.84 14.39C5.64 13.79 5.54 13.14 5.54 12.47C5.54 11.8 5.64 11.15 5.84 10.55V8H1.94C1.18 9.53 0.73 11.15 0.73 12.47C0.73 13.79 1.18 15.41 1.94 16.94L5.84 14.39Z" fill="#FBBC05"/>
        <path d="M12 5.25C13.73 5.25 15.17 5.83 16.22 6.82L20.02 3C17.95 1.13 15.24 0 12 0C7.56 0 3.72 2.53 1.94 6L5.84 8.55C6.69 6.06 9.13 4.25 12 4.25V5.25Z" fill="#EA4335"/>
    </svg>
);

const WatermelonIcon = () => <svg width="40" height="40" viewBox="0 0 24 24"><path fill="#F472B6" d="M21.9,13.3c-1-3.6-4.2-6.3-7.9-6.3c-3.7,0-6.9,2.7-7.9,6.3c-0.1,0.2,0,0.4,0.1,0.6c0.2,0.1,0.4,0.2,0.6,0.1l0,0C7,13.7,7.2,13.5,7.2,13.3c0.9-3.2,3.8-5.5,7-5.5s6.1,2.3,7,5.5c0,0.2,0.2,0.4,0.5,0.4l0,0c0.2,0,0.4-0.1,0.5-0.3C22,13.7,22,13.5,21.9,13.3z M17,17c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S17.6,17,17,17z M12,17c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S12.6,17,12,17z M7,17c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S7.6,17,7,17z"/></svg>;
const ToastIcon = () => <svg width="40" height="40" viewBox="0 0 24 24"><path fill="#8B5CF6" d="M21,6H3C2.4,6,2,6.4,2,7v10c0,0.6,0.4,1,1,1h18c0.6,0,1-0.4,1-1V7C22,6.4,21.6,6,21,6z M19,16H5V8h14V16z"/></svg>;
const ChickenLegIcon = () => <svg width="40" height="40" viewBox="0 0 24 24"><path fill="#60A5FA" d="M19.9,12.6c-0.7-0.7-1.6-1.1-2.6-1.1c-1,0-1.9,0.4-2.6,1.1c-1.4,1.4-1.4,3.8,0,5.2l-5.2,5.2c-0.4,0.4-1,0.4-1.4,0s-0.4-1,0-1.4l5.2-5.2c-0.6-0.8-0.9-1.8-0.9-2.8s0.3-2,0.9-2.8c1.4-1.4,3.8-1.4,5.2,0c0.7,0.7,1.1,1.6,1.1,2.6S20.6,11.9,19.9,12.6z M16,6c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S17.1,6,16,6z"/></svg>;

const ListItem = ({ icon, delay }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0, animation: `bounce-in 0.6s ease ${delay} forwards`}}>
        {icon}
        <div style={{ width: '120px', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px' }}></div>
    </div>
);


export default function LoginPage() {
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Check if the google.accounts.id object exists before initializing
        if (window.google) {
            // Initialize the Google Identity Services client
            window.google.accounts.id.initialize({
                client_id: "623498140904-vmi90bvl88sv1rmbonjgrhuuvbmmjn4o.apps.googleusercontent.com",
                callback: handleCredentialResponse,
            });

            // Render the Google Sign-in button into the specified container div
            window.google.accounts.id.renderButton(
                document.getElementById("google-button-container"),
                { theme:"filled_blue", size: "large", text: "continue_with", shape: "rectangular" ,width:420}
            );
        }
    }, []); // Empty dependency array means this effect runs once on mount

    const styles = {
        container: { fontFamily: '"Poppins", sans-serif', backgroundColor: '#FFFFFF', color: '#111827', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
        backgroundBlob: (config) => ({
            position: 'absolute',
            width: config.size,
            height: config.size,
            backgroundColor: config.color,
            borderRadius: '50%',
            filter: 'blur(100px)',
            opacity: 0.8,
            top: config.top,
            left: config.left,
            animation: `blob-float ${config.duration}s ease-in-out infinite alternate`,
            zIndex: 0,
        }),
        header: { display: 'flex', justifyContent: 'center', padding: '1.5rem 7%', zIndex: 1 },
        nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px' },
        logoContainer: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 'bold' },
        navLinks: { display: 'flex', alignItems: 'center', gap: '3rem' },
        navLink: (delay) => ({ 
            color: '#4B5563', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s ease, transform 0.5s ease, opacity 0.5s ease',
            opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(-20px)', transitionDelay: `${delay}s`,
        }),
        
        mainContent: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 7%', zIndex: 1 },
        contentWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1100px', gap: '4rem' },
        
        leftPanel: { flex: 1.2, opacity: 0, animation: 'slide-in-left 0.8s ease-out 0.2s forwards' },
        welcomeTitle: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' },
        welcomeSubtitle: { fontSize: '1.1rem', color: '#6B7280', marginBottom: '3rem' },
        
        graphicContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
        illustration: { width: '220px', height: 'auto', zIndex: 1, transform: 'scale(1.1)',  marginRight: '-2rem'},
        graphicList: { display: 'flex', flexDirection: 'column', gap: '1.5rem', marginLeft: '-2rem' },
        
        rightPanel: { flex: 1, maxWidth: '400px', opacity: 0, animation: 'slide-in-right 0.8s ease-out 0.4s forwards' },
        form: { width: '100%' },
        input: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', borderRadius: '8px', fontSize: '1rem', marginBottom: '1rem', boxSizing: 'border-box', transition: 'box-shadow 0.2s, border-color 0.2s' },
        button: { width: '100%', padding: '0.9rem 1rem', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' },
        primaryButton: { backgroundColor: '#8B5CF6', color: 'white' },
        googleButton: { backgroundColor: '#8B5CF6', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' },
        separator: { display: 'flex', alignItems: 'center', textAlign: 'center', color: '#8B5CF6', margin: '1.5rem 0' },
        separatorLine: { flex: 1, borderBottom: '1px solid #8B5CF6' },
        separatorText: { padding: '0 1rem' },
        signupLinkContainer: { textAlign: 'center', marginTop: '1.5rem', color: '#6B7280' },
        signupLink: { color: '#8B5CF6', fontWeight: '500', textDecoration: 'none' },
    };

    const keyframes = `
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes bounce-in { 
            0% { opacity: 0; transform: scale(0.3) translateY(20px); }
            50% { transform: scale(1.05) translateY(0); }
            70% { transform: scale(0.9) translateY(0); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
            /* Custom Google Button Override */
    #google-button-container div[role="button"] {
      background-color: #8d60f6ff !important;
      color: #ffffff !important;
      border-radius: 8px !important;
      border: none !important;
      font-weight: 600 !important;
    }
        @keyframes blob-float { from { transform: translateY(0px) scale(1); } to { transform: translateY(-20px) scale(1.1); } }
        .nav-link:hover { color: #8B5CF6; }
        .form-button:hover { transform: translateY(-2px); box-shadow: 0 7px 20px rgba(0,0,0,0.1); }
        .input-focus:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2); outline: none; }
        .signup-link:hover { text-decoration: underline; }
    `;

    return (
        <>
            <style>{keyframes}</style>
            <div style={styles.container}>
                <div style={styles.backgroundBlob({ size: '400px', color: 'rgba(139, 92, 246, 0.15)', top: '-10%', left: '-10%', duration: 10 })}></div>
                <div style={styles.backgroundBlob({ size: '300px', color: 'rgba(96, 165, 250, 0.15)', top: '50%', left: '40%', duration: 12 })}></div>

                <header style={styles.header}>
                    <nav style={styles.nav}>
                        <div style={styles.logoContainer}><FlexwrkLogo /><span>FLEXwrk</span></div>
                        <div style={styles.navLinks}>
                            <a href="#" style={styles.navLink(0.2)} className="nav-link">Home</a>
                            <a href="#" style={styles.navLink(0.3)} className="nav-link">About</a>
                            <a href="#" style={styles.navLink(0.4)} className="nav-link">Contact Us</a>
                        </div>
                    </nav>
                </header>

                <main style={styles.mainContent}>
                    <div style={styles.contentWrapper}>
                        <div style={styles.leftPanel}>
                            <h1 style={styles.welcomeTitle}>Welcome back.</h1>
                            <p style={styles.welcomeSubtitle}>Let's sign you in.</p>
                            <div style={styles.graphicContainer}>
                                <div style={styles.graphicList}>
                                    <ListItem icon={<WatermelonIcon />} delay="0.8s" />
                                    <ListItem icon={<ToastIcon />} delay="1.0s" />
                                    <ListItem icon={<ChickenLegIcon />} delay="1.2s" />
                                </div>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtZO0BYAeuMftr5lp1XR73cbb-6iP6u5WSpa9myKhzPaDFshDOr4m3Po20XKDOBpMO0vc&usqp=CAU" alt="Illustration of a person pointing" style={styles.illustration} />
                            </div>
                        </div>
                        <div style={styles.rightPanel}>
                            <form style={styles.form}>
                                <input type="email" placeholder="Email" style={styles.input} className="input-focus" />
                                <input type="password" placeholder="Password" style={styles.input} className="input-focus" />
                                <button type="submit" style={{...styles.button, ...styles.primaryButton}} className="form-button">Continue</button>
                                <div style={styles.separator}>
                                    <div style={styles.separatorLine}></div>
                                    <span style={styles.separatorText}>or</span>
                                    <div style={styles.separatorLine}></div>
                                </div>
                                <div id="google-button-container" ></div>
                                <p style={styles.signupLinkContainer}>
    Don't have an account? <Link to="/Signup" style={styles.signupLink} className="signup-link">Sign Up</Link>
</p>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}


