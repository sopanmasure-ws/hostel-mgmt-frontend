import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../../../components/NotificationContext';
import { adminRegisterSuccess } from '../../../redux/adminAuthSlice';
import { adminAuthAPI } from '../../../services/api';
import { cacheService } from '../../../shared/services/cacheService';
import Layout from '../../../components/Layout';
import '../styles/admin-auth.css';

const AdminSignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    adminId: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useContext(NotificationContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.adminId || !formData.phone || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }

    if (formData.name.length < 3) {
      return 'Name must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    if (formData.adminId.length < 3) {
      return 'Admin ID must be at least 3 characters';
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      return 'Phone number must be valid (at least 10 digits)';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      showNotification(validationError, 'error');
      return;
    }

    setLoading(true);
    adminAuthAPI
      .register({
        name: formData.name,
        email: formData.email,
        adminId: formData.adminId,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })
      .then((response) => {
        const admin = {
          email: response.email,
          adminId: response.adminId,
          id: response._id || response.id,
          name: response.name,
        };

        dispatch(adminRegisterSuccess(admin));
        showNotification('Admin account created successfully! Please login.', 'success');
        setTimeout(() => navigate('/admin/login'), 1500);
      })
      .catch((err) => {
        const msg = err.message || 'Registration failed';
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
          <h2>Admin Sign Up</h2>
          <form onSubmit={handleSignUp}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminId">Admin ID</label>
              <input
                type="text"
                id="adminId"
                name="adminId"
                value={formData.adminId}
                onChange={handleChange}
                placeholder="Create an Admin ID"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number (e.g., +91-9876543210)"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account?{' '}
            <Link to="/admin/login">Login here</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSignUp;
