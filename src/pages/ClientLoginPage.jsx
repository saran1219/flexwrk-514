import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from "../firebase.js";
import { doc, getDoc, setDoc, serverTimestamp } from "../firebase.js";
import { auth, db, googleProvider } from '../firebase.js';
import './LoginPage.css';

// --- SVG Icon Components ---
const FlexwrkLogo = () => ( <svg width="32" height="32" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg"> <defs> <linearGradient id="loginGradBlue" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#1e3a8a" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient> <linearGradient id="loginGradGreen" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#22c55e" /></linearGradient> <linearGradient id="loginGradCyan" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient> </defs> <path d="M15 10 C 25 50, 35 50, 45 10 L 40 70 L 20 70 Z" fill="url(#loginGradBlue)" /> <path d="M75 10 C 65 50, 55 50, 45 10 L 50 70 L 70 70 Z" fill="url(#loginGradGreen)" opacity="0.9" /> <path d="M40 40 L 60 10 L 80 40 L 60 70 Z" fill="url(#loginGradCyan)" opacity="0.8" /> </svg> );
const GoogleIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><g fillRule="evenodd" transform="translate(0.5 0.5)"><path d="M11.5,1.5 C5.5,1.5 0.5,6.5 0.5,12.5 C0.5,18.5 5.5,23.5 11.5,23.5 C17.5,23.5 22.5,18.5 22.5,12.5 C22.5,6.5 17.5,1.5 11.5,1.5 Z" strokeWidth="2.5" stroke="currentColor" fill="#FFFFFF"/><path d="M22.5,12.5 C22.5,18.5 17.5,23.5 11.5,23.5 C5.5,23.5 0.5,18.5 0.5,12.5 C0.5,6.5 5.5,1.5 11.5,1.5 C17.5,1.5 22.5,6.5 22.5,12.5 Z" strokeWidth="0" fill="#FFFFFF"/><path d="M11.5,6.5 C13.5,6.5 15.5,7.5 16.5,9.5 L19.5,6.5 C17.5,4.5 14.5,3.5 11.5,3.5 C7.5,3.5 4.5,5.5 2.5,8.5 L5.5,10.5 C6.5,8.5 8.5,6.5 11.5,6.5 Z" strokeWidth="0" fill="#EA4335"/><path d="M22.5,12.5 C22.5,13.5 22.5,14.5 22.5,15.5 L11.5,15.5 L11.5,11.5 L17.5,11.5 C18.5,13.5 17.5,16.5 15.5,18.5 L18.5,20.5 C21.5,18.5 22.5,15.5 22.5,12.5 Z" strokeWidth="0" fill="#4285F4"/><path d="M5.5,14.5 C5.5,13.5 5.5,12.5 5.5,11.5 L2.5,9.5 C1.5,10.5 1.5,12.5 1.5,14.5 C1.5,16.5 2.5,18.5 3.5,19.5 L6.5,17.5 C5.5,16.5 5.5,15.5 5.5,14.5 Z" strokeWidth="0" fill="#FBBC05"/><path d="M11.5,21.5 C9.5,21.5 7.5,20.5 6.5,18.5 L3.5,20.5 C5.5,22.5 8.5,24.5 11.5,24.5 C14.5,24.5 17.5,22.5 19.5,20.5 L16.5,18.5 C15.5,20.5 13.5,21.5 11.5,21.5 Z" strokeWidth="0" fill="#34A853"/></g></svg> );
const EyeIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> );
const EyeOffIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> );
const CreativeIllustration = ({ styles }) => ( 
    <div style={styles.illustrationContainer}> 
        <svg style={styles.illustration} viewBox="0 0 400 400"> 
            <defs> 
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"> 
                    <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity:1}} /> 
                    <stop offset="100%" style={{stopColor: '#1E40AF', stopOpacity:1}} /> 
                </linearGradient> 
            </defs> 
            <circle cx="200" cy="200" r="180" fill="url(#grad1)" opacity="0.1" /> 
            <g className="float-1"> 
                <rect x="100" y="100" width="60" height="60" rx="10" fill="#FFFFFF" style={styles.shape} /> 
                <path d="M115 130 l15 0 l15 -10 l0 20 l-15 -10 l0 10 l-15 0 Z" fill="#3B82F6" /> 
            </g> 
            <g className="float-2"> 
                <circle cx="280" cy="150" r="35" fill="#FFFFFF" style={styles.shape} /> 
                <rect x="270" y="140" width="20" height="20" rx="2" fill="#1E40AF" /> 
            </g> 
            <g className="float-3"> 
                <path d="M120 280 l40 -70 l40 70 Z" fill="#FFFFFF" style={styles.shape} /> 
                <circle cx="160" cy="245" r="8" fill="#60A5FA" /> 
            </g> 
            <g className="float-4"> 
                <rect x="250" y="270" width="70" height="70" rx="35" fill="#FFFFFF" style={styles.shape} /> 
                <path d="M275 295 l20 10 l0 -20 Z" fill="#2563EB" /> 
            </g> 
        </svg> 
    </div> 
);

export default function ClientLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    // Initialize empty credentials
    useEffect(() => {
        setEmail('');
        setPassword('');
    }, []);

    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // On success, the onAuthStateChanged listener in App.jsx will handle redirection.
        } catch (err) {
            setError('Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            // Ensure user profile exists
            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            if (!snap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    name: user.displayName || '',
                    email: user.email || '',
                    userType: 'client',
                    createdAt: serverTimestamp(),
                });
            }
            // App onAuthStateChanged will handle navigation
        } catch (err) {
            setError('Google sign-in failed. Please try again.');
            setLoading(false);
        }
    };

    const styles = { 
        pageContainer: { fontFamily: '"Poppins", sans-serif', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }, 
        loginCard: { display: 'flex', width: '90%', maxWidth: '1000px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden', animation: 'fade-slide-up 0.8s ease-out forwards', opacity: 0, }, 
        leftPanel: { flex: 1, padding: '3rem', animation: 'fade-in 1s ease-out 0.4s forwards', opacity: 0, }, 
        logoHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }, 
        brandName: { fontSize: '1.8rem', fontWeight: 'bold', color: '#0F172A' }, 
        title: { fontSize: '2rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.5rem' }, 
        subtitle: { color: '#475569', marginBottom: '2rem' }, 
        roleIndicator: { backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', marginBottom: '2rem', textAlign: 'center' },
        formLabel: { fontWeight: '600', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }, 
        input: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }, 
        passwordInputContainer: { position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }, 
        eyeButton: { position: 'absolute', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }, 
        formOptions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }, 
        checkboxContainer: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, 
        forgotPassword: { color: '#3B82F6', textDecoration: 'none' }, 
        primaryButton: { width: '100%', padding: '0.9rem', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s ease' }, 
        googleButton: { width: '100%', padding: '0.9rem', backgroundColor: 'transparent', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }, 
        signUpPrompt: { textAlign: 'center', marginTop: '2rem', color: '#475569' }, 
        signUpLink: { color: '#3B82F6', fontWeight: 'bold', textDecoration: 'none' },
        roleSwitch: { textAlign: 'center', marginTop: '1rem', color: '#475569', fontSize: '0.9rem' },
        roleSwitchLink: { color: '#3B82F6', textDecoration: 'none', fontWeight: '500' },
        rightPanel: { flex: 1.2, background: 'linear-gradient(45deg, #DBEAFE, #EEF2FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', }, 
        illustrationContainer: { width: '100%', height: '100%', position: 'relative', }, 
        illustration: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', }, 
        shape: { boxShadow: '0 10px 20px rgba(0,0,0,0.1)', }, 
    };

    return (
        <>
            <style>
                {`@keyframes fade-slide-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}@keyframes fade-in{from{opacity:0}to{opacity:1}}@keyframes hero-float-1{0%{transform:translate(0,0)}50%{transform:translate(-15px,10px) rotate(-5deg)}100%{transform:translate(0,0)}}@keyframes hero-float-2{0%{transform:translate(0,0)}50%{transform:translate(10px,-20px) rotate(5deg)}100%{transform:translate(0,0)}}@keyframes hero-float-3{0%{transform:translate(20px,15px) rotate(8deg)}100%{transform:translate(0,0)}}@keyframes hero-float-4{0%{transform:translate(0,0)}50%{transform:translate(-10px,-10px) rotate(-8deg)}100%{transform:translate(0,0)}}.float-1{animation:hero-float-1 10s ease-in-out infinite}.float-2{animation:hero-float-2 12s ease-in-out infinite}.float-3{animation:hero-float-3 14s ease-in-out infinite}.float-4{animation:hero-float-4 8s ease-in-out infinite}.primary-button:hover{background-color:#1D4ED8}.google-button:hover{background-color:#F1F5F9}`}
            </style>
            <div style={styles.pageContainer}>
                <div style={styles.loginCard}>
                    <div style={styles.leftPanel}>
                        <div style={styles.logoHeader}><FlexwrkLogo /><h1 style={styles.brandName}>FLEXwrk</h1></div>
                        <h2 style={styles.title}>Welcome back, Client</h2>
                        <p style={styles.subtitle}>Access your project dashboard and find talented freelancers.</p>
                        
                        <div style={styles.roleIndicator}>
                            Signing in as a Client
                        </div>

                        <form onSubmit={handleEmailSignIn}>
                            <label style={styles.formLabel}>Email address</label>
                            <input type="email" style={{...styles.input, marginBottom: '1.5rem'}} value={email} onChange={(e) => setEmail(e.target.value)} required />
                            
                            <label style={{ ...styles.formLabel, marginTop: '1.5rem' }}>Password</label>
                            <div style={styles.passwordInputContainer}>
                               <input type={showPassword ? 'text' : 'password'} style={{...styles.input, marginBottom: 0}} value={password} onChange={(e) => setPassword(e.target.value)} required />
                               <button type="button" style={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                                   {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                               </button>
                            </div>
                            
                            <div style={styles.formOptions}>
                                <div style={styles.checkboxContainer}><input type="checkbox" id="remember"/><label htmlFor="remember">Remember me</label></div>
                                <Link to="/forgot-password" style={styles.forgotPassword}>Forgot password</Link>
                            </div>

                            {error && <p style={{color: 'red', textAlign: 'center', marginBottom: '1rem'}}>{error}</p>}

                            <button type="submit" style={styles.primaryButton} className="primary-button" disabled={loading}>{loading ? 'Signing In...' : 'Sign in'}</button>
                        </form>
                        <button type="button" onClick={handleGoogleSignIn} style={styles.googleButton} className="google-button" disabled={loading}>
                            <GoogleIcon /> Continue with Google
                        </button>
                        
                        <div style={styles.roleSwitch}>
                            Looking for freelance work? <Link to="/freelancer-login" style={styles.roleSwitchLink}>Sign in as Freelancer</Link>
                        </div>
                        
                        <p style={styles.signUpPrompt}>Don't have an account? <Link to="/signup" style={styles.signUpLink}>Sign up</Link></p>
                    </div>
                    <div style={styles.rightPanel}>
                        <CreativeIllustration styles={styles} />
                    </div>
                </div>
            </div>
        </>
    );
}