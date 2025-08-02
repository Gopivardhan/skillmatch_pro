import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * A responsive navigation bar that displays the app brand and
 * contextual actions based on authentication state. When a user is
 * logged in, their first name and a logout button are shown. When
 * logged out, links to login and register pages are provided. The
 * navigation bar uses Bootstrap classes for layout and styling, and
 * custom colours are defined in the global stylesheet.
 */
const NavigationBar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/', { replace: true });
  };

  return (
    // The 'navbar-light' and 'bg-white' classes are removed so the global
    // dark theme styles defined in index.css can take effect. The default
    // 'navbar' class still allows our custom CSS to set background colour
    // and other properties. Border and shadow are omitted for a cleaner
    // appearance in dark mode.
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          SkillMatch&nbsp;<span className="text-primary">Pro</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">Hello, {user.name.split(' ')[0]}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;