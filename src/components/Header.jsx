import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { adminLogout } from '../redux/adminAuthSlice';
import { tokenService } from '../shared/services/tokenService';
import '../styles/header.css';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { isAuthenticated: adminIsAuthenticated, admin } = useSelector((state) => state.adminAuth);

  const handleLogout = () => {
    tokenService.removeStudentToken();
    dispatch(logout());
    navigate('/signin');
  };

  const handleAdminLogout = () => {
    tokenService.removeAdminToken();
    dispatch(adminLogout());
    navigate('/admin/login');
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
        
        {adminIsAuthenticated ? (
          <>
            <span className="admin-badge">👤 {admin?.adminId}</span>
            <button 
              className="nav-btn admin-panel-btn"
              onClick={() => handleNavigation('/admin/dashboard')}
            >
              Admin Panel
            </button>
            <button 
              className="nav-btn logout-btn"
              onClick={handleAdminLogout}
            >
              Admin Logout
            </button>
          </>
        ) : isAuthenticated ? (
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
          <>
            <button 
              className="nav-btn student-signin-btn"
              onClick={() => handleNavigation('/signin')}
            >
              Student
            </button>
            <button 
              className="nav-btn admin-login-btn"
              onClick={() => handleNavigation('/admin/login')}
            >
              Admin
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
