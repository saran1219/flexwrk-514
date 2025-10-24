// src/utils/responsive.js
import { useState, useEffect } from 'react';

// Breakpoint constants
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  largeDesktop: 1440
};

// Custom hook for screen size detection
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return screenSize;
};

// Custom hook for responsive breakpoints
export const useResponsive = () => {
  const screenSize = useScreenSize();
  const width = screenSize.width;

  return {
    isMobile: width <= BREAKPOINTS.mobile,
    isTablet: width <= BREAKPOINTS.tablet && width > BREAKPOINTS.mobile,
    isDesktop: width <= BREAKPOINTS.largeDesktop && width > BREAKPOINTS.tablet,
    isLargeDesktop: width > BREAKPOINTS.largeDesktop,
    width,
    height: screenSize.height
  };
};

// Responsive utility functions
export const getResponsiveValue = (values, breakpoints) => {
  const { isMobile, isTablet, isDesktop } = breakpoints;
  
  if (isMobile && values.mobile !== undefined) return values.mobile;
  if (isTablet && values.tablet !== undefined) return values.tablet;
  if (isDesktop && values.desktop !== undefined) return values.desktop;
  return values.default || values.desktop || values.tablet || values.mobile;
};

// Common responsive styles
export const RESPONSIVE_STYLES = {
  // Container styles
  container: (breakpoints) => ({
    maxWidth: getResponsiveValue({
      mobile: '100%',
      tablet: '768px',
      desktop: '1024px',
      default: '1200px'
    }, breakpoints),
    margin: '0 auto',
    padding: getResponsiveValue({
      mobile: '1rem',
      tablet: '1.5rem',
      desktop: '2rem',
      default: '2rem'
    }, breakpoints)
  }),

  // Grid styles
  grid: (breakpoints, columns = { mobile: 1, tablet: 2, desktop: 3 }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${getResponsiveValue(columns, breakpoints)}, 1fr)`,
    gap: getResponsiveValue({
      mobile: '1rem',
      tablet: '1.5rem',
      desktop: '2rem',
      default: '2rem'
    }, breakpoints)
  }),

  // Typography
  typography: {
    heading1: (breakpoints) => ({
      fontSize: getResponsiveValue({
        mobile: '1.5rem',
        tablet: '2rem',
        desktop: '2.5rem',
        default: '3rem'
      }, breakpoints),
      fontWeight: 'bold',
      lineHeight: 1.2
    }),
    heading2: (breakpoints) => ({
      fontSize: getResponsiveValue({
        mobile: '1.25rem',
        tablet: '1.5rem',
        desktop: '2rem',
        default: '2.25rem'
      }, breakpoints),
      fontWeight: '600',
      lineHeight: 1.3
    }),
    heading3: (breakpoints) => ({
      fontSize: getResponsiveValue({
        mobile: '1.125rem',
        tablet: '1.25rem',
        desktop: '1.5rem',
        default: '1.75rem'
      }, breakpoints),
      fontWeight: '600',
      lineHeight: 1.4
    }),
    body: (breakpoints) => ({
      fontSize: getResponsiveValue({
        mobile: '0.875rem',
        tablet: '0.9rem',
        desktop: '1rem',
        default: '1rem'
      }, breakpoints),
      lineHeight: 1.5
    }),
    caption: (breakpoints) => ({
      fontSize: getResponsiveValue({
        mobile: '0.75rem',
        tablet: '0.8rem',
        desktop: '0.875rem',
        default: '0.875rem'
      }, breakpoints),
      lineHeight: 1.4
    })
  },

  // Button styles
  button: {
    primary: (breakpoints) => ({
      padding: getResponsiveValue({
        mobile: '0.75rem 1rem',
        tablet: '0.875rem 1.25rem',
        desktop: '1rem 1.5rem',
        default: '1rem 1.5rem'
      }, breakpoints),
      fontSize: getResponsiveValue({
        mobile: '0.875rem',
        tablet: '0.9rem',
        desktop: '1rem',
        default: '1rem'
      }, breakpoints),
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    }),
    secondary: (breakpoints) => ({
      padding: getResponsiveValue({
        mobile: '0.6rem 0.875rem',
        tablet: '0.75rem 1rem',
        desktop: '0.875rem 1.25rem',
        default: '0.875rem 1.25rem'
      }, breakpoints),
      fontSize: getResponsiveValue({
        mobile: '0.8rem',
        tablet: '0.875rem',
        desktop: '0.9rem',
        default: '0.9rem'
      }, breakpoints),
      borderRadius: '6px',
      border: '1px solid #CBD5E1',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '400',
      backgroundColor: 'transparent'
    })
  },

  // Form styles
  form: {
    input: (breakpoints) => ({
      width: '100%',
      padding: getResponsiveValue({
        mobile: '0.75rem 1rem',
        tablet: '0.875rem 1rem',
        desktop: '1rem',
        default: '1rem'
      }, breakpoints),
      fontSize: getResponsiveValue({
        mobile: '0.9rem',
        tablet: '0.95rem',
        desktop: '1rem',
        default: '1rem'
      }, breakpoints),
      border: '1px solid #CBD5E1',
      borderRadius: '8px',
      boxSizing: 'border-box'
    }),
    label: (breakpoints) => ({
      fontSize: getResponsiveValue({
        mobile: '0.8rem',
        tablet: '0.875rem',
        desktop: '0.9rem',
        default: '0.9rem'
      }, breakpoints),
      fontWeight: '600',
      marginBottom: '0.5rem',
      display: 'block'
    })
  }
};

// Navigation components
export const MOBILE_NAV_STYLES = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  menuPanel: {
    backgroundColor: 'white',
    width: '280px',
    height: '100%',
    padding: '2rem',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out'
  },
  menuPanelOpen: {
    transform: 'translateX(0)'
  },
  hamburgerButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0'
  },
  hamburgerLine: {
    width: '24px',
    height: '2px',
    backgroundColor: 'currentColor',
    transition: 'all 0.3s ease'
  }
};

export default {
  BREAKPOINTS,
  useScreenSize,
  useResponsive,
  getResponsiveValue,
  RESPONSIVE_STYLES,
  MOBILE_NAV_STYLES
};