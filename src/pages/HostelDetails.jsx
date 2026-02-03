import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../layout/Layout';
import '../styles/hostel-details.css';

// Constants
const ROUTES = {
  SIGNIN: '/signin',
  BOOK_HOSTEL: '/book-hostel',
  APPLICATION_FORM: '/application-form',
};

const LABELS = {
  ADMIN: 'Hostel Admin:',
  SEATS: 'Seats Remained:',
  RENT: 'Price per Month:',
  GENDER: 'Gender:',
  DOCS: 'Required Documents',
  INFO: 'Hostel Information',
};

const HostelDetails = () => {
  const navigate = useNavigate();
  const { hostelId } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { selectedHostel, hostels } = useSelector((state) => state.hostel);

  const hostel = selectedHostel || hostels?.find((h) => h._id === hostelId);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGNIN);
    }
  }, [isAuthenticated, navigate]);

  if (!hostel) {
    return (
      <Layout>
        <div className="hostel-not-found">
          <p>Hostel not found</p>
        </div>
      </Layout>
    );
  }

  const handleApply = () => {
    navigate(`${ROUTES.APPLICATION_FORM}/${hostel._id || hostel.id}`);
  };

  const handleBack = () => {
    navigate(ROUTES.BOOK_HOSTEL);
  };

  return (
    <Layout>
      <div className="hostel-details-container">
        <button className="back-btn" onClick={handleBack}>
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
              <h3>{LABELS.INFO}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">{LABELS.ADMIN}</span>
                  <span className="value">{hostel.warden}</span>
                </div>
                <div className="info-item">
                  <span className="label">{LABELS.SEATS}</span>
                  <span className="value">{hostel.availableRooms}</span>
                </div>
                <div className="info-item">
                  <span className="label">{LABELS.RENT}</span>
                  <span className="value">₹{hostel.rentPerMonth}</span>
                </div>
                <div className="info-item">
                  <span className="label">{LABELS.GENDER}</span>
                  <span className="value">{hostel.gender?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {hostel?.requiredDocs?.length > 0 && (
              <div className="docs-section">
                <h3>{LABELS.DOCS}</h3>
                <ul className="docs-list">
                  {hostel.requiredDocs.map((doc, index) => (
                    <li key={index}>
                      <span className="doc-icon">✓</span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn btn-primary apply-btn" onClick={handleApply}>
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HostelDetails;
