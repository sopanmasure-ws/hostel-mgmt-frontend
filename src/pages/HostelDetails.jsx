import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import '../styles/hostel-details.css';

const HostelDetails = () => {
  const navigate = useNavigate();
  const { hostelId } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { selectedHostel, hostels } = useSelector((state) => state.hostel);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const hostel = selectedHostel || hostels.find((h) => h.id === parseInt(hostelId));

  if (!hostel) {
    return (
      <Layout>
        <div className="hostel-not-found">
          <p>Hostel not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="hostel-details-container">
        <button className="back-btn" onClick={() => navigate('/book-hostel')}>
          ← Back to Hostels
        </button>

        <div className="details-content">
          <div className="details-image">
            <img src={hostel.image} alt={hostel.name} />
          </div>

          <div className="details-info">
            <h1>{hostel.name}</h1>
            <p className="description">{hostel.description}</p>

            <div className="info-section">
              <h3>Hostel Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Hostel Admin:</span>
                  <span className="value">{hostel.admin}</span>
                </div>
                <div className="info-item">
                  <span className="label">Seats Remained:</span>
                  <span className="value">{hostel.seatsRemained}</span>
                </div>
                <div className="info-item">
                  <span className="label">Price per Month:</span>
                  <span className="value">₹{hostel.pricePerMonth}</span>
                </div>
                <div className="info-item">
                  <span className="label">Gender:</span>
                  <span className="value">{hostel.gender.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="docs-section">
              <h3>Required Documents</h3>
              <ul className="docs-list">
                {hostel.requiredDocs.map((doc, index) => (
                  <li key={index}>
                    <span className="doc-icon">✓</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn btn-primary apply-btn"
              onClick={() => navigate(`/application-form/${hostel.id}`)}
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HostelDetails;
