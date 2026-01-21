import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Layout>
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Hostel Management System</h1>
            <p>Find and Book Your Perfect Hostel</p>
            {!isAuthenticated && (
              <div className="hero-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </div>
            )}
            {isAuthenticated && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>

        <div className="features-section">
          <h2>Our Services</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏨</div>
              <h3>Browse Hostels</h3>
              <p>Explore available hostels filtered by your preferences</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Easy Application</h3>
              <p>Submit hostel applications with just a few clicks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Track Status</h3>
              <p>Monitor your applications in real-time</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure</h3>
              <p>Your data is safe and secure with us</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
