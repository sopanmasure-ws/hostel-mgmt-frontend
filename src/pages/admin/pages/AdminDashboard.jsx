import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../component/NotificationContext';
import { setCurrentHostel, setAdminHostels } from '../../../store/adminSlice';
import { adminHostelAPI } from '../../../lib/api';
import { cacheService } from '../../../lib/services/cacheService';
import Pagination from '../../../component/Pagination';
import Layout from '../../../layout/Layout';
import '../../../styles/admin-dashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { adminHostels } = useSelector((state) => state.admin);
  const { showNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    if (!adminAuth.isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    const adminId = adminAuth.admin?.adminId;
    
    if (!adminId) {
      showNotification('Admin ID not found', 'error');
      setLoading(false);
      return;
    }

    const cacheKey = `admin_hostels_${adminId}`;
    const cachedHostels = cacheService.get(cacheKey, 'local');
    
    if (cachedHostels && cachedHostels.length > 0) {
      dispatch(setAdminHostels(cachedHostels));
      setLoading(false);
      return;
    }

    adminHostelAPI
      .getAdminHostels(adminId)
      .then((response) => {
        const hostels = Array.isArray(response.data.hostels) ? response.data.hostels : [];
        dispatch(setAdminHostels(hostels));
        cacheService.set(cacheKey, hostels, 10 * 60 * 1000, 'local');
      })
      .catch((err) => {
        showNotification(err.message || 'Failed to load hostels', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adminAuth.isAuthenticated, adminAuth.admin?.adminId, dispatch, navigate, showNotification]);

  const totalPages = Math.max(1, Math.ceil(adminHostels.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const pagedHostels = useMemo(() => {
    const start = (page - 1) * pageSize;
    return adminHostels.slice(start, start + pageSize);
  }, [adminHostels, page, pageSize]);

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
            <>
              <div className="hostels-grid">
                {pagedHostels.map((hostel) => (
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

              {adminHostels.length > pageSize && (
                <Pagination
                  totalItems={adminHostels.length}
                  currentPage={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[6, 12, 24]}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
