import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { COLLEGE_INFO } from '../utils/data';
import Layout from '../components/Layout';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect to sign in if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Your Hostel Management Dashboard</p>
        </div>

        <div className="college-details">
          <h2>College Details</h2>
          <div className="details-card">
            <div className="detail-row">
              <span className="detail-label">College Name:</span>
              <span className="detail-value">{COLLEGE_INFO.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{COLLEGE_INFO.location}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Affiliation:</span>
              <span className="detail-value">{COLLEGE_INFO.affiliation}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Student ID:</span>
              <span className="detail-value">{user?.pnr}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-options">
          <h2>What would you like to do?</h2>
          <div className="options-grid">
            <div 
              className="option-card"
              onClick={() => navigate('/book-hostel')}
            >
              <div className="option-icon">🏨</div>
              <h3>Book Hostel</h3>
              <p>Browse available hostels and submit applications</p>
            </div>

            <div 
              className="option-card"
              onClick={() => navigate('/applications')}
            >
              <div className="option-icon">📋</div>
              <h3>My Applications</h3>
              <p>View and track your hostel applications</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
