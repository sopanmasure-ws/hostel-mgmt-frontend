/**
 * SuperAdminAdmins Component
 * Manages all admin accounts in the system
 * Operations: Create Admin, Delete Admin, Disable/Enable Admin
 * API Integration: Uses /api/superadmin/admins/* endpoints
 */
import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../component/NotificationContext';
import { superAdminAPI, apiTransformers, requestPayloads, errorHandlers } from '../../../lib/api';
import { cacheService } from '../../../lib/services/cacheService';
import Pagination from '../../../component/Pagination';
import Layout from '../../../layout/Layout';
import '../../../styles/superadmin-admins.css';

const SuperAdminAdmins = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { showNotification } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [adminHostels, setAdminHostels] = useState([]);
  const [hostelReassignments, setHostelReassignments] = useState({});
  const [allAdminsForReassign, setAllAdminsForReassign] = useState([]);

  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    adminId: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [disableReason, setDisableReason] = useState('');

  useEffect(() => {
    if (!adminAuth.isAuthenticated || adminAuth.role !== 'superadmin') {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    const cacheKey = 'superadmin_all_admins';
    const cachedAdmins = cacheService.get(cacheKey, 'local');

    if (cachedAdmins && cachedAdmins.length > 0) {
      setAdmins(cachedAdmins);
      setLoading(false);
      return;
    }

    superAdminAPI
      .getAllAdmins(searchTerm)
      .then((response) => {
        // Transform API response to admin list format
        const transformedAdmins = apiTransformers.transformAdminsList(response);
        setAdmins(transformedAdmins);
        cacheService.set(cacheKey, transformedAdmins, 10 * 60 * 1000, 'local');
      })
      .catch((err) => {
        const errorMsg = errorHandlers.parseError(err);
        showNotification(errorMsg, 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adminAuth.isAuthenticated, adminAuth.role, navigate, showNotification]);

  useEffect(() => {
    let filtered = admins;

    if (searchTerm) {
      filtered = filtered.filter(
        (admin) =>
          admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.adminId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((admin) => {
        if (filterStatus === 'enabled') return !admin.isDisabled;
        if (filterStatus === 'disabled') return admin.isDisabled;
        return true;
      });
    }

    setFilteredAdmins(filtered);
    setPage(1);
  }, [admins, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pagedAdmins = filteredAdmins.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const validateCreateForm = () => {
    if (!createFormData.name || !createFormData.email || !createFormData.adminId || !createFormData.phone || !createFormData.password || !createFormData.confirmPassword) {
      return 'Please fill in all fields';
    }

    if (createFormData.name.length < 3) {
      return 'Name must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createFormData.email)) {
      return 'Please enter a valid email address';
    }

    if (createFormData.adminId.length < 3) {
      return 'Admin ID must be at least 3 characters';
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(createFormData.phone.replace(/\s/g, ''))) {
      return 'Phone number must be valid (at least 10 digits)';
    }

    if (createFormData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (createFormData.password !== createFormData.confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleCreateAdmin = (admin) => {
    setSelectedAdmin(admin);
    setCreateFormData({
      name: '',
      email: '',
      adminId: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
    setShowCreateModal(true);
  };

  const handleDeleteAdmin = async (admin) => {
    setSelectedAdmin(admin);
    setModalLoading(true);
    
    try {
      // Fetch admin details to check for assigned hostels
      const response = await superAdminAPI.getAdminById(admin.adminId);
      const adminDetails = apiTransformers.transformAdminDetail(response);
      
      if (adminDetails && adminDetails.managedHostels && adminDetails.managedHostels.length > 0) {
        // Admin has hostels, show reassignment modal
        setAdminHostels(adminDetails.managedHostels);
        
        // Initialize reassignment state
        const initialReassignments = {};
        adminDetails.managedHostels.forEach(hostel => {
          initialReassignments[hostel._id] = '';
        });
        setHostelReassignments(initialReassignments);
        
        // Get all other admins for reassignment options
        const adminsResponse = await superAdminAPI.getAllAdmins();
        const allAdmins = apiTransformers.transformAdminsList(adminsResponse);
        const otherAdmins = allAdmins.filter(a => a.adminId !== admin.adminId && !a.isDisabled);
        setAllAdminsForReassign(otherAdmins);
        
        setShowReassignModal(true);
      } else {
        // No hostels, proceed with normal delete
        setShowDeleteModal(true);
      }
    } catch (err) {
      const errorMsg = errorHandlers.parseError(err);
      showNotification(errorMsg, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDisableAdmin = (admin) => {
    setSelectedAdmin(admin);
    setDisableReason('');
    setShowDisableModal(true);
  };

  const submitCreateAdmin = () => {
    const validationError = validateCreateForm();
    if (validationError) {
      showNotification(validationError, 'error');
      return;
    }

    setModalLoading(true);
    // Build request payload using the payload builder
    const payload = requestPayloads.createAdmin({
      name: createFormData.name,
      email: createFormData.email,
      adminId: createFormData.adminId,
      phone: createFormData.phone,
      password: createFormData.password,
    });

    superAdminAPI
      .createAdmin(payload)
      .then((response) => {
        showNotification('Admin created successfully', 'success');
        setShowCreateModal(false);
        setCreateFormData({
          name: '',
          email: '',
          adminId: '',
          phone: '',
          password: '',
          confirmPassword: '',
        });
        cacheService.remove('superadmin_all_admins', 'local');
        // Refresh the list
        superAdminAPI
          .getAllAdmins(searchTerm)
          .then((response) => {
            const transformedAdmins = apiTransformers.transformAdminsList(response);
            setAdmins(transformedAdmins);
            cacheService.set('superadmin_all_admins', transformedAdmins, 10 * 60 * 1000, 'local');
          })
          .catch((err) => {
            const errorMsg = errorHandlers.parseError(err);
            showNotification(errorMsg, 'error');
          });
      })
      .catch((err) => {
        const errorMsg = errorHandlers.parseError(err);
        showNotification(errorMsg, 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const submitReassignAndDelete = async () => {
    // Validate all hostels have been reassigned
    const unassignedHostels = adminHostels.filter(hostel => !hostelReassignments[hostel._id]);
    if (unassignedHostels.length > 0) {
      showNotification('Please assign all hostels to another admin before deleting', 'error');
      return;
    }

    setModalLoading(true);
    
    try {
      // Reassign all hostels first
      const reassignmentPromises = adminHostels.map(hostel => {
        const payload = requestPayloads.changeHostelAdmin(hostel._id, {
          adminId: hostelReassignments[hostel._id]
        });
        return superAdminAPI.changeHostelAdmin(hostel._id, payload);
      });
      
      await Promise.all(reassignmentPromises);
      showNotification('Hostels reassigned successfully', 'success');
      
      // Now delete the admin
      await superAdminAPI.deleteAdmin(selectedAdmin._id);
      showNotification('Admin deleted successfully', 'success');
      
      setShowReassignModal(false);
      setAdminHostels([]);
      setHostelReassignments({});
      
      cacheService.remove('superadmin_all_admins', 'local');
      cacheService.remove('superadmin_all_hostels', 'local');
      
      // Refresh the admin list
      const response = await superAdminAPI.getAllAdmins(searchTerm);
      const transformedAdmins = apiTransformers.transformAdminsList(response);
      setAdmins(transformedAdmins);
      cacheService.set('superadmin_all_admins', transformedAdmins, 10 * 60 * 1000, 'local');
    } catch (err) {
      const errorMsg = errorHandlers.parseError(err);
      showNotification(errorMsg, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const submitDeleteAdmin = () => {
    setModalLoading(true);
    superAdminAPI
      .deleteAdmin(selectedAdmin._id)
      .then(() => {
        showNotification('Admin deleted successfully', 'success');
        setShowDeleteModal(false);
        cacheService.remove('superadmin_all_admins', 'local');
        // Refresh the list
        superAdminAPI
          .getAllAdmins(searchTerm)
          .then((response) => {
            const transformedAdmins = apiTransformers.transformAdminsList(response);
            setAdmins(transformedAdmins);
            cacheService.set('superadmin_all_admins', transformedAdmins, 10 * 60 * 1000, 'local');
          })
          .catch((err) => {
            const errorMsg = errorHandlers.parseError(err);
            showNotification(errorMsg, 'error');
          });
      })
      .catch((err) => {
        const errorMsg = errorHandlers.parseError(err);
        showNotification(errorMsg, 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const submitDisableAdmin = () => {
    if (!disableReason.trim() && !selectedAdmin.isDisabled) {
      showNotification('Please provide a reason for disabling', 'error');
      return;
    }

    setModalLoading(true);
    
    // Determine which API call to make based on current state
    let apiCall;
    if (selectedAdmin.isDisabled) {
      // Enable the admin
      const payload = requestPayloads.enableAdmin(selectedAdmin._id);
      apiCall = superAdminAPI.enableAdmin(selectedAdmin._id, payload);
    } else {
      // Disable the admin
      const payload = requestPayloads.disableAdmin(selectedAdmin._id, { reason: disableReason });
      apiCall = superAdminAPI.disableAdmin(selectedAdmin._id, payload);
    }

    apiCall
      .then(() => {
        showNotification(
          selectedAdmin.isDisabled
            ? 'Admin enabled successfully'
            : 'Admin disabled successfully',
          'success'
        );
        setShowDisableModal(false);
        setDisableReason('');
        cacheService.remove('superadmin_all_admins', 'local');
        // Refresh the list
        superAdminAPI
          .getAllAdmins(searchTerm)
          .then((response) => {
            const transformedAdmins = apiTransformers.transformAdminsList(response);
            setAdmins(transformedAdmins);
            cacheService.set('superadmin_all_admins', transformedAdmins, 10 * 60 * 1000, 'local');
          })
          .catch((err) => {
            const errorMsg = errorHandlers.parseError(err);
            showNotification(errorMsg, 'error');
          });
      })
      .catch((err) => {
        const errorMsg = errorHandlers.parseError(err);
        showNotification(errorMsg, 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleLogout = () => {
    dispatch({ type: 'adminAuth/adminLogout' });
    navigate('/admin/login');
    showNotification('Logged out successfully', 'success');
  };

  if (loading) {
    return (
      <Layout>
        <div className="superadmin-admins">
          <div className="loading">Loading admins...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="superadmin-admins">
        <div className="page-header">
          <div className="header-top">
            <button className="btn btn-back" onClick={() => navigate('/superadmin/dashboard')}>
              ← Back to Dashboard
            </button>
            <h1>Admin Management</h1>
            <div className="header-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleCreateAdmin(null)}
              >
                + Create New Admin
              </button>
              <button className="btn btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          <div className="filters-section">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or admin ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Admins</option>
              <option value="enabled">Enabled Admins</option>
              <option value="disabled">Disabled Admins</option>
            </select>
          </div>
        </div>

        <div className="admins-list">
          {pagedAdmins.length === 0 ? (
            <div className="no-data">No admins found</div>
          ) : (
            <table className="admins-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Admin ID</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedAdmins.map((admin) => (
                  <tr key={admin._id} className={admin.isDisabled ? 'disabled' : ''}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>{admin.adminId}</td>
                    <td>{admin.phone}</td>
                    <td>
                      <span className={`status-badge ${admin.isDisabled ? 'disabled' : 'enabled'}`}>
                        {admin.isDisabled ? 'Disabled' : 'Enabled'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className={`btn btn-sm ${admin.isDisabled ? 'btn-enable' : 'btn-disable'}`}
                        onClick={() => handleDisableAdmin(admin)}
                        title={admin.isDisabled ? 'Enable' : 'Disable'}
                      >
                        {admin.isDisabled ? '✓ Enable' : '⊗ Disable'}
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDeleteAdmin(admin)}
                        title="Delete"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />

        {/* Create Admin Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Admin</h2>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, name: e.target.value })
                  }
                  placeholder="Enter name"
                  disabled={modalLoading}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, email: e.target.value })
                  }
                  placeholder="Enter email"
                  disabled={modalLoading}
                />
              </div>
              <div className="form-group">
                <label>Admin ID</label>
                <input
                  type="text"
                  value={createFormData.adminId}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, adminId: e.target.value })
                  }
                  placeholder="Enter admin ID"
                  disabled={modalLoading}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={createFormData.phone}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  disabled={modalLoading}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, password: e.target.value })
                  }
                  placeholder="Enter password"
                  disabled={modalLoading}
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={createFormData.confirmPassword}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm password"
                  disabled={modalLoading}
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={submitCreateAdmin}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Creating...' : 'Create Admin'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Admin Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Admin</h2>
              <p>
                Are you sure you want to delete <strong>{selectedAdmin?.name}</strong>? This action
                cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  className="btn btn-danger"
                  onClick={submitDeleteAdmin}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Deleting...' : 'Delete Admin'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disable/Enable Admin Modal */}
        {showDisableModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowDisableModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {selectedAdmin?.isDisabled ? 'Enable' : 'Disable'} Admin -{' '}
                {selectedAdmin?.name}
              </h2>
              {!selectedAdmin?.isDisabled && (
                <div className="form-group">
                  <label>Reason for Disabling</label>
                  <textarea
                    value={disableReason}
                    onChange={(e) => setDisableReason(e.target.value)}
                    placeholder="Enter reason for disabling"
                    rows="4"
                    disabled={modalLoading}
                  />
                </div>
              )}
              <div className="modal-actions">
                <button
                  className={`btn ${selectedAdmin?.isDisabled ? 'btn-success' : 'btn-danger'}`}
                  onClick={submitDisableAdmin}
                  disabled={modalLoading}
                >
                  {modalLoading
                    ? 'Processing...'
                    : selectedAdmin?.isDisabled
                    ? 'Enable Admin'
                    : 'Disable Admin'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDisableModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reassign Hostels Modal */}
        {showReassignModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowReassignModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <h2>Reassign Hostels - {selectedAdmin?.name}</h2>
              <p className="warning-text">
                ⚠️ This admin manages {adminHostels.length} hostel(s). Please reassign them to another admin before deletion.
              </p>
              <div className="hostel-reassignment-list">
                {adminHostels.map((hostel) => (
                  <div key={hostel._id} className="reassignment-item">
                    <div className="hostel-info">
                      <strong>{hostel.name}</strong>
                      <span className="hostel-details">Capacity: {hostel.capacity}</span>
                    </div>
                    <div className="form-group">
                      <label>Assign to:</label>
                      <select
                        value={hostelReassignments[hostel._id] || ''}
                        onChange={(e) =>
                          setHostelReassignments({
                            ...hostelReassignments,
                            [hostel._id]: e.target.value,
                          })
                        }
                        disabled={modalLoading}
                        className="reassign-select"
                      >
                        <option value="">Select an admin</option>
                        {allAdminsForReassign.map((admin) => (
                          <option key={admin._id} value={admin.adminId}>
                            {admin.name} ({admin.adminId})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-danger"
                  onClick={submitReassignAndDelete}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Processing...' : 'Reassign & Delete Admin'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowReassignModal(false);
                    setAdminHostels([]);
                    setHostelReassignments({});
                  }}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuperAdminAdmins;
