import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, doc, getDoc } from './firebase.js';
import { auth, db } from './firebase.js';

// Import Pages and Components
import HomePage from './pages/Homepage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ClientLoginPage from './pages/ClientLoginPage';
import FreelancerLoginPage from './pages/FreelancerLoginPage';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// A wrapper component to manage navigation within the router context
function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.debug("User authenticated:", { uid: user.uid, email: user.email });
          
          // Get user profile from Firestore to determine role
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userRole = null;
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userRole = userData.userType || userData.role;
            console.debug("User role from Firestore:", userRole);
          } else {
            console.warn("User document not found in Firestore");
          }
          
          setCurrentUser(user);
          setCurrentUserRole(userRole);

          // If the user is on a public page like login/signup, redirect them.
          if (userRole && (location.pathname === '/login' || location.pathname === '/client-login' || location.pathname === '/freelancer-login' || location.pathname === '/signup')) {
            const redirectPath = userRole === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard';
            navigate(redirectPath);
          }
        } else {
          console.debug("No user authenticated");
          setCurrentUser(null);
          setCurrentUserRole(null);
        }
      } catch (err) {
        console.error("Failed to load user profile document:", err);
        setCurrentUser(null);
        setCurrentUserRole(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  if (loading) {
    return <div style={{ fontFamily: '"Poppins", sans-serif', padding: '50px', textAlign: 'center' }}>Loading Application...</div>;
  }

  return (
    <Routes>
      {/* Public Routes - Anyone can see these */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/client-login" element={<ClientLoginPage />} />
      <Route path="/freelancer-login" element={<FreelancerLoginPage />} />
      
      {/* Protected Routes - Only accessible to logged-in users with the correct role */}
      <Route 
        path="/freelancer-dashboard" 
        element={
          <ProtectedRoute user={currentUser} userRole={currentUserRole} requiredRole="freelancer" loading={loading}>
            <FreelancerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client-dashboard" 
        element={
          <ProtectedRoute user={currentUser} userRole={currentUserRole} requiredRole="client" loading={loading}>
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

