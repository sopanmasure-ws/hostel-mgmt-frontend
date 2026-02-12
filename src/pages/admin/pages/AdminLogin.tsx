import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../../../component/NotificationContext';
import { adminLoginSuccess } from '../../../store/adminAuthSlice';
import { adminAuthAPI } from '../../../lib/api';
import { cacheService } from '../../../lib/services/cacheService';
import { tokenService } from '../../../lib/services/tokenService';
import Layout from '../../../layout/Layout';
import type { NotificationContextType } from '../../../types';

const AdminLogin: React.FC = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notificationContext = useContext(NotificationContext) as NotificationContextType | undefined;
  const showNotification = notificationContext?.showNotification || (() => {});

  useEffect(() => {
    if (tokenService.isAdminTokenValid()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminId || !password) {
      const msg = 'Please fill in all fields';
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    setLoading(true);
    adminAuthAPI
      .login({
        adminId: adminId,
        password: password,
      })
      .then((response: any) => {
        // Debug: Log the response to check structure
        console.log('Admin Login Response:', response);
        
        const role = response.data.admin?.role || response.data.role || 'admin'; // Default to admin if role not provided
        const admin = {
          id: response.data.admin.adminId || response._id,
          email: response.data.admin.email,
          adminId: response.data.admin.adminId,
          name: response.data.admin.name,
          token: response.data.admin.token,
          role: role, // Ensure role is included
        };

        // Dispatch with both admin and role
        dispatch(adminLoginSuccess({ admin, role }));
        
        if (response.data.admin.token || response.data.token) {
          const token = response.data.admin.token || response.data.token;
          console.log('Storing admin token:', token);
          tokenService.setAdminToken(token, response.data.expiryTime);
          console.log('Admin token stored. Verifying:', tokenService.getAdminToken());
        } else {
          console.warn('No admin token in response!');
        }
        
        // Save admin user with role included
        tokenService.setAdminUser(admin);
        cacheService.set('adminUser', admin, 30 * 60 * 1000, 'local');
        
        // Route based on role - check both lowercase and uppercase
        if (role === 'superadmin' || role === 'SUPERADMIN') {
          showNotification('Welcome back, Super Admin!', 'success');
          setTimeout(() => navigate('/superadmin/dashboard'), 1000);
        } else {
          showNotification('Welcome back, Admin!', 'success');
          setTimeout(() => navigate('/admin/dashboard'), 1000);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Login failed';
        setError(msg);
        showNotification(msg, 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-sm text-gray-600">Access the admin dashboard</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-xl">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">Admin ID</label>
                <input
                  type="text"
                  id="adminId"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter your Admin ID"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-150 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-150 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/admin/signup" className="font-medium text-purple-600 hover:text-purple-700 transition-colors">
                  Sign up as Admin
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
