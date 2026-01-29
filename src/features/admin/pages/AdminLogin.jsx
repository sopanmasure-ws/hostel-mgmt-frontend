import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../../../components/NotificationContext';
import { adminLoginSuccess } from '../../../redux/adminAuthSlice';
import { adminAuthAPI } from '../../../services/api';
import { cacheService } from '../../../shared/services/cacheService';
import { tokenService } from '../../../shared/services/tokenService';
import Layout from '../../../components/Layout';
import '../styles/admin-auth.css';

const AdminLogin = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    if (tokenService.isAdminTokenValid()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e) => {
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
      .then((response) => {
        const admin = {
          id: response.data.admin.adminId || response._id,
          email: response.data.admin.email,
          adminId: response.data.admin.adminId,
          name: response.data.admin.name,
          token: response.data.admin.token,
        };

        dispatch(adminLoginSuccess(admin));
        
        if (response.data.admin.token || response.data.token) {
          const token = response.data.admin.token || response.data.token;
          tokenService.setAdminToken(token, response.data.expiryTime);
        }
        tokenService.setAdminUser(admin);
        
        cacheService.set('adminUser', admin, 30 * 60 * 1000, 'local');
        
        showNotification('Welcome back, Admin!', 'success');
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      })
      .catch((err) => {
        const msg = err.message || 'Login failed';
        setError(msg);
        showNotification(msg, 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Layout>
      <div className="admin-auth-container">
        <div className="admin-auth-card">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="adminId">Admin ID</label>
              <input
                type="text"
                id="adminId"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter your Admin ID"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account?{' '}
            <Link to="/admin/signup">Sign up as Admin</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
