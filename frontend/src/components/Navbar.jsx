import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Clock, Settings, LogOut, User } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const PRESET_AVATARS = {
  avatar1: '🧘',
  avatar2: '🧠',
  avatar3: '🚀',
  avatar4: '🐱',
  avatar5: '🦉',
  avatar6: '🦊',
  avatar7: '⚡',
  avatar8: '🌱',
};

const Navbar = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderAvatar = () => {
    if (!user || !user.avatar) return <User size={16} />;
    
    if (user.avatar.startsWith('data:image')) {
      return <img src={user.avatar} alt="Avatar" className="nav-avatar-img" />;
    }
    
    const emoji = PRESET_AVATARS[user.avatar] || '🧘';
    return <span className="nav-avatar-emoji">{emoji}</span>;
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <Link to={user ? "/dashboard" : "/"} className="logo">
          <Clock className="logo-icon" />
          <span>FocusFlow</span>
        </Link>
      </div>
      
      <div className="navbar-actions">
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        {user ? (
          <>
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/history" 
              className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
            >
              History
            </Link>
            <Link 
              to="/settings" 
              className={`nav-link settings-nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
              title="Settings"
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            
            <div className="user-profile-nav-wrapper" onClick={() => navigate('/settings')} title="Profile Config">
              <div className="nav-avatar-circle">
                {renderAvatar()}
              </div>
              <span className="nav-username">{user.name}</span>
            </div>

            <button onClick={handleLogout} className="btn-glass nav-logout-btn" title="Logout">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn-primary sign-up-nav-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
