import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  if (user) {
    // Redirect logged-in users to their respective dashboard
    return <Navigate to={`/${user.role}`} replace />;
  }
  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-3">SkillMatch Pro</h1>
      <p className="lead mb-4">
        Build your portfolio, find your perfect job, or provide expert reviews. SkillMatch Pro connects candidates, recruiters and mentors in one platform.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <a href="/login" className="btn btn-primary">Login</a>
        <a href="/register" className="btn btn-outline-secondary">Register</a>
      </div>
    </div>
  );
};

export default HomePage;