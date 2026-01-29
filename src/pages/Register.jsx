import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../components/NotificationContext';
import { loginSuccess } from '../redux/authSlice';
import { isPasswordValid, getPasswordErrorMessage, isEmailValid } from '../utils/validation';
import { GENDERS, COLLEGE_YEARS } from '../utils/data';
import { authAPI } from '../services/api';
import { tokenService } from '../shared/services/tokenService';
import { ROUTES, LABELS, DELAYS, ERROR_MESSAGES, ACADEMIC_YEARS } from '../constants';
import Layout from '../components/Layout';
import '../styles/auth.css';

const INITIAL_FORM_STATE = {
  name: '',
  pnr: '',
  email: '',
  gender: '',
  year: '',
  password: '',
  confirmPassword: '',
};

const Register = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    if (tokenService.isStudentTokenValid() || tokenService.isAdminTokenValid()) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password' && value.length > 0) {
      const errors = getPasswordErrorMessage(value);
      setPasswordErrors(errors);
    } else if (name === 'password') {
      setPasswordErrors([]);
    }
  };

  const validateForm = () => {
    if (!Object.values(formData).every((val) => val.trim())) {
      const msg = ERROR_MESSAGES.FILL_ALL_FIELDS;
      setError(msg);
      showNotification(msg, 'error');
      return false;
    }

    if (!isEmailValid(formData.email)) {
      const msg = 'Please enter a valid email address';
      setError(msg);
      showNotification(msg, 'error');
      return false;
    }

    if (!isPasswordValid(formData.password)) {
      const msg = 'Password does not meet the required criteria';
      setError(msg);
      showNotification(msg, 'error');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      showNotification(msg, 'error');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        pnr: formData.pnr,
        password: formData.password,
        gender: formData.gender,
        year: formData.year,
      });

      if (response.success || response.token) {
        const userData = {
          id: response.user?.id,
          name: response.user?.name,
          email: response.user?.email,
          pnr: response.user?.pnr,
          gender: response.user?.gender,
          year: response.user?.year,
        };

        if (response.token) {
          tokenService.setStudentToken(response.token, response.expiryTime);
        }
        tokenService.setStudentUser(userData);
        dispatch(loginSuccess(userData));

        showNotification(
          `${LABELS.SUCCESS}! ${formData.name}, welcome!`,
          'success'
        );
        setTimeout(() => navigate(ROUTES.DASHBOARD), DELAYS.REDIRECT);
      }
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    (passwordErrors.length > 0 && formData.password.length > 0) || loading;

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-form-wrapper register-wrapper">
          <h2>{LABELS.STUDENT_REGISTER}</h2>

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
              <label>{LABELS.GENDER}</label>
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
              <label>{LABELS.PASSWORD}</label>
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
                      <li key={idx} className="req-error">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>{LABELS.CONFIRM_PASSWORD}</label>
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
              disabled={isSubmitDisabled}
            >
              {loading ? 'Registering...' : LABELS.REGISTER}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to={ROUTES.SIGNIN} className="link">
                {LABELS.SIGN_IN}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
