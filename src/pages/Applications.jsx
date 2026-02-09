import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { applicationAPI } from '../lib/api';
import { NotificationContext } from '../component/NotificationContext';
import Layout from '../layout/Layout';
import '../styles/applications.css';
import { formatDate } from '../util/adminHelpers';

const Applications = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { hostels } = useSelector((state) => state.hostel);
  const { showNotification } = useContext(NotificationContext);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);

        if (!user?.pnr) {
          setApplications([]);
          return;
        }

        const response = await applicationAPI.getMyApplications(user.pnr);

        let applicationsData = [];
        if (Array.isArray(response)) {
          applicationsData = response;
        } else if (response?.application ) {
          applicationsData = response.application;
        } else if (response?.data ) {
          applicationsData = response.data;
        }

        setApplications([applicationsData]);
      } catch (error) {
        console.error(error);
        showNotification(error.message || 'Failed to load applications', 'error');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isAuthenticated, user?.pnr, navigate, showNotification]);

  const hostelMap = useMemo(() => {
    const map = {};
    hostels?.forEach((hostel) => {
      map[hostel._id] = hostel;
    });
    return map;
  }, [hostels]);
  const statusConfig = useMemo(
    () => ({
      getStatusClass: (status) => `status-badge status-${status}`,
      getStatusIcon: (status) => {
        const icons = {
          pending: '⏳',
          approved: '✓',
          rejected: '✗',
        };
        return icons[status] || '';
      },
    }),
    []
  );

  if (!isAuthenticated) return null;

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
            {applications.map((application) => {
              const hostel = hostelMap[application?.hostelId];

              return (
                <div key={application.id} className="application-card">
                  <div className="app-header">
                    <div>
                      <h3>{application?.hostelId?.name || 'Hostel'}</h3>
                      <p className="app-date">
                        Applied on: {formatDate(application.appliedOn)}
                      </p>
                    </div>

                    <div className={statusConfig.getStatusClass(application.status)}>
                      <span className="status-icon">
                        {statusConfig.getStatusIcon(application.status)}
                      </span>
                      <span className="status-text">
                        {application.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="app-details">
                    <div className="detail-column">
                      <h4>Student & Application Details</h4>

                      <div className="detail-item">
                        <span className="label">Hostel Name:</span>
                        <span className="value">{application?.hostelId?.name|| 'N/A'}</span>
                      </div>

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
                      <div className="detail-item">
                        <span className="label">Room No:</span>
                        <span className="value">{application.roomNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Floor:</span>
                        <span className="value">{application.floor}</span>
                      </div>
                    </div>

                    {application.status === 'approved' && (
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
                          <span className="value success">
                            {formatDate(application.approvedOn)}
                          </span>
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
              );
            })}
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
