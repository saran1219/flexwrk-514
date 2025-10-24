// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

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

const Header = ({ styles, isLoaded }) => {
  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.logoContainer}><FlexwrkLogo /><span>FLEXwrk</span></div>
        <div style={styles.navLinks}>
          <a href="#" style={styles.navLink(0.2)} className="nav-link">Home</a>
          <a href="#" style={styles.navLink(0.3)} className="nav-link">About</a>
          <a href="#" style={styles.navLink(0.4)} className="nav-link">Contact Us</a>
        </div>
        <div style={styles.navButtons}>
          <Link to="/signup" className="nav-button" style={{ ...styles.button, textDecoration: 'none' }}>Sign Up</Link>
          <div style={styles.loginDropdown}>
            <div style={styles.loginButtonGroup}>
              <Link to="/freelancer-login" className="nav-button" style={{ ...styles.loginOption, ...styles.freelancerLogin, textDecoration: 'none' }}>Freelancer Login</Link>
              <Link to="/client-login" className="nav-button" style={{ ...styles.loginOption, ...styles.clientLogin, textDecoration: 'none' }}>Client Login</Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;