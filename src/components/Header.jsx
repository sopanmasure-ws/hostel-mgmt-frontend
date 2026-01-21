import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import '../styles/header.css';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/signin');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🏛️</span>
          <h1>Hostel Management</h1>
        </div>
      </div>
      
      <nav className="header-right">
        <button 
          className="nav-btn"
          onClick={() => handleNavigation('/')}
        >
          Home
        </button>
        <button 
          className="nav-btn"
          onClick={() => handleNavigation('/about')}
        >
          About
        </button>
        <button 
          className="nav-btn"
          onClick={() => handleNavigation('/contact')}
        >
          Contact
        </button>
        {isAuthenticated ? (
          <>
            <span className="user-name">{user?.name}</span>
            <button 
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button 
            className="nav-btn"
            onClick={() => handleNavigation('/signin')}
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
