import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../component/NotificationContext';
import { loginSuccess } from '../store/authSlice';
import { authAPI } from '../lib/api';
import { tokenService } from '../lib/services/tokenService';
import { ROUTES, LABELS, DELAYS, ERROR_MESSAGES } from '../config';
import Layout from '../layout/Layout';

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
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">{LABELS.STUDENT_SIGNIN}</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to access your hostel dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{LABELS.EMAIL_OR_PNR}</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or PNR"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{LABELS.PASSWORD}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-150"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg" 
              disabled={loading}
            >
              {loading ? 'Signing In...' : LABELS.SIGN_IN}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:text-primary-hover transition-colors">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
