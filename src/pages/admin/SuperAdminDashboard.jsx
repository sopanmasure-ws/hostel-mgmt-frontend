import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../component/NotificationContext';
import { superAdminAPI, apiTransformers, errorHandlers } from '../../lib/api';
import { cacheService } from '../../lib/services/cacheService';
import Layout from '../../layout/Layout';
import '../../styles/superadmin-dashboard.css';

/**
 * Super Admin Dashboard Component
 * Displays overview statistics and quick access to management sections
 * API Reference: SUPERADMIN_API_DOCS.md - Endpoint: GET /api/superadmin/dashboard/overview
 */
const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { showNotification } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAdmins: 0,
    totalHostels: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    blacklistedStudents: 0,
  });

  useEffect(() => {
    if (!adminAuth.isAuthenticated || adminAuth.role !== 'superadmin') {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    const cacheKey = 'superadmin_dashboard_stats';
    const cachedStats = cacheService.get(cacheKey, 'local');

    if (cachedStats) {
      setStats(cachedStats);
      setLoading(false);
      return;
    }

    // Fetch dashboard overview using API
    superAdminAPI
      .getDashboardOverview()
      .then((response) => {
        // Transform API response to local state structure
        const transformedStats = apiTransformers.transformDashboardOverview(response);
        setStats(transformedStats);
        // Cache for 5 minutes
        cacheService.set(cacheKey, transformedStats, 5 * 60 * 1000, 'local');
      })
      .catch((err) => {
        const errorMsg = errorHandlers.parseError(err);
        showNotification(errorMsg, 'error');
        // Set default stats on error
        setStats({
          totalStudents: 0,
          totalAdmins: 0,
          totalHostels: 0,
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          blacklistedStudents: 0,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adminAuth.isAuthenticated, adminAuth.role, navigate, showNotification]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    dispatch({ type: 'adminAuth/adminLogout' });
    cacheService.remove('superadmin_dashboard_stats', 'local');
    navigate('/admin/login');
    showNotification('Logged out successfully', 'success');
  };

  if (loading) {
    return (
      <Layout>
        <div className="superadmin-dashboard">
          <div className="loading">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="superadmin-dashboard">
        <div className="superadmin-header">
          <div className="header-top">
            <h1>Super Admin Dashboard</h1>
            <div className="header-actions">
              <span className="admin-name">
                Welcome, {adminAuth.admin?.name || 'Super Admin'}
              </span>
              <button className="btn btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon students">👥</div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <p className="stat-number">{stats.totalStudents}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon admins">👔</div>
            <div className="stat-content">
              <h3>Total Admins</h3>
              <p className="stat-number">{stats.totalAdmins}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon hostels">🏢</div>
            <div className="stat-content">
              <h3>Total Hostels</h3>
              <p className="stat-number">{stats.totalHostels}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rooms">🚪</div>
            <div className="stat-content">
              <h3>Total Rooms</h3>
              <p className="stat-number">{stats.totalRooms}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon occupied">✓</div>
            <div className="stat-content">
              <h3>Occupied Rooms</h3>
              <p className="stat-number">{stats.occupiedRooms}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon available">○</div>
            <div className="stat-content">
              <h3>Available Rooms</h3>
              <p className="stat-number">{stats.availableRooms}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-content">
              <h3>Pending Applications</h3>
              <p className="stat-number">{stats.pendingApplications}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">✅</div>
            <div className="stat-content">
              <h3>Approved Applications</h3>
              <p className="stat-number">{stats.approvedApplications}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rejected">❌</div>
            <div className="stat-content">
              <h3>Rejected Applications</h3>
              <p className="stat-number">{stats.rejectedApplications}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blacklist">🔒</div>
            <div className="stat-content">
              <h3>Blacklisted Students</h3>
              <p className="stat-number">{stats.blacklistedStudents}</p>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="management-sections">
          <div className="section-card students-section">
            <div className="section-header">
              <h2>👥 Student Management</h2>
              <p>View and manage all student data</p>
            </div>
            <ul className="action-list">
              <li>View all students</li>
              <li>Assign rooms to students</li>
              <li>Reject applications</li>
              <li>Blacklist/Unblacklist students</li>
            </ul>
            <button
              className="btn btn-primary"
              onClick={() => handleNavigate('/superadmin/students')}
            >
              Manage Students
            </button>
          </div>

          <div className="section-card admins-section">
            <div className="section-header">
              <h2>👔 Admin Management</h2>
              <p>View and manage admin accounts</p>
            </div>
            <ul className="action-list">
              <li>View all admins</li>
              <li>Create new admin</li>
              <li>Delete admin accounts</li>
              <li>Enable/Disable admins</li>
            </ul>
            <button
              className="btn btn-primary"
              onClick={() => handleNavigate('/superadmin/admins')}
            >
              Manage Admins
            </button>
          </div>

          <div className="section-card hostels-section">
            <div className="section-header">
              <h2>🏢 Hostel Management</h2>
              <p>View and manage all hostels</p>
            </div>
            <ul className="action-list">
              <li>View all hostels</li>
              <li>Create new hostel</li>
              <li>Delete hostels</li>
              <li>Enable/Disable hostels</li>
              <li>Change hostel admin</li>
              <li>Change room status</li>
            </ul>
            <button
              className="btn btn-primary"
              onClick={() => handleNavigate('/superadmin/hostels')}
            >
              Manage Hostels
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;
