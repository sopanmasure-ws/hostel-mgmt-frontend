import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../components/NotificationContext';
import { loginSuccess } from '../redux/authSlice';
import { authAPI } from '../services/api';
import Layout from '../components/Layout';
import '../styles/auth.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useContext(NotificationContext);

  const handleSignIn = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      const msg = 'Please fill in all fields';
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    // Call backend API
    setLoading(true);
    authAPI.login({
      email: email,
      password: password,
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
          showNotification(`✅ Welcome back, ${response.user?.name}!`, 'success');
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      })
      .catch((err) => {
        const msg = err.message || 'Invalid credentials. Please check your email/PNR and password.';
        setError(msg);
        showNotification(msg, 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-form-wrapper">
          <h2>Student Sign In</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSignIn} className="auth-form">
            <div className="form-group">
              <label>Email or PNR Number</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or PNR"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="link">Register here</Link></p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
