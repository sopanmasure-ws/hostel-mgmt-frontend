import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import '../styles/applications.css';

const Applications = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { applications } = useSelector((state) => state.application);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

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
                    <h4>Academic Details</h4>
                    <div className="detail-item">
                      <span className="label">Year:</span>
                      <span className="value">{application.year}</span>
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
                      <span className="value">{application.dob}</span>
                    </div>
                  </div>

                  {application.status === 'accepted' && (
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
          {applications.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/book-hostel')}
            >
              Apply to More Hostels
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Applications;
