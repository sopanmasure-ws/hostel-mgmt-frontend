/**
 * SuperAdminHostels Component
 * Manages all hostels in the system
 * Operations: Create Hostel, Delete Hostel, Disable/Enable Hostel, Change Admin, Change Room Status
 * API Integration: Uses /api/superadmin/hostels/* endpoints
 */
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../component/NotificationContext';
import { superAdminAPI, apiTransformers, requestPayloads, errorHandlers } from '../../../lib/api';
import { cacheService } from '../../../lib/services/cacheService';
import Pagination from '../../../component/Pagination';
import Layout from '../../../layout/Layout';
import '../../../styles/superadmin-hostels.css';
import type { NotificationContextType, RootState } from '../../../types';

const SuperAdminHostels: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state: RootState) => state);
  const notificationContext = useContext(NotificationContext) as NotificationContextType | undefined;
  const showNotification = notificationContext?.showNotification || (() => {});

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
  const [showAssignStudentModal, setShowAssignStudentModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [assignedRoom, setAssignedRoom] = useState('');
  const [loadingApplications, setLoadingApplications] = useState(false);

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
  const [admins, setAdmins] = useState<any[]>([]);

  useEffect(() => {
    if (!adminAuth.isAuthenticated || adminAuth.role !== 'superadmin') {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    const cacheKey = 'superadmin_all_hostels';
    const cachedHostels = cacheService.get<any[]>(cacheKey, 'local');

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
    const adminsCache = cacheService.get<any[]>('superadmin_all_admins', 'local');
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

    const capacityValue = Number(createFormData.capacity);
    if (Number.isNaN(capacityValue) || capacityValue < 1) {
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

  const handleAssignStudent = (hostel: any) => {
    setSelectedHostel(hostel);
    setSelectedApplication(null);
    setAssignedRoom('');
    setShowAssignStudentModal(true);
    fetchPendingApplications(hostel._id || hostel.id);
  };

  const fetchPendingApplications = (hostelId: string) => {
    setLoadingApplications(true);
    superAdminAPI
      .getHostelApplications(hostelId)
      .then((response: any) => {
        let applications = [];
        if (Array.isArray(response)) {
          applications = response;
        } else if (response?.data && Array.isArray(response.data)) {
          applications = response.data;
        } else if (response?.applications && Array.isArray(response.applications)) {
          applications = response.applications;
        }
        // Filter for pending applications only
        const pending = applications.filter(
          (app: any) => String(app.status || '').toLowerCase() === 'pending'
        );
        setPendingApplications(pending);
      })
      .catch((err) => {
        const errorMsg = errorHandlers.parseError(err);
        showNotification(errorMsg, 'error');
        setPendingApplications([]);
      })
      .finally(() => {
        setLoadingApplications(false);
      });
  };

  const submitAssignStudent = () => {
    if (!selectedApplication || !assignedRoom.trim()) {
      showNotification('Please select a student and provide a room number', 'error');
      return;
    }

    setModalLoading(true);
    const payload = (requestPayloads as any).assignRoom(selectedApplication._id || selectedApplication.id, {
      roomNumber: assignedRoom,
      hostelId: selectedHostel._id || selectedHostel.id,
    });

    superAdminAPI
      .assignRoom(selectedApplication._id || selectedApplication.id, payload)
      .then(() => {
        showNotification('Student assigned to room successfully', 'success');
        setShowAssignStudentModal(false);
        setSelectedApplication(null);
        setAssignedRoom('');
        cacheService.remove('superadmin_all_hostels', 'local');
        // Refresh the list
        superAdminAPI
          .getAllHostels(searchTerm)
          .then((response: any) => {
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
      const payload = (requestPayloads as any).enableHostel(selectedHostel._id);
      apiCall = (superAdminAPI as any).enableHostel(selectedHostel._id, payload);
    } else {
      // Disable the hostel
      const payload = (requestPayloads as any).disableHostel(selectedHostel._id, { reason: disableReason });
      apiCall = (superAdminAPI as any).disableHostel(selectedHostel._id, payload);
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
    const payload = (requestPayloads as any).changeHostelAdmin(selectedHostel._id, { 
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
    const payload = (requestPayloads as any).changeRoomStatus(selectedHostel._id, {
      roomNumber: roomStatusData.roomNumber,
      status: roomStatusData.status,
    });

    superAdminAPI
      .changeRoomStatus(selectedHostel._id, roomStatusData.roomNumber, payload)
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
                        className="btn btn-sm btn-assign-student"
                        onClick={() => handleAssignStudent(hostel)}
                        title="Assign Student"
                      >
                        👨‍🎓 Assign Student
                      </button>
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
          totalItems={filteredHostels.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setPage}
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
                  rows={3}
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
                    rows={4}
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

        {/* Assign Student Modal */}
        {showAssignStudentModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowAssignStudentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Assign Student - {selectedHostel?.name}</h2>
              {loadingApplications ? (
                <div className="loading-applications">Loading pending applications...</div>
              ) : pendingApplications.length === 0 ? (
                <div className="no-pending-applications">
                  <p className="no-data-message">No pending applications for this hostel</p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Select Pending Application *</label>
                    <select
                      value={selectedApplication ? selectedApplication._id || selectedApplication.id : ''}
                      onChange={(e) => {
                        const app = pendingApplications.find(
                          (a) => (a._id || a.id) === e.target.value
                        );
                        setSelectedApplication(app || null);
                      }}
                      disabled={modalLoading}
                      className="applications-select"
                    >
                      <option value="">Select a student</option>
                      {pendingApplications.map((app) => (
                        <option key={app._id || app.id} value={app._id || app.id}>
                          {app.studentName || app.name} ({app.studentEmail || app.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedApplication && (
                    <div className="application-details">
                      <p><strong>Student:</strong> {selectedApplication.studentName || selectedApplication.name}</p>
                      <p><strong>Email:</strong> {selectedApplication.studentEmail || selectedApplication.email}</p>
                      <p><strong>Phone:</strong> {selectedApplication.studentPhone || selectedApplication.phone}</p>
                      <p><strong>Applied On:</strong> {selectedApplication.applicationDate || selectedApplication.appliedOn || 'N/A'}</p>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Assign to Room *</label>
                    <input
                      type="text"
                      value={assignedRoom}
                      onChange={(e) => setAssignedRoom(e.target.value)}
                      placeholder="Enter room number"
                      disabled={modalLoading || !selectedApplication}
                    />
                  </div>
                </>
              )}
              <div className="modal-actions">
                {pendingApplications.length > 0 && (
                  <button
                    className="btn btn-primary"
                    onClick={submitAssignStudent}
                    disabled={modalLoading || !selectedApplication || !assignedRoom.trim()}
                  >
                    {modalLoading ? 'Assigning...' : 'Assign Student'}
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAssignStudentModal(false);
                    setPendingApplications([]);
                    setSelectedApplication(null);
                    setAssignedRoom('');
                  }}
                  disabled={modalLoading}
                >
                  Close
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
