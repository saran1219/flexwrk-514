import React, { useState, useEffect } from 'react';

// This function will be called by Google's library when a user signs in
const handleCredentialResponse = (response) => {
  // `response.credential` is the ID token you need to send to your backend
  console.log("ID Token received: " + response.credential);

  // You would typically send this token to your backend server for verification
  // and to get the user's profile information securely.
  // The state of your application can be updated here, for example, to redirect the user.
};

// --- SVG Illustration Component ---
const SignUpIllustration = ({ isLoaded }) => {
  const illustrationStyle = {
    animation: isLoaded ? 'float 6s ease-in-out infinite' : 'none',
  };
  return (
    <svg style={illustrationStyle} width="250" height="350" viewBox="0 0 300 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Shape */}
      <path d="M28.31,313.37C-2.43,248.8,1.8,157.9,37.36,99.53,81.1,28.8,172.4-18,248.1,7.22c75.7,25.2,85.1,123,59.3,191.2-25.8,68.2-106.8,111-180.3,124.1C53.65,435.64,65.18,389.79,28.31,313.37Z" fill="#F3E8FF" />

      {/* Desk */}
      <rect x="50" y="320" width="200" height="10" rx="5" fill="#A78BFA" />
      <line x1="100" y1="330" x2="80" y2="380" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round"/>
      <line x1="200" y1="330" x2="220" y2="380" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round"/>

      {/* Freelancer Character */}
      <g transform="translate(40, 30)">
        <rect x="80" y="220" width="80" height="100" fill="#7C3AED"/>
        <circle cx="120" cy="190" r="30" fill="#F3E8FF" />
        <path d="M110 165 a 20 20 0 0 1 20 0 L 135 180 H 105 Z" fill="#4A5568" />
      </g>

      {/* Laptop */}
      <path d="M160 270 H 240 L 250 320 H 150 Z" fill="#CBD5E0" />
      <rect x="165" y="275" width="70" height="40" fill="#FFFFFF" />
    </svg>
  );
};

function SignUpPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        { theme: "filled_blue", size: "large", text: "continue_with", shape: "rectangular" }
      );
    }
  }, []); // Empty dependency array means this effect runs once on mount


  
  const styles = {
    container: {
      display: 'flex',
      fontFamily: '"Poppins", sans-serif',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
    },
    leftPanel: {
      flex: 1.2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      backgroundColor: '#ffffffff',
      transition: 'opacity 0.5s ease-in, transform 0.5s ease-in',
      opacity: isLoaded ? 1 : 0,
      transform: isLoaded ? 'translateX(0)' : 'translateX(-50px)',
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 4rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#1F2937',
      alignSelf: 'flex-start',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '1rem',
      color: '#6B7280',
      alignSelf: 'flex-start',
      marginBottom: '2rem',
    },
    form: {
      width: '100%',
    },
    formElement: (delay) => ({
      transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
      opacity: isLoaded ? 1 : 0,
      transform: isLoaded ? 'translateX(0)' : 'translateX(50px)',
    }),
    input: {
      width: '100%',
      padding: '0.8rem 1rem',
      margin: '0.5rem 0',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#F3F4F6',
      fontSize: '1rem',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '0.9rem',
      margin: '1rem 0',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#C4B5FD',
      color: '#4C1D95',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    separator: {
      textAlign: 'center',
      color: '#9CA3AF',
      margin: '1.5rem 0',
    },
    signInLink: {
      textAlign: 'center',
      marginTop: '2rem',
      color: '#6B7280',
    },
    link: {
      color: '#8B5CF6',
      fontWeight: '600',
      textDecoration: 'none',
    },
  };

  const keyframes = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <div style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h1 style={styles.title}>Create Account,</h1>
            <p style={styles.subtitle}>Sign up to get started.</p>
            <SignUpIllustration isLoaded={isLoaded} />
          </div>
        </div>

        <div style={styles.rightPanel}>
          <form style={styles.form}>
            <div style={styles.formElement(0.2)}>
              <input style={styles.input} type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={styles.formElement(0.3)}>
              <input style={styles.input} type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div style={styles.formElement(0.4)}>
              <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={styles.formElement(0.5)}>
              <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div style={styles.formElement(0.6)}>
              <button style={styles.button} type="submit">Continue</button>
            </div>
          </form>

          <div style={{ ...styles.separator, ...styles.formElement(0.7) }}>
            <span>or </span>
          </div>

          <div style={styles.formElement(0.8)}>
            {/* The Google button will be rendered into this container */}
            <div id="google-button-container"></div>
          </div>

          <div style={styles.formElement(0.9)}>
            <p style={styles.signInLink}>
              Already have an account? <a href="#" style={styles.link}>Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
