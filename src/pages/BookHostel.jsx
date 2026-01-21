import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectHostel } from '../redux/hostelSlice';
import { NotificationContext } from '../components/NotificationContext';
import { hostelAPI } from '../services/api';
import Layout from '../components/Layout';
import '../styles/hostel.css';

const BookHostel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { showNotification } = useContext(NotificationContext);
  const [filteredHostels, setFilteredHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Fetch hostels from backend API
    const fetchHostels = async () => {
      try {
        setLoading(true);
        const response = await hostelAPI.getAllHostels();
        console.log('API response:', response);
        if (response.hostels) {
          console.log('Fetched hostels:', response.hostels);
          // Filter by user's gender
          if (user?.gender) {
            console.log('Filtering hostels for gender:', user.gender);
            const filtered = response.hostels.filter(
              (h) => h.gender === user.gender || h.gender === 'Co-ed'
            );
            setFilteredHostels(filtered);
            console.log('Filtered hostels:', filtered);
          }
        }
      } catch (error) {
        showNotification(error.message || 'Failed to load hostels', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.gender) {
      fetchHostels();
    }
  }, [user, isAuthenticated, showNotification]);

  const handleSelectHostel = (hostelId) => {
    dispatch(selectHostel(hostelId));
    navigate(`/hostel-details/${hostelId}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="hostel-list-container">
          <div className="loading-message">Loading hostels...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="hostel-list-container">
        <div className="hostel-list-header">
          <h2>Available Hostels for {user?.gender?.toUpperCase()}</h2>
          <p>Select a hostel to view details and apply</p>
        </div>

        {filteredHostels.length === 0 ? (
          <div className="no-hostels">
            <p>No hostels available for your gender at the moment.</p>
          </div>
        ) : (
          <div className="hostels-grid">
            {filteredHostels.map((hostel) => (
                  <div key={hostel._id} className="hostel-card">
                    <div className="hostel-image">
                      <img src={hostel.image} alt={hostel.name} />
                    </div>
                    <div className="hostel-info">
                      <h3>{hostel.name}</h3>
                      <p className="hostel-admin">
                        <strong>Warden:</strong> {hostel.warden}
                      </p>
                      <p className="hostel-description">{hostel.description}</p>
                      <div className="hostel-details">
                        <span className="detail">
                          <strong>Available Rooms:</strong> {hostel.availableRooms}
                        </span>
                        <span className="detail">
                          <strong>Price/Month:</strong> ₹{hostel.rentPerMonth}
                        </span>
                      </div>
                      <button
                        className="btn btn-primary view-btn"
                        onClick={() => {
                          dispatch(selectHostel(hostel._id));
                          navigate(`/hostel-details/${hostel._id}`);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
            }
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookHostel;
