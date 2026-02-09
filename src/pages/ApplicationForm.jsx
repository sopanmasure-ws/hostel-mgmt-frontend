import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { NotificationContext } from '../component/NotificationContext';
import { BRANCHES, CASTE_CATEGORIES } from '../util/data';
import { applicationAPI } from '../lib/api';
import Layout from '../layout/Layout';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { hostelId } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { hostels, selectedHostel } = useSelector((state) => state.hostel);
  const { showNotification } = useContext(NotificationContext);
  
  const [formData, setFormData] = useState({
    hostelId: hostelId || null,
    caste: '',
    dob: '',
    branch: '',
    aadharCard: null,
    admissionReceipt: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [formReady, setFormReady] = useState(false);

  // Memoized: Find hostel only when hostels, hostelId, or selectedHostel changes
  const hostel = useMemo(() => {
    let found = null;
    if (hostelId) {
      found = hostels.find((h) => h._id === hostelId);
      if (!found && !isNaN(hostelId)) {
        found = hostels.find((h) => h.id === parseInt(hostelId));
      }
    } else if (selectedHostel) {
      found = selectedHostel;
    }
    return found;
  }, [hostelId, hostels, selectedHostel]);

  useEffect(() => {
    if (!isAuthenticated) {
      showNotification('Please sign in first', 'error');
      navigate('/signin');
      return;
    }

    if (!hostel) {
      showNotification('Hostel not found. Please select a valid hostel.', 'error');
      setTimeout(() => navigate('/book-hostel'), 1500);
      return;
    }

 

    const checkExistingApplication = async () => {
      try {
        if (!user?.pnr) {
          setFormReady(true);
          return;
        }
        
        const app = await applicationAPI.getApplicationsByPNR(user.pnr);
        if (app && app._id) {
          showNotification('You can only apply for one hostel. You already have an active application.', 'error');
          setTimeout(() => navigate('/applications'), 2000);
          return;
        }
        setFormReady(true);
      } catch (error) {
        // No existing applications found or PNR not available
        setFormReady(true);
      } finally {
        setChecking(false);
      }
    };

    checkExistingApplication();
  }, [isAuthenticated, navigate, showNotification, user, hostel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        showNotification('Only PDF files are allowed', 'error');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.caste || !formData.dob || !formData.branch || !formData.aadharCard || !formData.admissionReceipt) {
      const msg = 'Please fill in all required fields including documents';
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    // Check if DOB is valid
    const dob = new Date(formData.dob);
    if (isNaN(dob.getTime())) {
      const msg = 'Please enter a valid date of birth';
      setError(msg);
      showNotification(msg, 'error');
      return;
    }

    // Convert files to base64 strings
    setLoading(true);
    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    // Convert both files and submit
    Promise.all([
      fileToBase64(formData.aadharCard),
      fileToBase64(formData.admissionReceipt),
    ])
      .then(([aadharCardBase64, admissionReceiptBase64]) => {
        const applicationData = {
          hostelId: formData.hostelId,
          userId: user.id,
          studentPNR: user?.pnr || '',
          branch: formData.branch,
          caste: formData.caste,
          dateOfBirth: formData.dob,
          aadharCard: aadharCardBase64,
          admissionReceipt: admissionReceiptBase64,
        };

        return applicationAPI.submitApplication(applicationData);
      })
      .then((response) => {
        if (response.success || response._id) {
          const successMsg = `✅ Application submitted successfully for ${hostel?.name}!`;
          setSuccess(successMsg);
          showNotification(successMsg, 'success');
          setTimeout(() => {
            navigate('/applications');
          }, 1000);
        }
      })
      .catch((err) => {
        const msg = err.message || 'Failed to submit application. Please try again.';
        setError(msg);
        showNotification(msg, 'error');
      })
      .finally(() => setLoading(false));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (checking) {
    return (
      <Layout>
        <div className="application-form-container">
          <div className="loading-message">Loading hostel information...</div>
        </div>
      </Layout>
    );
  }

  if (!hostel) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">Hostel not found. Redirecting...</div>
        </div>
      </Layout>
    );
  }

  if (!formReady) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">Checking your application status...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary via-secondary to-tertiary text-white p-6">
            <h2 className="text-2xl font-bold">Hostel Application Form</h2>
            <p className="mt-2">Applying for: <strong>{hostel.name}</strong></p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={user?.name}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PNR Number</label>
                <input
                  type="text"
                  value={user?.pnr}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year in College</label>
                <input
                  type="text"
                  value={user?.year || 'N/A'}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Select Branch</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Other Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caste *</label>
                <select
                  name="caste"
                  value={formData.caste}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Select Caste Category</option>
                  {CASTE_CATEGORIES.map((caste) => (
                    <option key={caste} value={caste}>
                      {caste}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Document Upload (PDF Only)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card (PDF) *</label>
                <input
                  type="file"
                  name="aadharCard"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700"
                />
                {formData.aadharCard && (
                  <p className="text-green-600 text-sm mt-2">✓ {formData.aadharCard.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">College Admission Receipt (PDF) *</label>
                <input
                  type="file"
                  name="admissionReceipt"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700"
                />
                {formData.admissionReceipt && (
                  <p className="text-green-600 text-sm mt-2">✓ {formData.admissionReceipt.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => navigate('/book-hostel')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 px-4 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ApplicationForm;
