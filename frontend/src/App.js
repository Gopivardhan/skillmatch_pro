import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Import pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import MentorDashboard from './pages/MentorDashboard';
import HomePage from './pages/HomePage';

// ProtectedRoute ensures the user is authenticated and optionally has one of the specified roles.
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute roles={["candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/*"
          element={
            <ProtectedRoute roles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/*"
          element={
            <ProtectedRoute roles={["mentor"]}>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;