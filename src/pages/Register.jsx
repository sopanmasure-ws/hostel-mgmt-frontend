import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../components/NotificationContext';
import { loginSuccess } from '../redux/authSlice';
import { isPasswordValid, getPasswordErrorMessage } from '../utils/validation';
import { GENDERS, COLLEGE_YEARS } from '../utils/data';
import { authAPI } from '../services/api';
import Layout from '../components/Layout';
import '../styles/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    pnr: '',
    email: '',
    gender: '',
    year: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
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

    // Check password requirements as user types
    if (name === 'password') {
      if (value.length > 0) {
        const errors = getPasswordErrorMessage(value);
        setPasswordErrors(errors);
      } else {
        setPasswordErrors([]);
      }
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.pnr || !formData.email || !formData.gender || !formData.year || !formData.password) {
      const msg = 'Please fill in all fields';
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      const msg = 'Please enter a valid email address';
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    // Password validation
    if (!isPasswordValid(formData.password)) {
      const msg = 'Password does not meet the required criteria';
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    // Call backend API
    setLoading(true);
    authAPI.register({
      name: formData.name,
      email: formData.email,
      pnr: formData.pnr,
      password: formData.password,
      gender: formData.gender,
      year: formData.year,
    })
      .then((response) => {
        if (response.success || response.token) {
          // Update Redux with user data
          dispatch(loginSuccess({
            id: response.user?.id,
            name: response.user?.name,
            email: response.user?.email,
            pnr: response.user?.pnr,
            gender: response.user?.gender,
            year: response.user?.year,
          }));
          showNotification(`🎉 Welcome ${formData.name}! Registration successful!`, 'success');
          setTimeout(() => navigate('/signin'), 2000);
        }
      })
      .catch((err) => {
        const msg = err.message || 'Registration failed. Please try again.';
        setError(msg);
        showNotification(msg, 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-form-wrapper register-wrapper">
          <h2>Student Registration</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>PNR Number</label>
              <input
                type="text"
                name="pnr"
                value={formData.pnr}
                onChange={handleChange}
                placeholder="Enter your PNR number"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Gender</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>College Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Year</option>
                {COLLEGE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="form-input"
              />
              {passwordErrors.length > 0 && (
                <div className="password-requirements">
                  <p className="req-title">Password must include:</p>
                  <ul>
                    {passwordErrors.map((error, idx) => (
                      <li key={idx} className="req-error">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="form-input"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={passwordErrors.length > 0 && formData.password.length > 0 || loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/signin" className="link">Sign In</Link></p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
