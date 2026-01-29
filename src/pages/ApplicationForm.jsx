import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { NotificationContext } from '../components/NotificationContext';
import { BRANCHES, CASTE_CATEGORIES } from '../utils/data';
import { applicationAPI } from '../services/api';
import Layout from '../components/Layout';
import '../styles/application-form.css';

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
        
        const response = await applicationAPI.getApplicationsByPNR(user.pnr);
        if (response?.application && response.application.length > 0) {
          showNotification('You can only apply for one hostel. You already have an active application.', 'error');
          setTimeout(() => navigate('/applications'), 2000);
          return;
        }
        setFormReady(true);
      } catch (error) {
        console.log('No existing applications found or PNR not available');
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
        <div className="application-form-container">
          <div className="error-message">Hostel not found. Redirecting...</div>
        </div>
      </Layout>
    );
  }

  if (!formReady) {
    return (
      <Layout>
        <div className="application-form-container">
          <div className="loading-message">Checking your application status...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="application-form-container">
        <div className="form-header">
          <h2>Hostel Application Form</h2>
          <p>Applying for: <strong>{hostel.name}</strong></p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={user?.name}
                  disabled
                  className="form-input disabled"
                />
              </div>
              <div className="form-group">
                <label>PNR Number</label>
                <input
                  type="text"
                  value={user?.pnr}
                  disabled
                  className="form-input disabled"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="form-input disabled"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Academic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Year in College</label>
                <input
                  type="text"
                  value={user?.year || 'N/A'}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-group">
                <label>Branch *</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="form-input"
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

          <div className="form-section">
            <h3>Other Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Caste *</label>
                <select
                  name="caste"
                  value={formData.caste}
                  onChange={handleChange}
                  className="form-input"
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

          <div className="form-section">
            <h3>Document Upload (PDF Only)</h3>
            <div className="form-group">
              <label>Aadhar Card (PDF) *</label>
              <input
                type="file"
                name="aadharCard"
                accept=".pdf"
                onChange={handleFileChange}
                className="form-input"
              />
              {formData.aadharCard && (
                <p className="file-selected">✓ {formData.aadharCard.name}</p>
              )}
            </div>

            <div className="form-group">
              <label>College Admission Receipt (PDF) *</label>
              <input
                type="file"
                name="admissionReceipt"
                accept=".pdf"
                onChange={handleFileChange}
                className="form-input"
              />
              {formData.admissionReceipt && (
                <p className="file-selected">✓ {formData.admissionReceipt.name}</p>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/book-hostel')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ApplicationForm;
