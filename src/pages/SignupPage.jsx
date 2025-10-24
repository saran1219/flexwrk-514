// src/pages/SignupPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from "../firebase.js";
import { doc, setDoc, serverTimestamp, getDoc } from "../firebase.js";
import { auth, db, googleProvider } from '../firebase.js'; // Ensure this path is correct
import './SignupPage.css';

// --- SVG Icon Components ---
const FlexwrkLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="authGradBlue" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#1e3a8a" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
            <linearGradient id="authGradGreen" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#22c55e" /></linearGradient>
            <linearGradient id="authGradCyan" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient>
        </defs>
        <path d="M15 10 C 25 50, 35 50, 45 10 L 40 70 L 20 70 Z" fill="url(#authGradBlue)" />
        <path d="M75 10 C 65 50, 55 50, 45 10 L 50 70 L 70 70 Z" fill="url(#authGradGreen)" opacity="0.9" />
        <path d="M40 40 L 60 10 L 80 40 L 60 70 Z" fill="url(#authGradCyan)" opacity="0.8" />
    </svg>
);
const EyeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const GoogleIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><g fillRule="evenodd" transform="translate(0.5 0.5)"><path d="M11.5,1.5 C5.5,1.5 0.5,6.5 0.5,12.5 C0.5,18.5 5.5,23.5 11.5,23.5 C17.5,23.5 22.5,18.5 22.5,12.5 C22.5,6.5 17.5,1.5 11.5,1.5 Z" strokeWidth="2.5" stroke="currentColor" fill="#FFFFFF"/><path d="M22.5,12.5 C22.5,18.5 17.5,23.5 11.5,23.5 C5.5,23.5 0.5,18.5 0.5,12.5 C0.5,6.5 5.5,1.5 11.5,1.5 C17.5,1.5 22.5,6.5 22.5,12.5 Z" strokeWidth="0" fill="#FFFFFF"/><path d="M11.5,6.5 C13.5,6.5 15.5,7.5 16.5,9.5 L19.5,6.5 C17.5,4.5 14.5,3.5 11.5,3.5 C7.5,3.5 4.5,5.5 2.5,8.5 L5.5,10.5 C6.5,8.5 8.5,6.5 11.5,6.5 Z" strokeWidth="0" fill="#EA4335"/><path d="M22.5,12.5 C22.5,13.5 22.5,14.5 22.5,15.5 L11.5,15.5 L11.5,11.5 L17.5,11.5 C18.5,13.5 17.5,16.5 15.5,18.5 L18.5,20.5 C21.5,18.5 22.5,15.5 22.5,12.5 Z" strokeWidth="0" fill="#4285F4"/><path d="M5.5,14.5 C5.5,13.5 5.5,12.5 5.5,11.5 L2.5,9.5 C1.5,10.5 1.5,12.5 1.5,14.5 C1.5,16.5 2.5,18.5 3.5,19.5 L6.5,17.5 C5.5,16.5 5.5,15.5 5.5,14.5 Z" strokeWidth="0" fill="#FBBC05"/><path d="M11.5,21.5 C9.5,21.5 7.5,20.5 6.5,18.5 L3.5,20.5 C5.5,22.5 8.5,24.5 11.5,24.5 C14.5,24.5 17.5,22.5 19.5,20.5 L16.5,18.5 C15.5,20.5 13.5,21.5 11.5,21.5 Z" strokeWidth="0" fill="#34A853"/></g></svg> );


// --- Reusable Form Component with Logic ---
const SignupForm = ({ styles }) => {
    const [userType, setUserType] = useState('freelancer');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Initialize demo data
    React.useEffect(() => {
        setName('Demo User');
        setEmail('newuser@demo.com');
        setPassword('password123');
    }, []);

    const handleSignup = async (e) => {
        e.preventDefault();
        console.log("Create Account button clicked!");
        console.log("Form data:", { name, email, password, userType });
        setError('');
        setLoading(true);

        if (!name || !email || !password) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                userType: userType,
                createdAt: serverTimestamp(),
            });

            setLoading(false);
            const redirectPath = userType === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard';
            navigate(redirectPath);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email address is already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters long.');
            } else {
                setError('Failed to create an account. Please try again.');
                console.error("Firebase signup error:", err);
            }
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            // Create profile doc if missing, use selected userType
            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            if (!snap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    name: user.displayName || name || '',
                    email: user.email || email || '',
                    userType,
                    createdAt: serverTimestamp(),
                });
            }
            const redirectPath = (userType || 'freelancer') === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard';
            navigate(redirectPath);
        } catch (err) {
            setError('Google sign-up failed. Please try again.');
            setLoading(false);
        }
    };

    // Demo info
    const getDemoInfo = () => (
        <div style={{
            background: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            fontSize: '0.9rem'
        }}>
            <strong>Demo Signup:</strong><br/>
            Create a new account or use existing demo accounts for login.
        </div>
    );

    return (
        <div style={styles.formContainer}>
            <div style={styles.logoHeader}><FlexwrkLogo /><h1 style={styles.brandName}>FLEXwrk</h1></div>
            <h2 style={styles.title}>Create an Account</h2>
            <p style={styles.subtitle}>Join our community of innovators.</p>
            
            <form onSubmit={handleSignup}>
                <div className="form-row" style={{ animationDelay: '0.1s' }}>
                    <label style={styles.formLabel}>I am a...</label>
                    <div style={styles.accountTypeSelector}>
                        <button type="button" style={styles.accountTypeButton(userType === 'freelancer')} onClick={() => setUserType('freelancer')}>Freelancer</button>
                        <button type="button" style={styles.accountTypeButton(userType === 'client')} onClick={() => setUserType('client')}>Client</button>
                    </div>
                </div>
                <div className="form-row" style={{ animationDelay: '0.2s' }}>
                    <label style={styles.formLabel}>Full Name</label>
                    <input type="text" style={styles.input} placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-row" style={{ animationDelay: '0.3s' }}>
                    <label style={styles.formLabel}>Email Address</label>
                    <input type="email" style={styles.input} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-row" style={{ animationDelay: '0.4s' }}>
                    <label style={styles.formLabel}>Password</label>
                    <div style={styles.passwordInputContainer}>
                        <input type={showPassword ? 'text' : 'password'} style={styles.input} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" style={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>
                {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
                <div className="form-row" style={{ animationDelay: '0.5s' }}>
                    {getDemoInfo()}
                    <button type="submit" style={styles.primaryButton} className="primary-button" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                    <button type="button" onClick={handleGoogleSignup} style={styles.googleButton} className="google-button" disabled={loading}>
                        <GoogleIcon /> Continue with Google
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Main Page Layout Component ---
export default function SignupPage() {
    // Screen size detection
    const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const isMobile = screenSize.width <= 768;
    const isTablet = screenSize.width <= 1024 && screenSize.width > 768;

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const styles = {
        pageContainer: { 
            fontFamily: '"Poppins", sans-serif', 
            backgroundColor: '#F8FAFC', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            overflow: 'hidden',
            padding: isMobile ? '1rem' : '0'
        },
        imagePanel: { 
            flex: isMobile ? 'none' : 1.2,
            height: isMobile ? '200px' : 'auto',
            position: 'relative', 
            animation: `slide-in-left 1s ease-out forwards`, 
            background: 'url(https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1) center/cover',
            display: isMobile ? 'flex' : 'block',
            order: isMobile ? 1 : 1
        },
        imageOverlay: { 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to top, rgba(29, 78, 216, 0.8), rgba(29, 78, 216, 0.2))', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: isMobile ? '1.5rem' : '3rem',
            color: '#FFFFFF', 
            textAlign: 'center' 
        },
        overlayTitle: { 
            fontSize: isMobile ? '1.8rem' : isTablet ? '2.5rem' : '3rem',
            fontWeight: 'bold', 
            textShadow: '0 2px 10px rgba(0,0,0,0.3)', 
            animation: 'fade-slide-up 0.8s ease 0.5s forwards', 
            opacity: 0 
        },
        overlaySubtitle: { 
            fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.2rem',
            opacity: 0, 
            maxWidth: isMobile ? '300px' : '400px',
            marginTop: '1rem', 
            textShadow: '0 2px 5px rgba(0,0,0,0.3)', 
            animation: 'fade-slide-up 0.8s ease 0.7s forwards' 
        },
        formPanel: { 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: isMobile ? '1.5rem 1rem' : isTablet ? '2rem 1.5rem' : '2rem',
            position: 'relative', 
            overflow: 'hidden',
            order: isMobile ? 2 : 2,
            minHeight: isMobile ? 'auto' : 'auto'
        },
        formContainer: { 
            width: '100%', 
            maxWidth: isMobile ? 'none' : '400px',
            zIndex: 1 
        },
        logoHeader: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: isMobile ? '1.5rem' : '2rem',
            animation: 'fade-slide-up 0.8s ease 0.2s forwards', 
            opacity: 0,
            justifyContent: isMobile ? 'center' : 'flex-start'
        },
        brandName: { 
            fontSize: isMobile ? '1.5rem' : isTablet ? '1.65rem' : '1.8rem',
            fontWeight: 'bold', 
            color: '#0F172A' 
        },
        title: { 
            fontSize: isMobile ? '1.8rem' : isTablet ? '2.2rem' : '2.5rem',
            fontWeight: '700', 
            color: '#0F172A', 
            marginBottom: '0.5rem', 
            animation: 'fade-slide-up 0.8s ease 0.3s forwards', 
            opacity: 0,
            textAlign: isMobile ? 'center' : 'left'
        },
        subtitle: { 
            color: '#475569', 
            marginBottom: isMobile ? '2rem' : '2.5rem',
            animation: 'fade-slide-up 0.8s ease 0.4s forwards', 
            opacity: 0,
            fontSize: isMobile ? '0.9rem' : '1rem',
            textAlign: isMobile ? 'center' : 'left'
        },
        formLabel: { 
            fontWeight: '600', 
            marginBottom: '0.5rem', 
            display: 'block', 
            fontSize: isMobile ? '0.85rem' : '0.9rem'
        },
        input: { 
            width: '100%', 
            padding: isMobile ? '0.8rem 1rem' : '0.9rem 1rem',
            border: '1px solid #CBD5E1', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.95rem' : '1rem',
            boxSizing: 'border-box' 
        },
        accountTypeSelector: { 
            display: 'flex', 
            gap: '1px', 
            backgroundColor: '#CBD5E1', 
            borderRadius: '8px', 
            overflow: 'hidden', 
            marginBottom: '1.5rem' 
        },
        accountTypeButton: (isActive) => ({ 
            flex: 1, 
            padding: isMobile ? '0.7rem' : '0.8rem',
            border: 'none', 
            backgroundColor: isActive ? '#FFFFFF' : 'transparent', 
            color: '#0F172A', 
            cursor: 'pointer', 
            fontWeight: isActive ? '600' : '500', 
            transition: 'all 0.2s ease',
            fontSize: isMobile ? '0.9rem' : '1rem'
        }),
        primaryButton: { 
            width: '100%', 
            padding: isMobile ? '0.8rem' : '0.9rem',
            backgroundColor: '#3B82F6', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.95rem' : '1rem',
            fontWeight: '500', 
            cursor: 'pointer', 
            transition: 'transform 0.2s ease, background-color 0.2s ease' 
        },
        googleButton: { 
            width: '100%', 
            padding: isMobile ? '0.8rem' : '0.9rem',
            backgroundColor: 'transparent', 
            color: '#0F172A', 
            border: '1px solid #CBD5E1', 
            borderRadius: '8px', 
            fontSize: isMobile ? '0.95rem' : '1rem',
            fontWeight: '500', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem', 
            marginTop: '1rem' 
        },
        passwordInputContainer: { 
            position: 'relative', 
            display: 'flex', 
            alignItems: 'center' 
        },
        eyeButton: { 
            position: 'absolute', 
            right: '1rem', 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            color: '#64748B' 
        },
        shape1: { 
            position: 'absolute', 
            top: '-50px', 
            right: '-80px', 
            width: isMobile ? '150px' : '200px',
            height: isMobile ? '150px' : '200px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '50%', 
            filter: 'blur(50px)', 
            animation: 'shape-float 15s ease-in-out infinite alternate',
            display: isMobile ? 'none' : 'block'
        },
        shape2: { 
            position: 'absolute', 
            top: '80px', 
            right: '-20px', 
            width: isMobile ? '100px' : '150px',
            height: isMobile ? '100px' : '150px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)', 
            borderRadius: '50%', 
            filter: 'blur(60px)', 
            animation: 'shape-float 20s ease-in-out infinite alternate-reverse',
            display: isMobile ? 'none' : 'block'
        },
    };

    return (
        <>
            <div style={styles.pageContainer}>
                <div style={styles.imagePanel}>
                    <div style={styles.imageOverlay}>
                        <h1 style={styles.overlayTitle}>Your Next Chapter Awaits</h1>
                        <p style={styles.overlaySubtitle}>Connect, collaborate, and create with the world's top talent, all in one place.</p>
                    </div>
                </div>
                <div style={styles.formPanel}>
                    <div style={styles.shape1}></div>
                    <div style={styles.shape2}></div>
                    <SignupForm styles={styles} />
                </div>
            </div>
        </>
    );
}