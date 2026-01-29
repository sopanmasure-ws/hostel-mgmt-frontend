import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../components/NotificationContext';
import { loginSuccess } from '../redux/authSlice';
import { authAPI } from '../services/api';
import { tokenService } from '../shared/services/tokenService';
import { ROUTES, LABELS, DELAYS, ERROR_MESSAGES } from '../constants';
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

  // Redirect if already logged in
  useEffect(() => {
    if (tokenService.isStudentTokenValid() || tokenService.isAdminTokenValid()) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [navigate]);

  const validateForm = () => {
    if (!email || !password) {
      const msg = ERROR_MESSAGES.FILL_ALL_FIELDS;
      setError(msg);
      showNotification(msg, 'error');
      return false;
    }
    return true;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });

      if (response.success || response.token) {
        const userData = {
          id: response.user?.id,
          name: response.user?.name,
          email: response.user?.email,
          pnr: response.user?.pnr,
          gender: response.user?.gender,
          year: response.user?.year,
        };

        // Store token and user data
        if (response.token) {
          tokenService.setStudentToken(response.token, response.expiryTime);
        }
        tokenService.setStudentUser(userData);

        // Update Redux
        dispatch(loginSuccess(userData));
        
        showNotification(`${LABELS.WELCOME}, ${response.user?.name}!`, 'success');
        setTimeout(() => navigate(ROUTES.DASHBOARD), DELAYS.REDIRECT);
      }
    } catch (err) {
      const msg = err.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-form-wrapper">
          <h2>{LABELS.STUDENT_SIGNIN}</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSignIn} className="auth-form">
            <div className="form-group">
              <label>{LABELS.EMAIL_OR_PNR}</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or PNR"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{LABELS.PASSWORD}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing In...' : LABELS.SIGN_IN}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
