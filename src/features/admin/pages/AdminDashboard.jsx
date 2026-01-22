import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../components/NotificationContext';
import { setCurrentHostel, setAdminHostels } from '../../../redux/adminSlice';
import { adminHostelAPI } from '../../../services/api';
import { cacheService } from '../../../shared/services/cacheService';
import Layout from '../../../components/Layout';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { adminHostels } = useSelector((state) => state.admin);
  const { showNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    if (!adminAuth.isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    // Load admin hostels from cache or API
    setLoading(true);
    const adminId = adminAuth.admin?.adminId;
    
    if (!adminId) {
      showNotification('Admin ID not found', 'error');
      setLoading(false);
      return;
    }

    // Try to get from cache first
    const cacheKey = `admin_hostels_${adminId}`;
    const cachedHostels = cacheService.get(cacheKey, 'local');
    
    if (cachedHostels && cachedHostels.length > 0) {
      dispatch(setAdminHostels(cachedHostels));
      setLoading(false);
      return;
    }

    // Fetch from API
    adminHostelAPI
      .getAdminHostels(adminId)
      .then((response) => {
        const hostels = Array.isArray(response.data.hostels) ? response.data.hostels : [];
        dispatch(setAdminHostels(hostels));
        // Cache for 10 minutes
        cacheService.set(cacheKey, hostels, 10 * 60 * 1000, 'local');
      })
      .catch((err) => {
        showNotification(err.message || 'Failed to load hostels', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adminAuth.isAuthenticated, adminAuth.admin?.adminId, dispatch, navigate, showNotification]);

  const handleViewHostel = (hostel) => {
    dispatch(setCurrentHostel(hostel));
    navigate(`/admin/hostel/${hostel._id}`);
  };

  const handleLogout = () => {
    dispatch({ type: 'adminAuth/adminLogout' });
    navigate('/admin/login');
    showNotification('Logged out successfully', 'success');
  };

  if (loading) {
    return (
      <Layout>
        <div className="admin-dashboard">
          <div className="loading">Loading your hostels...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <div className="admin-welcome">
            <h1>Admin Dashboard</h1>
            <p>Welcome, {adminAuth.admin?.name || 'Admin'}</p>
          </div>
          <div className="admin-actions">
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{adminHostels.length}</h3>
            <p>Hostels Managed</p>
          </div>
          <div className="stat-card">
            <h3>{adminHostels.reduce((sum, h) => sum + h.capacity, 0)}</h3>
            <p>Total Rooms</p>
          </div>
          <div className="stat-card">
            <h3>{adminHostels.reduce((sum, h) => sum + h.availableRooms, 0)}</h3>
            <p>Available Rooms</p>
          </div>
          <div className="stat-card">
            <h3>{adminHostels.reduce((sum, h) => sum + h.pendingApplications, 0)}</h3>
            <p>Pending Applications</p>
          </div>
        </div>

        <div className="hostels-section">
          <h2>Your Hostels</h2>
          {adminHostels.length === 0 ? (
            <div className="no-data">
              <p>You are not managing any hostels yet.</p>
            </div>
          ) : (
            <div className="hostels-grid">
              {adminHostels.map((hostel) => (
                <div key={hostel.id} className="hostel-card">
                  <div className="hostel-image">
                    <img src={hostel.image} alt={hostel.name} />
                  </div>
                  <div className="hostel-info">
                    <h3>{hostel.name}</h3>
                    <p className="location">{hostel.location}</p>
                    <div className="hostel-stats">
                      <div className="stat">
                        <span className="label">Total Rooms:</span>
                        <span className="value">{hostel.capacity}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Filled:</span>
                        <span className="value filled">{hostel.capacity - hostel.availableRooms}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Available:</span>
                        <span className="value available">{hostel.availableRooms}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Pending Apps:</span>
                        <span className="value pending">{hostel.pendingApplications}</span>
                      </div>
                    </div>
                    <div className="hostel-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleViewHostel(hostel)}
                      >
                        Manage Applications
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/admin/hostel/${hostel._id}/inventory`)}
                      >
                        View Inventory
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
