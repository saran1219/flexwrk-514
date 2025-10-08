import React, { useState, useEffect } from 'react';

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

const AuthForm = ({ styles, isSignIn, setIsSignIn }) => {
    const [userType, setUserType] = useState('freelancer');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div style={styles.formContainer}>
            <div style={styles.logoHeader}>
                <FlexwrkLogo />
                <h1 style={styles.brandName}>FLEXwrk</h1>
            </div>
            <h2 style={styles.title}>{isSignIn ? "Welcome Back!" : "Create an Account"}</h2>
            <p style={styles.subtitle}>{isSignIn ? "Sign in to continue your journey." : "Join our community of innovators."}</p>
            
            <form>
                {!isSignIn && (
                     <div className="form-row" style={{animationDelay: '0.1s'}}>
                        <label style={styles.formLabel}>I am a...</label>
                        <div style={styles.accountTypeSelector}>
                            <button type="button" style={styles.accountTypeButton(userType === 'freelancer')} onClick={() => setUserType('freelancer')}>Freelancer</button>
                            <button type="button" style={styles.accountTypeButton(userType === 'client')} onClick={() => setUserType('client')}>Client</button>
                        </div>
                    </div>
                )}

                {!isSignIn && (
                    <div className="form-row" style={{animationDelay: '0.2s'}}>
                        <label style={styles.formLabel}>Full Name</label>
                        <input type="text" style={styles.input} placeholder="John Doe" />
                    </div>
                )}

                <div className="form-row" style={{animationDelay: '0.3s'}}>
                    <label style={styles.formLabel}>Email Address</label>
                    <input type="email" style={styles.input} placeholder="you@example.com" />
                </div>
                
                <div className="form-row" style={{animationDelay: '0.4s'}}>
                    <label style={styles.formLabel}>Password</label>
                    <div style={styles.passwordInputContainer}>
                        <input type={showPassword ? 'text' : 'password'} style={styles.input} placeholder="••••••••" />
                        <button type="button" style={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                <div className="form-row" style={{animationDelay: '0.5s'}}>
                    <button type="submit" style={styles.primaryButton}>
                        {isSignIn ? "Sign In" : "Create Account"}
                    </button>
                </div>
            </form>
            
            <div style={styles.toggleForm}>
                {isSignIn ? "Don't have an account?" : "Already have an account?"}
                <button style={styles.toggleButton} onClick={() => setIsSignIn(!isSignIn)}>
                    {isSignIn ? "Sign Up" : "Sign In"}
                </button>
            </div>
        </div>
    );
};


export default function AuthenticationPage() {
    const [isSignIn, setIsSignIn] = useState(false);

    const styles = {
        pageContainer: { fontFamily: '"Poppins", sans-serif', backgroundColor: '#F1F8E9', minHeight: '100vh', display: 'flex', overflow: 'hidden' },
        imagePanel: { flex: 1.2, position: 'relative', animation: `slide-in-left 1s ease-out forwards`, background: 'url(https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1) center/cover' },
        imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(27, 94, 32, 0.8), rgba(27, 94, 32, 0.2))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: '#FFFFFF', textAlign: 'center' },
        overlayTitle: { fontSize: '3rem', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.3)', animation: 'fade-slide-up 0.8s ease 0.5s forwards', opacity: 0 },
        overlaySubtitle: { fontSize: '1.2rem', opacity: 0, maxWidth: '400px', marginTop: '1rem', textShadow: '0 2px 5px rgba(0,0,0,0.3)', animation: 'fade-slide-up 0.8s ease 0.7s forwards' },
        
        formPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' },
        formContainer: { width: '100%', maxWidth: '400px', zIndex: 1 },
        logoHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', animation: 'fade-slide-up 0.8s ease 0.2s forwards', opacity: 0 },
        brandName: { fontSize: '1.8rem', fontWeight: 'bold', color: '#1B5E20' },
        title: { fontSize: '2.5rem', fontWeight: '700', color: '#1B5E20', marginBottom: '0.5rem', animation: 'fade-slide-up 0.8s ease 0.3s forwards', opacity: 0 },
        subtitle: { color: '#33691E', marginBottom: '2.5rem', animation: 'fade-slide-up 0.8s ease 0.4s forwards', opacity: 0 },
        
        formLabel: { fontWeight: '600', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' },
        input: { width: '100%', padding: '0.9rem 1rem', border: '1px solid #C5E1A5', backgroundColor: '#FFFFFF', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
        accountTypeSelector: { display: 'flex', gap: '1px', backgroundColor: '#C5E1A5', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' },
        accountTypeButton: (isActive) => ({ flex: 1, padding: '0.8rem', border: 'none', backgroundColor: isActive ? '#FFFFFF' : 'transparent', color: '#1B5E20', cursor: 'pointer', fontWeight: isActive ? '600' : '500', transition: 'all 0.2s ease' }),
        primaryButton: { width: '100%', padding: '0.9rem', backgroundColor: '#4CAF50', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', transition: 'transform 0.2s ease, background-color 0.2s ease' },
        
        passwordInputContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
        eyeButton: { position: 'absolute', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#558B2F' },
        
        toggleForm: { textAlign: 'center', marginTop: '2rem', color: '#33691E', animation: 'fade-in 0.8s ease 0.8s forwards', opacity: 0 },
        toggleButton: { background: 'none', border: 'none', color: '#4CAF50', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginLeft: '0.5rem' },

        shape1: {
            position: 'absolute',
            top: '-50px',
            right: '-80px',
            width: '200px',
            height: '200px',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderRadius: '50%',
            filter: 'blur(50px)',
            animation: 'shape-float 15s ease-in-out infinite alternate',
        },
        shape2: {
            position: 'absolute',
            top: '80px',
            right: '-20px',
            width: '150px',
            height: '150px',
            backgroundColor: 'rgba(139, 195, 74, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'shape-float 20s ease-in-out infinite alternate-reverse',
        },
    };
    
    const keyframes = `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shape-float { 
            from { transform: translate(0, 0) scale(1); }
            to { transform: translate(30px, -40px) scale(1.1); }
        }
        .form-row { opacity: 0; animation: fade-slide-up 0.6s ease forwards; margin-bottom: 1.5rem; }
        .primary-button:hover { background-color: #388E3C; transform: translateY(-2px); }
    `;

    return (
        <>
            <style>{keyframes}</style>
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
                   <AuthForm styles={styles} isSignIn={isSignIn} setIsSignIn={setIsSignIn} />
                </div>
            </div>
        </>
    );
}

