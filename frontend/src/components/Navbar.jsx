import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Clock } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link to="/" className="logo">
          <Clock className="logo-icon" />
          <span>FocusFlow</span>
        </Link>
      </div>
      
      <div className="navbar-actions">
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <button onClick={handleLogout} className="btn-glass">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
