/**
 * SuperAdminHostels Component
 * Manages all hostels in the system
 * Operations: Create Hostel, Delete Hostel, Disable/Enable Hostel, Change Admin, Change Room Status
 * API Integration: Uses /api/superadmin/hostels/* endpoints
 */
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../component/NotificationContext';
import { superAdminAPI, apiTransformers, requestPayloads, errorHandlers } from '../../lib/api';
import { cacheService } from '../../lib/services/cacheService';
import Pagination from '../../component/Pagination';
import Layout from '../../layout/Layout';
import '../../styles/superadmin-hostels.css';

const SuperAdminHostels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { showNotification } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showChangeAdminModal, setShowChangeAdminModal] = useState(false);
  const [showRoomStatusModal, setShowRoomStatusModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    name: '',
    adminId: '',
    capacity: '',
    description: '',
  });

  const [changeAdminData, setChangeAdminData] = useState({
    newAdminId: '',
  });

  const [roomStatusData, setRoomStatusData] = useState({
    roomNumber: '',
    status: 'available',
  });

  const [disableReason, setDisableReason] = useState('');
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    if (!adminAuth.isAuthenticated || adminAuth.role !== 'superadmin') {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    const cacheKey = 'superadmin_all_hostels';
    const cachedHostels = cacheService.get(cacheKey, 'local');

    if (cachedHostels && cachedHostels.length > 0) {
      setHostels(cachedHostels);
      setLoading(false);
      return;
    }

    superAdminAPI
      .getAllHostels(searchTerm)
      .then((response) => {
        // Transform API response to hostel list format
        const transformedHostels = apiTransformers.transformHostelsList(response);
        setHostels(transformedHostels);
        cacheService.set(cacheKey, transformedHostels, 10 * 60 * 1000, 'local');
      })
      .catch((err) => {
        const errorMsg = errorHandlers.parseError(err);
        showNotification(errorMsg, 'error');
      })
      .finally(() => {
        setLoading(false);
      });

    // Load admins for dropdown
    const adminsCache = cacheService.get('superadmin_all_admins', 'local');
    if (adminsCache) {
      setAdmins(adminsCache);
    } else {
      superAdminAPI
        .getAllAdmins()
        .then((response) => {
          const transformedAdmins = apiTransformers.transformAdminsList(response);
          setAdmins(transformedAdmins);
          cacheService.set('superadmin_all_admins', transformedAdmins, 10 * 60 * 1000, 'local');
        })
        .catch((err) => {
          const errorMsg = errorHandlers.parseError(err);
          showNotification(errorMsg, 'error');
        });
    }
  }, [adminAuth.isAuthenticated, adminAuth.role, navigate, showNotification]);

  // Use useMemo for derived state instead of useEffect to avoid cascading renders
  const filteredHostels = useMemo(() => {
    let filtered = hostels;

    if (searchTerm) {
      filtered = filtered.filter(
        (hostel) =>
          hostel.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((hostel) => {
        if (filterStatus === 'enabled') return !hostel.isDisabled;
        if (filterStatus === 'disabled') return hostel.isDisabled;
        return true;
      });
    }

    return filtered;
  }, [hostels, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredHostels.length / pageSize));
  // Clamp page to valid range and reset to 1 when filters change
  const currentPage = useMemo(() => {
    // Reset to page 1 when filters change, otherwise clamp to valid range
    return Math.min(Math.max(1, page), totalPages);
  }, [page, totalPages]);

  const pagedHostels = useMemo(() => {
    return filteredHostels.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredHostels, currentPage, pageSize]);

  const validateCreateForm = () => {
    if (!createFormData.name || !createFormData.adminId || !createFormData.capacity) {
      return 'Please fill in all required fields';
    }

    if (createFormData.name.length < 3) {
      return 'Hostel name must be at least 3 characters';
    }

    if (isNaN(createFormData.capacity) || createFormData.capacity < 1) {
      return 'Capacity must be a valid number';
    }

    return null;
  };

  const handleCreateHostel = () => {
    setCreateFormData({
      name: '',
      adminId: '',
      capacity: '',
      description: '',
    });
    setShowCreateModal(true);
  };

  const handleDeleteHostel = (hostel) => {
    setSelectedHostel(hostel);
    setShowDeleteModal(true);
  };

  const handleDisableHostel = (hostel) => {
    setSelectedHostel(hostel);
    setDisableReason('');
    setShowDisableModal(true);
  };

  const handleChangeAdmin = (hostel) => {
    setSelectedHostel(hostel);
    setChangeAdminData({ newAdminId: hostel.adminId || '' });
    setShowChangeAdminModal(true);
  };

  const handleChangeRoomStatus = (hostel) => {
    setSelectedHostel(hostel);
    setRoomStatusData({ roomNumber: '', status: 'available' });
    setShowRoomStatusModal(true);
  };

  const submitCreateHostel = () => {
    const validationError = validateCreateForm();
    if (validationError) {
      showNotification(validationError, 'error');
      return;
    }

    setModalLoading(true);
    // Build request payload using the payload builder
    const payload = requestPayloads.createHostel({
      name: createFormData.name,
      adminId: createFormData.adminId,
      capacity: parseInt(createFormData.capacity),
      description: createFormData.description,
    });

    superAdminAPI
      .createHostel(payload)
      .then(() => {
        showNotification('Hostel created successfully', 'success');
        setShowCreateModal(false);
        setCreateFormData({
          name: '',
          adminId: '',
          capacity: '',
          description: '',
        });
        cacheService.remove('superadmin_all_hostels', 'local');
        // Refresh the list
        superAdminAPI
          .getAllHostels(searchTerm)
          .then((response) => {
            const transformedHostels = apiTransformers.transformHostelsList(response);
            setHostels(transformedHostels);
            cacheService.set('superadmin_all_hostels', transformedHostels, 10 * 60 * 1000, 'local');
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

  const submitDeleteHostel = () => {
    setModalLoading(true);
    superAdminAPI
      .deleteHostel(selectedHostel._id)
      .then(() => {
        showNotification('Hostel deleted successfully', 'success');
        setShowDeleteModal(false);
        cacheService.remove('superadmin_all_hostels', 'local');
        // Refresh the list
        superAdminAPI
          .getAllHostels(searchTerm)
          .then((response) => {
            const transformedHostels = apiTransformers.transformHostelsList(response);
            setHostels(transformedHostels);
            cacheService.set('superadmin_all_hostels', transformedHostels, 10 * 60 * 1000, 'local');
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

  const submitDisableHostel = () => {
    if (!disableReason.trim() && !selectedHostel.isDisabled) {
      showNotification('Please provide a reason for disabling', 'error');
      return;
    }

    setModalLoading(true);
    
    // Determine which API call to make based on current state
    let apiCall;
    if (selectedHostel.isDisabled) {
      // Enable the hostel
      const payload = requestPayloads.enableHostel(selectedHostel._id);
      apiCall = superAdminAPI.enableHostel(selectedHostel._id, payload);
    } else {
      // Disable the hostel
      const payload = requestPayloads.disableHostel(selectedHostel._id, { reason: disableReason });
      apiCall = superAdminAPI.disableHostel(selectedHostel._id, payload);
    }

    apiCall
      .then(() => {
        showNotification(
          selectedHostel.isDisabled
            ? 'Hostel enabled successfully'
            : 'Hostel disabled successfully',
          'success'
        );
        setShowDisableModal(false);
        setDisableReason('');
        cacheService.remove('superadmin_all_hostels', 'local');
        // Refresh the list
        superAdminAPI
          .getAllHostels(searchTerm)
          .then((response) => {
            const transformedHostels = apiTransformers.transformHostelsList(response);
            setHostels(transformedHostels);
            cacheService.set('superadmin_all_hostels', transformedHostels, 10 * 60 * 1000, 'local');
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

  const submitChangeAdmin = () => {
    if (!changeAdminData.newAdminId.trim()) {
      showNotification('Please select an admin', 'error');
      return;
    }

    setModalLoading(true);
    // Build request payload using the payload builder
    const payload = requestPayloads.changeHostelAdmin(selectedHostel._id, { 
      adminId: changeAdminData.newAdminId 
    });

    superAdminAPI
      .changeHostelAdmin(selectedHostel._id, payload)
      .then(() => {
        showNotification('Hostel admin changed successfully', 'success');
        setShowChangeAdminModal(false);
        setChangeAdminData({ newAdminId: '' });
        cacheService.remove('superadmin_all_hostels', 'local');
        // Refresh the list
        superAdminAPI
          .getAllHostels(searchTerm)
          .then((response) => {
            const transformedHostels = apiTransformers.transformHostelsList(response);
            setHostels(transformedHostels);
            cacheService.set('superadmin_all_hostels', transformedHostels, 10 * 60 * 1000, 'local');
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

  const submitChangeRoomStatus = () => {
    if (!roomStatusData.roomNumber.trim() || !roomStatusData.status) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setModalLoading(true);
    // Build request payload using the payload builder
    const payload = requestPayloads.changeRoomStatus(selectedHostel._id, {
      roomNumber: roomStatusData.roomNumber,
      status: roomStatusData.status,
    });

    superAdminAPI
      .changeRoomStatus(selectedHostel._id, payload)
      .then(() => {
        showNotification('Room status changed successfully', 'success');
        setShowRoomStatusModal(false);
        setRoomStatusData({ roomNumber: '', status: 'available' });
        // Note: Cache invalidation depends on whether this operation affects the hostel list
        cacheService.remove('superadmin_all_hostels', 'local');
        // Optional: Refresh the list if room status changes affect hostel display
        superAdminAPI
          .getAllHostels(searchTerm)
          .then((response) => {
            const transformedHostels = apiTransformers.transformHostelsList(response);
            setHostels(transformedHostels);
            cacheService.set('superadmin_all_hostels', transformedHostels, 10 * 60 * 1000, 'local');
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
        <div className="superadmin-hostels">
          <div className="loading">Loading hostels...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="superadmin-hostels">
        <div className="page-header">
          <div className="header-top">
            <button className="btn btn-back" onClick={() => navigate('/superadmin/dashboard')}>
              ← Back to Dashboard
            </button>
            <h1>Hostel Management</h1>
            <div className="header-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreateHostel}
              >
                + Create Hostel
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
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Hostels</option>
              <option value="enabled">Enabled Hostels</option>
              <option value="disabled">Disabled Hostels</option>
            </select>
          </div>
        </div>

        <div className="hostels-list">
          {pagedHostels.length === 0 ? (
            <div className="no-data">No hostels found</div>
          ) : (
            <table className="hostels-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Warden</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedHostels.map((hostel) => (
                  <tr key={hostel._id} className={hostel.isDisabled ? 'disabled' : ''}>
                    <td>{hostel.name}</td>
                    <td>{hostel.warden || 'N/A'}</td>
                    <td>{hostel.capacity}</td>
                    <td>
                      <span className={`status-badge ${hostel.isDisabled ? 'disabled' : 'enabled'}`}>
                        {hostel.isDisabled ? 'Disabled' : 'Enabled'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-sm btn-change-admin"
                        onClick={() => handleChangeAdmin(hostel)}
                        title="Change Admin"
                      >
                        👤 Change Admin
                      </button>
                      <button
                        className="btn btn-sm btn-room-status"
                        onClick={() => handleChangeRoomStatus(hostel)}
                        title="Change Room Status"
                      >
                        🚪 Room Status
                      </button>
                      <button
                        className={`btn btn-sm ${hostel.isDisabled ? 'btn-enable' : 'btn-disable'}`}
                        onClick={() => handleDisableHostel(hostel)}
                        title={hostel.isDisabled ? 'Enable' : 'Disable'}
                      >
                        {hostel.isDisabled ? '✓ Enable' : '⊗ Disable'}
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDeleteHostel(hostel)}
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
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />

        {/* Create Hostel Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Hostel</h2>
              <div className="form-group">
                <label>Hostel Name *</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, name: e.target.value })
                  }
                  placeholder="Enter hostel name"
                  disabled={modalLoading}
                />
              </div>
              <div className="form-group">
                <label>Admin ID *</label>
                <select
                  value={createFormData.adminId}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, adminId: e.target.value })
                  }
                  disabled={modalLoading}
                >
                  <option value="">Select an admin</option>
                  {admins.map((admin) => (
                    <option key={admin.adminId} value={admin.adminId}>
                      {admin.name} ({admin.adminId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  value={createFormData.capacity}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, capacity: e.target.value })
                  }
                  placeholder="Enter hostel capacity"
                  disabled={modalLoading}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, description: e.target.value })
                  }
                  placeholder="Enter description"
                  rows="3"
                  disabled={modalLoading}
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={submitCreateHostel}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Creating...' : 'Create Hostel'}
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

        {/* Delete Hostel Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Hostel</h2>
              <p>
                Are you sure you want to delete <strong>{selectedHostel?.name}</strong>? This action
                cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  className="btn btn-danger"
                  onClick={submitDeleteHostel}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Deleting...' : 'Delete Hostel'}
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

        {/* Disable/Enable Hostel Modal */}
        {showDisableModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowDisableModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {selectedHostel?.isDisabled ? 'Enable' : 'Disable'} Hostel -{' '}
                {selectedHostel?.name}
              </h2>
              {!selectedHostel?.isDisabled && (
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
                  className={`btn ${selectedHostel?.isDisabled ? 'btn-success' : 'btn-danger'}`}
                  onClick={submitDisableHostel}
                  disabled={modalLoading}
                >
                  {modalLoading
                    ? 'Processing...'
                    : selectedHostel?.isDisabled
                    ? 'Enable Hostel'
                    : 'Disable Hostel'}
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

        {/* Change Admin Modal */}
        {showChangeAdminModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowChangeAdminModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Change Admin - {selectedHostel?.name}</h2>
              <div className="form-group">
                <label>Select New Admin</label>
                <select
                  value={changeAdminData.newAdminId}
                  onChange={(e) =>
                    setChangeAdminData({ newAdminId: e.target.value })
                  }
                  disabled={modalLoading}
                >
                  <option value="">Select an admin</option>
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin.adminId}>
                      {admin.name} ({admin.adminId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={submitChangeAdmin}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Updating...' : 'Change Admin'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowChangeAdminModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Room Status Modal */}
        {showRoomStatusModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowRoomStatusModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Change Room Status - {selectedHostel?.name}</h2>
              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  value={roomStatusData.roomNumber}
                  onChange={(e) =>
                    setRoomStatusData({ ...roomStatusData, roomNumber: e.target.value })
                  }
                  placeholder="Enter room number"
                  disabled={modalLoading}
                />
              </div>
              <div className="form-group">
                <label>Room Status</label>
                <select
                  value={roomStatusData.status}
                  onChange={(e) =>
                    setRoomStatusData({ ...roomStatusData, status: e.target.value })
                  }
                  disabled={modalLoading}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={submitChangeRoomStatus}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Updating...' : 'Change Status'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRoomStatusModal(false)}
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

export default SuperAdminHostels;
