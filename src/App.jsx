import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';

// Import Pages and Components
import HomePage from './pages/Homepage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
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
    // This listener from Firebase runs whenever a user signs in or out.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // A user is logged in. Fetch their role from Firestore.
          const docRef = doc(db, "users", user.uid);
          console.debug("Fetching user profile:", { uid: user.uid, path: docRef.path });
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const role = docSnap.data().userType;
            setCurrentUser(user);
            setCurrentUserRole(role);

            // If the user is on a public page like login/signup, redirect them.
            if (location.pathname === '/login' || location.pathname === '/signup') {
              const redirectPath = role === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard';
              navigate(redirectPath);
            }
          } else {
            // This can happen if a user is deleted from Firestore but not from Authentication.
            console.error("User data not found in Firestore for UID:", user.uid);
            setCurrentUser(null);
            setCurrentUserRole(null);
          }
        } else {
          // No user is signed in.
          setCurrentUser(null);
          setCurrentUserRole(null);
        }
      } catch (err) {
        // Permission or network errors will land here
        console.error("Failed to load user profile document:", err);
        setCurrentUser(null);
        setCurrentUserRole(null);
      } finally {
        setLoading(false);
      }
    });
    // Cleanup the listener when the component unmounts.
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

