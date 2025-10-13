// src/components/Footer.jsx
import React from 'react';

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
const InstagramIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkedinIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 21.5h-5v-13h5v13zM4 6.5C2.5 6.5 1.5 5.3 1.5 4s1-2.5 2.5-2.5c1.4 0 2.5 1.2 2.5 2.5s-1.1 2.5-2.5 2.5zm13.5 15h-5v-6.5c0-1.5-.5-2.5-2-2.5c-1.5 0-2 .7-2 2.5V21.5h-5v-13h5V10c1-2 2.5-3.5 4.5-3.5c3.5 0 5 2.2 5 7V21.5z"/></svg>;


const Footer = ({ styles, footerLinks, isLoaded }) => {
    return (
        <footer style={styles.footer}>
            <div style={styles.footerContent}>

                <div style={styles.footerColumn(0.2)}>
                    <div style={styles.logoContainer}><FlexwrkLogo /><span>FLEXwrk</span></div>
                    <p style={styles.footerDescription}>A leading platform to connect talented freelancers with amazing clients. We make hiring simple, secure, and successful.</p>
                    <div style={styles.socialContainer}>
                        <p style={{ fontWeight: '500' }}>Connect with us</p>
                        <div style={styles.socialIcons}>
                            <a href="#" className="social-icon" style={styles.socialIcon}><InstagramIcon /></a>
                            <a href="#" className="social-icon" style={styles.socialIcon}><FacebookIcon /></a>
                            <a href="#" className="social-icon" style={styles.socialIcon}><XIcon /></a>
                            <a href="#" className="social-icon" style={styles.socialIcon}><LinkedinIcon /></a>
                        </div>
                    </div>
                </div>

                <div style={styles.footerColumn(0.3)}>
                    <h4 style={styles.footerColumnTitle}>Company</h4>
                    {footerLinks.company.map(link => <a key={link} href="#" className="footer-link" style={styles.footerLink}>{link}</a>)}
                </div>

                <div style={styles.footerColumn(0.4)}>
                    <h4 style={styles.footerColumnTitle}>For Freelancers</h4>
                    {footerLinks.freelancers.map(link => <a key={link} href="#" className="footer-link" style={styles.footerLink}>{link}</a>)}
                </div>

                <div style={styles.footerColumn(0.5)}>
                    <h4 style={styles.footerColumnTitle}>Resources</h4>
                    {footerLinks.resources.map(link => <a key={link} href="#" className="footer-link" style={styles.footerLink}>{link}</a>)}
                </div>

            </div>
            <div style={styles.footerBottom}><p>&copy; 2025 FLEXwrk. All Rights Reserved.</p></div>
        </footer>
    );
};

export default Footer;
