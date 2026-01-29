import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { tokenService } from '../shared/services/tokenService';
import Layout from '../components/Layout';
import { ROUTES, LABELS, FEATURES } from '../constants';
import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (tokenService.isStudentTokenValid()) {
      navigate(ROUTES.DASHBOARD);
    } else if (tokenService.isAdminTokenValid()) {
      navigate(ROUTES.ADMIN_DASHBOARD);
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>{LABELS.HOME_TITLE}</h1>
            <p>{LABELS.HOME_SUBTITLE}</p>

            {isAuthenticated ? (
              <button className="btn btn-primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
                {LABELS.GO_TO_DASHBOARD}
              </button>
            ) : (
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={() => navigate(ROUTES.SIGNIN)}>
                  {LABELS.SIGN_IN}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate(ROUTES.REGISTER)}>
                  {LABELS.REGISTER}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="features-section">
          <h2>Our Services</h2>
          <div className="features-grid">
            {FEATURES.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;