import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { NotificationContext } from '../../../component/NotificationContext';
import { adminRegisterSuccess } from '../../../store/adminAuthSlice';
import { adminAuthAPI } from '../../../lib/api';
import Layout from '../../../layout/Layout';
import type { NotificationContextType } from '../../../types';

type AdminSignUpForm = {
  name: string;
  email: string;
  adminId: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const AdminSignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    adminId: '',
    phone: '',
    password: '',
    confirmPassword: '',
  } as AdminSignUpForm);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notificationContext = useContext(NotificationContext) as NotificationContextType | undefined;
  const showNotification = notificationContext?.showNotification || (() => {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
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

  const handleSignUp = (e: React.FormEvent) => {
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
        const msg = err instanceof Error ? err.message : 'Registration failed';
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
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Sign Up</h2>
            <p className="mt-2 text-sm text-gray-600">Create your admin account</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-xl">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-150 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-150 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">Admin ID</label>
                  <input
                    type="text"
                    id="adminId"
                    name="adminId"
                    value={formData.adminId}
                    onChange={handleChange}
                    placeholder="Create an Admin ID"
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-150 disabled:bg-gray-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number (e.g., +91-9876543210)"
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-150 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-150 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-150 disabled:bg-gray-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/admin/login" className="font-medium text-purple-600 hover:text-purple-700 transition-colors">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSignUp;
