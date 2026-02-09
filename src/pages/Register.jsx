import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../component/NotificationContext';
import { loginSuccess } from '../store/authSlice';
import { isPasswordValid, getPasswordErrorMessage, isEmailValid } from '../util/validation';
import { GENDERS, COLLEGE_YEARS } from '../util/data';
import { authAPI } from '../lib/api';
import { tokenService } from '../lib/services/tokenService';
import { ROUTES, LABELS, DELAYS, ERROR_MESSAGES, ACADEMIC_YEARS } from '../config';
import Layout from '../layout/Layout';

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
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">{LABELS.STUDENT_REGISTER}</h2>
            <p className="mt-2 text-sm text-gray-600">Create your student account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PNR Number</label>
                <input
                  type="text"
                  name="pnr"
                  value={formData.pnr}
                  onChange={handleChange}
                  placeholder="Enter your PNR number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-150"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{LABELS.GENDER}</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-150 bg-white"
                >
                  <option value="">Select Gender</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">College Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-150 bg-white"
                >
                  <option value="">Select Year</option>
                  {COLLEGE_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{LABELS.PASSWORD}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-150"
                />
                {passwordErrors.length > 0 && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Password must include:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordErrors.map((error, idx) => (
                        <li key={idx} className="text-sm text-yellow-700">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{LABELS.CONFIRM_PASSWORD}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-150"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              disabled={isSubmitDisabled}
            >
              {loading ? 'Registering...' : LABELS.REGISTER}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to={ROUTES.SIGNIN} className="font-medium text-primary hover:text-primary-hover transition-colors">
                  {LABELS.SIGN_IN}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
