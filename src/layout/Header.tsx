import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { adminLogout } from '../store/adminAuthSlice';
import { tokenService } from '../lib/services/tokenService';
import type { RootState } from '../types';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated: adminIsAuthenticated, admin } = useSelector((state: RootState) => state.adminAuth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    tokenService.removeStudentToken();
    dispatch(logout());
    navigate('/signin');
    setMobileMenuOpen(false);
  };

  const handleAdminLogout = () => {
    tokenService.removeAdminToken();
    dispatch(adminLogout());
    navigate('/admin/login');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
            <span className="text-3xl">🏛️</span>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Hostel Management</h1>
            <h1 className="text-lg font-bold text-gray-800 sm:hidden">Hostel</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-150"
              onClick={() => handleNavigation('/')}
            >
              Home
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-150"
              onClick={() => handleNavigation('/about')}
            >
              About
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-150"
              onClick={() => handleNavigation('/contact')}
            >
              Contact
            </button>
            
            {adminIsAuthenticated ? (
              <>
                <span className="px-3 py-1.5 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">👤 {admin?.adminId}</span>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-150"
                  onClick={() => handleNavigation('/admin/dashboard')}
                >
                  Admin Panel
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-150"
                  onClick={handleAdminLogout}
                >
                  Logout
                </button>
              </>
            ) : isAuthenticated ? (
              <>
                <span className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">{user?.name}</span>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-150"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors duration-150"
                  onClick={() => handleNavigation('/signin')}
                >
                  Student
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-150"
                  onClick={() => handleNavigation('/admin/login')}
                >
                  Admin
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              <button 
                className="px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-150"
                onClick={() => handleNavigation('/')}
              >
                Home
              </button>
              <button 
                className="px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-150"
                onClick={() => handleNavigation('/about')}
              >
                About
              </button>
              <button 
                className="px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-150"
                onClick={() => handleNavigation('/contact')}
              >
                Contact
              </button>
              
              {adminIsAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium bg-purple-100 text-purple-700 rounded-md">👤 {admin?.adminId}</div>
                  <button 
                    className="px-4 py-2 text-left text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-150"
                    onClick={() => handleNavigation('/admin/dashboard')}
                  >
                    Admin Panel
                  </button>
                  <button 
                    className="px-4 py-2 text-left text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-150"
                    onClick={handleAdminLogout}
                  >
                    Logout
                  </button>
                </>
              ) : isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">{user?.name}</div>
                  <button 
                    className="px-4 py-2 text-left text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-150"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="px-4 py-2 text-left text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors duration-150"
                    onClick={() => handleNavigation('/signin')}
                  >
                    Student Login
                  </button>
                  <button 
                    className="px-4 py-2 text-left text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-150"
                    onClick={() => handleNavigation('/admin/login')}
                  >
                    Admin Login
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
