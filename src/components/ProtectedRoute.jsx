import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, user, userRole, requiredRole, loading }) {
    const location = useLocation();

    // While the initial authentication check is running, show a loading screen.
    if (loading) {
        return <div style={{ fontFamily: '"Poppins", sans-serif', padding: '50px', textAlign: 'center' }}>Verifying Authentication...</div>;
    }

    // If the check is complete and there's no user, redirect to login.
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If we have a user but are still waiting for their role, show a loading screen.
    // This is the key fix for the race condition.
    if (!userRole) {
        return <div style={{ fontFamily: '"Poppins", sans-serif', padding: '50px', textAlign: 'center' }}>Loading User Profile...</div>;
    }

    // If the user's role does not match the required role, redirect them.
    if (userRole !== requiredRole) {
        // Redirect to their own dashboard or a safe default like the homepage.
        const correctDashboard = userRole === 'freelancer' ? '/freelancer-dashboard' : '/client-dashboard';
        return <Navigate to={correctDashboard} replace />;
    }

    // If all checks pass, render the dashboard component.
    return children;
}

export default ProtectedRoute;

