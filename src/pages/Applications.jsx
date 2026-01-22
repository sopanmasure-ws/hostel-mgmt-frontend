import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { applicationAPI } from '../services/api';
import { NotificationContext } from '../components/NotificationContext';
import Layout from '../components/Layout';
import '../styles/applications.css';
import { formatDate } from '../utils/adminHelpers';

const Applications = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { showNotification } = useContext(NotificationContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Fetch applications from API using studentPNR
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        if (!user?.pnr) {
          // If no PNR, show empty state
          setApplications([]);
          setLoading(false);
          return;
        }

        const response = await applicationAPI.getMyApplications(user.pnr);
        
        // Handle different response formats
        let applicationsData = [];
        if (Array.isArray(response)) {
          applicationsData = response;
        } else if (response?.application && Array.isArray(response.application)) {
          applicationsData = response.application;
        } else if (response?.data && Array.isArray(response.data)) {
          applicationsData = response.data;
        }
        
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications:', error);
        showNotification(error.message || 'Failed to load applications', 'error');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isAuthenticated, user?.pnr, navigate, showNotification]);

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'accepted':
        return '✓';
      case 'rejected':
        return '✗';
      default:
        return '';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="applications-container">
          <div className="loading-message">Loading your applications...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="applications-container">
        <div className="applications-header">
          <h2>My Hostel Applications</h2>
          <p>Track the status of your hostel applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="no-applications">
            <p>You haven't submitted any applications yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/book-hostel')}
            >
              Book a Hostel
            </button>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="app-header">
                  <div>
                    <h3>{application.hostelName}</h3>
                    <p className="app-date">Applied on: {application.appliedDate}</p>
                  </div>
                  <div className={getStatusClass(application.status)}>
                    <span className="status-icon">{getStatusIcon(application.status)}</span>
                    <span className="status-text">{application.status.toUpperCase()}</span>
                  </div>
                </div>

                <div className="app-details">
                  <div className="detail-column">
                    <h4>Student Details</h4>
                    <div className="detail-item">
                      <span className="label">Year:</span>
                      <span className="value">{application.studentYear}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Branch:</span>
                      <span className="value">{application.branch}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Caste:</span>
                      <span className="value">{application.caste}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">DOB:</span>
                      <span className="value">{application.dateOfBirth}</span>
                    </div>
                  </div>

                  {application.status.toUpperCase() === 'APPROVED' && (
                    <div className="detail-column accepted-details">
                      <h4>Allocation Details</h4>
                      <div className="detail-item">
                        <span className="label">Room Number:</span>
                        <span className="value success">{application.roomNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Floor:</span>
                        <span className="value success">{application.floor}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Approved Date:</span>
                        <span className="value success">{formatDate(application.approvedOn)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Status:</span>
                        <span className="value success">{application.status.toUpperCase()}</span>
                      </div>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="detail-column rejected-details">
                      <h4>Rejection Details</h4>
                      <div className="detail-item">
                        <span className="label">Reason:</span>
                        <span className="value error">
                          {application.reason || 'No reason provided'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="applications-action">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Applications;
