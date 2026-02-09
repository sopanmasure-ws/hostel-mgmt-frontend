import React, { useState, useContext, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../component/NotificationContext';
import { superAdminAPI, adminRoomAPI, adminApplicationAPI, applicationAPI, apiTransformers, requestPayloads, errorHandlers } from '../../../lib/api';
import { cacheService } from '../../../lib/services/cacheService';
import Pagination from '../../../component/Pagination';
import Layout from '../../../layout/Layout';
import '../../../styles/superadmin-students.css';

/**
 * Super Admin Students Management Component
 * Manages student data with operations: assign room, reject application, blacklist
 * API Reference: SUPERADMIN_API_DOCS.md - Endpoints: GET /api/superadmin/students/:pnr
 */
const SuperAdminStudents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { showNotification } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [showChangeRoomModal, setShowChangeRoomModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [availableHostels, setAvailableHostels] = useState([]);
  const [loadingHostels, setLoadingHostels] = useState(false);
  const [changeRoomData, setChangeRoomData] = useState({
    hostelId: '',
    roomId: '',
  });

  const [assignRoomData, setAssignRoomData] = useState({
    roomNumber: '',
    floor: '',
    hostelId: '',
  });

  const [rejectReason, setRejectReason] = useState('');
  const [blacklistReason, setBlacklistReason] = useState('');

  // Track which students have been enriched to prevent infinite loops
  const enrichedDetailsRef = useRef(new Set());
  const enrichedAppsRef = useRef(new Set());

  useEffect(() => {
    if (!adminAuth.isAuthenticated || adminAuth.role !== 'superadmin') {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    const cacheKey = 'superadmin_all_students';
    const cacheVersion = 'v2'; // Version to force refresh when data structure changes
    const cachedData = cacheService.get(cacheKey, 'local');
    
    // Check if cache is valid and has the new structure with roomNumber
    const isCacheValid = cachedData && 
      cachedData.version === cacheVersion && 
      cachedData.students && 
      cachedData.students.length > 0;

    if (isCacheValid) {
      setStudents(cachedData.students);
      setLoading(false);
      return;
    }

    // Clear old cache format
    cacheService.remove(cacheKey, 'local');

    // Fetch all students from API (searchable endpoint)
    superAdminAPI
      .getAllStudents()
      .then((response) => {
        // Transform API response using data mapping utilities
        const transformedStudents = apiTransformers.transformStudentsList(response);
        setStudents(transformedStudents);
        cacheService.set(cacheKey, { version: cacheVersion, students: transformedStudents }, 10 * 60 * 1000, 'local');
      })
      .catch((err) => {
        const errorMsg = errorHandlers.parseError(err);
        showNotification(errorMsg, 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adminAuth.isAuthenticated, adminAuth.role]);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.pnr?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((student) => {
        if (filterStatus === 'blacklisted') return student.isBlacklisted;
        if (filterStatus === 'active') return !student.isBlacklisted;
        return true;
      });
    }

    setFilteredStudents(filtered);
    setPage(1);
  }, [students, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pagedStudents = filteredStudents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Enrich paged students with currentApplication/assignedRoom from detail endpoint if missing
  useEffect(() => {
    const enrichStudents = async () => {
      const toFetch = pagedStudents.filter(
        (s) => (!s.currentApplication || !s.currentApplication._id) && !enrichedDetailsRef.current.has(s.pnr)
      );
      if (toFetch.length === 0) return;
      
      // Mark as being enriched
      toFetch.forEach((s) => enrichedDetailsRef.current.add(s.pnr));
      
      try {
        const updates = await Promise.all(
          toFetch.map(async (s) => {
            const cacheKey = `superadmin_student_${s.pnr}`;
            const cached = cacheService.get(cacheKey, 'local');
            if (cached) {
              return { pnr: s.pnr, detail: cached };
            }
            const resp = await superAdminAPI.getStudentByPNR(s.pnr);
            const detail = apiTransformers.transformStudentDetail(resp);
            cacheService.set(cacheKey, detail, 10 * 60 * 1000, 'local');
            return { pnr: s.pnr, detail };
          })
        );
        if (updates.length) {
          setStudents((prev) =>
            prev.map((st) => {
              const u = updates.find((x) => x.pnr === st.pnr);
              if (!u || !u.detail) return st;
              return {
                ...st,
                assignedRoom: u.detail.assignedRoom || st.assignedRoom,
                roomNumber: u.detail.roomNumber || st.roomNumber,
                floor: u.detail.floor || st.floor,
                hostelName: u.detail.hostelName || st.hostelName,
                currentApplication: u.detail.currentApplication || st.currentApplication,
              };
            })
          );
        }
      } catch (err) {
        console.debug('Failed to enrich student details', err);
      }
    };
    enrichStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // Helper: normalize status to lowercase
  const isPendingStatus = (status) => String(status || '').toLowerCase() === 'pending';

  // Enrich paged students with application object from applicationAPI if currentApplication missing
  useEffect(() => {
    const enrichWithApplications = async () => {
      const targets = pagedStudents.filter(
        (s) => (!s.currentApplication || !s.currentApplication._id) && !enrichedAppsRef.current.has(s.pnr)
      );
      if (targets.length === 0) return;
      
      // Mark as being enriched
      targets.forEach((s) => enrichedAppsRef.current.add(s.pnr));
      
      try {
        const results = await Promise.all(
          targets.map(async (s) => {
            try {
              const cacheKey = `superadmin_student_apps_${s.pnr}`;
              const cached = cacheService.get(cacheKey, 'local');
              if (cached !== undefined) {
                return { pnr: s.pnr, app: cached };
              }
              const app = await applicationAPI.getApplicationsByPNR(s.pnr);
              // cache even null to avoid repeated calls in this session window
              cacheService.set(cacheKey, app, 10 * 60 * 1000, 'local');
              return { pnr: s.pnr, app };
            } catch {
              // Cache null for 404s to prevent repeated calls
              const cacheKey = `superadmin_student_apps_${s.pnr}`;
              cacheService.set(cacheKey, null, 10 * 60 * 1000, 'local');
              return { pnr: s.pnr, app: null };
            }
          })
        );
        if (results.length) {
          setStudents((prev) =>
            prev.map((st) => {
              const r = results.find((x) => x.pnr === st.pnr);
              if (!r) return st;
              if (!r.app) {
                // Mark as enriched even with null to prevent re-fetching
                return {
                  ...st,
                  currentApplication: { status: 'None' },
                };
              }
              const a = r.app;
              const currentApplication = {
                _id: a._id || a.id || null,
                hostelId: a.hostelId || null,
                hostelName: a.hostelId?.name || a.hostelName || 'N/A',
                status: a.status || 'Pending',
                appliedOn: a.appliedOn || a.createdAt || null,
              };
              return {
                ...st,
                currentApplication,
              };
            })
          );
        }
      } catch (err) {
        console.debug('Failed to enrich applications', err);
      }
    };
    enrichWithApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleAssignRoom = async (student) => {
    setSelectedStudent(student);
    setAssignRoomData({ roomNumber: '', floor: '', hostelId: '' });
    setShowAssignRoomModal(true);
    
    // Fetch student details to get hostel info
    try {
      setLoadingRooms(true);
      const response = await superAdminAPI.getStudentByPNR(student.pnr);
      const studentDetails = apiTransformers.transformStudentDetail(response);
      
      if (studentDetails?.currentApplication?.hostelId) {
        // Normalize hostelId (may be object)
        const hid = typeof studentDetails.currentApplication.hostelId === 'object'
          ? (studentDetails.currentApplication.hostelId._id || studentDetails.currentApplication.hostelId.id)
          : studentDetails.currentApplication.hostelId;

        // Fetch available rooms using admin API inventory endpoint
        const resp = await adminRoomAPI.getAvailableRooms(hid);
        let roomsData = [];
        if (Array.isArray(resp)) roomsData = resp;
        else if (resp?.data?.rooms && Array.isArray(resp.data.rooms)) roomsData = resp.data.rooms;
        else if (resp?.rooms && Array.isArray(resp.rooms)) roomsData = resp.rooms;
        else if (resp?.data && Array.isArray(resp.data)) roomsData = resp.data;

        setAvailableRooms(roomsData);
        setAssignRoomData(prev => ({ ...prev, hostelId: hid }));
      }
    } catch (err) {
      const errorMsg = errorHandlers.parseError(err);
      showNotification(errorMsg, 'error');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleChangeRoom = async (student) => {
    setSelectedStudent(student);
    setChangeRoomData({ 
      hostelId: '', 
      roomId: ''
    });
    setAvailableRooms([]);
    setShowChangeRoomModal(true);
    
    // Fetch student details to get gender and current hostel for filtering hostels
    try {
      setLoadingHostels(true);
      const response = await superAdminAPI.getStudentByPNR(student.pnr);
      const studentDetails = apiTransformers.transformStudentDetail(response);
      
      // Fetch all hostels and filter by student's gender
      const hostelsResponse = await superAdminAPI.getAllHostels();
      let allHostels = [];
      
      if (Array.isArray(hostelsResponse)) {
        allHostels = hostelsResponse;
      } else if (hostelsResponse?.data?.hostels && Array.isArray(hostelsResponse.data.hostels)) {
        allHostels = hostelsResponse.data.hostels;
      } else if (hostelsResponse?.data && Array.isArray(hostelsResponse.data)) {
        allHostels = hostelsResponse.data;
      } else if (hostelsResponse?.hostels && Array.isArray(hostelsResponse.hostels)) {
        allHostels = hostelsResponse.hostels;
      }
      
      // Filter hostels by student's gender
      const studentGender = studentDetails.gender || student.gender;
      const filteredHostels = allHostels.filter(hostel => 
        hostel.gender?.toLowerCase() === studentGender?.toLowerCase()
      );
      
      setAvailableHostels(filteredHostels);
      
      // Get current hostel ID and pre-select it
      let currentHostelId = '';
      if (studentDetails?.assignedRoom?.hostelId) {
        currentHostelId = typeof studentDetails.assignedRoom.hostelId === 'object'
          ? (studentDetails.assignedRoom.hostelId._id || studentDetails.assignedRoom.hostelId.id)
          : studentDetails.assignedRoom.hostelId;
      } else if (studentDetails?.currentApplication?.hostelId) {
        currentHostelId = typeof studentDetails.currentApplication.hostelId === 'object'
          ? (studentDetails.currentApplication.hostelId._id || studentDetails.currentApplication.hostelId.id)
          : studentDetails.currentApplication.hostelId;
      }
      
      // Set the current hostel and fetch its available rooms
      if (currentHostelId) {
        setChangeRoomData({ hostelId: currentHostelId, roomId: '' });
        setLoadingHostels(false);
        setLoadingRooms(true);
        
        // Fetch available rooms for current hostel
        try {
          const resp = await adminRoomAPI.getAvailableRooms(currentHostelId);
          let roomsData = [];
          if (Array.isArray(resp)) roomsData = resp;
          else if (resp?.data?.rooms && Array.isArray(resp.data.rooms)) roomsData = resp.data.rooms;
          else if (resp?.rooms && Array.isArray(resp.rooms)) roomsData = resp.rooms;
          else if (resp?.data && Array.isArray(resp.data)) roomsData = resp.data;
          
          setAvailableRooms(roomsData);
        } catch (err) {
          console.debug('Failed to fetch current hostel rooms', err);
        } finally {
          setLoadingRooms(false);
        }
      }
    } catch (err) {
      const errorMsg = errorHandlers.parseError(err);
      showNotification(errorMsg, 'error');
    } finally {
      setLoadingHostels(false);
    }
  };

  const handleHostelChangeForRoom = async (hostelId) => {
    setChangeRoomData(prev => ({ ...prev, hostelId, roomId: '' }));
    setAvailableRooms([]);
    
    if (!hostelId) return;
    
    try {
      setLoadingRooms(true);
      // Fetch available rooms for the selected hostel
      const resp = await adminRoomAPI.getAvailableRooms(hostelId);
      let roomsData = [];
      if (Array.isArray(resp)) roomsData = resp;
      else if (resp?.data?.rooms && Array.isArray(resp.data.rooms)) roomsData = resp.data.rooms;
      else if (resp?.rooms && Array.isArray(resp.rooms)) roomsData = resp.rooms;
      else if (resp?.data && Array.isArray(resp.data)) roomsData = resp.data;

      setAvailableRooms(roomsData);
    } catch (err) {
      const errorMsg = errorHandlers.parseError(err);
      showNotification(errorMsg, 'error');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleRejectApplication = (student) => {
    setSelectedStudent(student);
    setShowRejectModal(true);
  };

  const handleBlacklistStudent = (student) => {
    setSelectedStudent(student);
    setShowBlacklistModal(true);
  };

  const submitAssignRoom = (isChangeRoom = false) => {
    if (!assignRoomData.roomNumber) {
      showNotification('Please select a room', 'error');
      return;
    }

    // Get applicationId from currentApplication
    const applicationId = selectedStudent?.currentApplication?._id || selectedStudent?.currentApplication?.id;
    
    if (!applicationId) {
      showNotification('Application ID not found. Please refresh and try again.', 'error');
      return;
    }

    setModalLoading(true);
    // Use request payload builder to create proper API payload
    const payload = requestPayloads.assignRoom({
      roomNumber: assignRoomData.roomNumber,
      floor: assignRoomData.floor,
      hostelId: assignRoomData.hostelId,
    });
    // Approve application via Admin API endpoint
    adminApplicationAPI
      .changeApplicationStatus(applicationId, payload, 'APPROVED')
      .then(() => {
        showNotification(
          isChangeRoom ? 'Room changed successfully' : 'Room assigned successfully',
          'success'
        );
        if (isChangeRoom) {
          setShowChangeRoomModal(false);
        } else {
          setShowAssignRoomModal(false);
        }
        setAssignRoomData({ roomNumber: '', floor: '', hostelId: '' });
        setAvailableRooms([]);
        cacheService.remove('superadmin_all_students', 'local');
        // Refresh the list
        superAdminAPI.getAllStudents().then((response) => {
          const transformedStudents = apiTransformers.transformStudentsList(response);
          setStudents(transformedStudents);
          cacheService.set('superadmin_all_students', { version: 'v2', students: transformedStudents }, 10 * 60 * 1000, 'local');
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

  const submitChangeRoom = () => {
    if (!changeRoomData.hostelId || !changeRoomData.roomId) {
      showNotification('Please select both hostel and room', 'error');
      return;
    }

    setModalLoading(true);
    // Use the new change-room API
    superAdminAPI
      .changeStudentRoom(selectedStudent.pnr, {
        hostelId: changeRoomData.hostelId,
        roomId: changeRoomData.roomId,
      })
      .then(() => {
        showNotification('Room changed successfully', 'success');
        setShowChangeRoomModal(false);
        setChangeRoomData({ hostelId: '', roomId: '' });
        setAvailableRooms([]);
        setAvailableHostels([]);
        cacheService.remove('superadmin_all_students', 'local');
        // Refresh the list
        superAdminAPI.getAllStudents().then((response) => {
          const transformedStudents = apiTransformers.transformStudentsList(response);
          setStudents(transformedStudents);
          cacheService.set('superadmin_all_students', { version: 'v2', students: transformedStudents }, 10 * 60 * 1000, 'local');
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

  const submitRejectApplication = () => {
    if (!rejectReason.trim()) {
      showNotification('Please provide a rejection reason', 'error');
      return;
    }

    setModalLoading(true);
    // Use request payload builder
    const payload = requestPayloads.rejectApplication(rejectReason);
    
    superAdminAPI
      .rejectStudentApplication(selectedStudent.pnr, payload)
      .then(() => {
        showNotification('Application rejected successfully', 'success');
        setShowRejectModal(false);
        setRejectReason('');
        cacheService.remove('superadmin_all_students', 'local');
        // Refresh the list
        superAdminAPI.getAllStudents().then((response) => {
          const transformedStudents = apiTransformers.transformStudentsList(response);
          setStudents(transformedStudents);
          cacheService.set('superadmin_all_students', { version: 'v2', students: transformedStudents }, 10 * 60 * 1000, 'local');
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

  const submitBlacklistStudent = () => {
    if (!blacklistReason.trim() && !selectedStudent.isBlacklisted) {
      showNotification('Please provide a reason for blacklisting', 'error');
      return;
    }

    setModalLoading(true);
    const action = selectedStudent.isBlacklisted
      ? superAdminAPI.unblacklistStudent(selectedStudent.pnr)
      : superAdminAPI.blacklistStudent(selectedStudent.pnr, requestPayloads.blacklistStudent(blacklistReason));

    action
      .then(() => {
        showNotification(
          selectedStudent.isBlacklisted
            ? 'Student unblacklisted successfully'
            : 'Student blacklisted successfully',
          'success'
        );
        setShowBlacklistModal(false);
        setBlacklistReason('');
        cacheService.remove('superadmin_all_students', 'local');
        // Refresh the list
        superAdminAPI.getAllStudents().then((response) => {
          const transformedStudents = apiTransformers.transformStudentsList(response);
          setStudents(transformedStudents);
          cacheService.set('superadmin_all_students', { version: 'v2', students: transformedStudents }, 10 * 60 * 1000, 'local');
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
        <div className="superadmin-students">
          <div className="loading">Loading students...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="superadmin-students">
        <div className="page-header">
          <div className="header-top">
            <button className="btn btn-back" onClick={() => navigate('/superadmin/dashboard')}>
              ← Back to Dashboard
            </button>
            <h1>Student Management</h1>
            <button className="btn btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="filters-section">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or PNR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Students</option>
              <option value="active">Active Students</option>
              <option value="blacklisted">Blacklisted Students</option>
            </select>
          </div>
        </div>

        <div className="students-list">
          {pagedStudents.length === 0 ? (
            <div className="no-data">No students found</div>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>PNR</th>
                  <th>Status</th>
                  <th>Room</th>
                  <th>Application</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedStudents.map((student) => (
                  <tr key={student._id} className={student.isBlacklisted ? 'blacklisted' : ''}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.pnr}</td>
                    <td>
                      <span className={`status-badge ${student.isBlacklisted ? 'blacklisted' : 'active'}`}>
                        {student.isBlacklisted ? 'Blacklisted' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '500' }}>{student.roomNumber || 'N/A'}</span>
                        {student?.floor && (
                          <span style={{ fontSize: '0.85rem', color: '#666' }}>
                            {student.floor}
                          </span>
                        )}
                        {student?.hostelName && (
                          <span style={{ fontSize: '0.85rem', color: '#666' }}>
                            {student.hostelName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {(() => {
                        const status = student?.applicationStatus || 'NOT_APPLIED';
                        const statusUpper = String(status).toUpperCase();
                        const statusClass = statusUpper === 'PENDING'
                          ? 'pending'
                          : statusUpper === 'APPROVED'
                          ? 'approved'
                          : statusUpper === 'REJECTED'
                          ? 'rejected'
                          : 'none';
                        const displayStatus = status === 'NOT_APPLIED' ? 'No Application' : status.toUpperCase();
                        
                        return (
                          <span className={`status-badge ${statusClass}`}>
                            {displayStatus}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="actions-cell">
                      {/* Show Change Room if student has assigned room */}
                      {student.roomNumber ? (
                        <button
                          className="btn btn-sm btn-change-room"
                          onClick={() => handleChangeRoom(student)}
                          title="Change Room"
                        >
                          🔄 Change Room
                        </button>
                      ) : (
                        /* Show Approve and Reject only if student has pending application */
                        student.currentApplication && isPendingStatus(student.currentApplication.status) && (
                          <>
                            <button
                              className="btn btn-sm btn-approve"
                              onClick={() => handleAssignRoom(student)}
                              title="Approve Application (Assign Room)"
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="btn btn-sm btn-reject"
                              onClick={() => handleRejectApplication(student)}
                              title="Reject Application"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )
                      )}
                      {/* Blacklist option is always available */}
                      <button
                        className={`btn btn-sm ${student.isBlacklisted ? 'btn-unblacklist' : 'btn-blacklist'}`}
                        onClick={() => handleBlacklistStudent(student)}
                        title={student.isBlacklisted ? 'Unblacklist' : 'Blacklist'}
                      >
                        {student.isBlacklisted ? '🔓 Unblacklist' : '🔒 Blacklist'}
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

        {/* Assign Room Modal (single instance) */}

        {/* Assign Room Modal */}
        {showAssignRoomModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowAssignRoomModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Assign Room to {selectedStudent?.name}</h2>
              {loadingRooms ? (
                <div className="loading-rooms">Loading available rooms...</div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Select Room *</label>
                    {availableRooms.length > 0 ? (
                      <select
                        value={assignRoomData.roomNumber}
                        onChange={(e) => {
                          const selectedRoom = availableRooms.find(r => (r.roomNumber || r.name) === e.target.value);
                          setAssignRoomData({
                            ...assignRoomData,
                            roomNumber: e.target.value,
                            floor: selectedRoom?.floor || selectedRoom?.floorNumber || '',
                          });
                        }}
                        disabled={modalLoading}
                        className="room-select"
                      >
                        <option value="">Select an available room</option>
                        {availableRooms.map((room) => (
                          <option key={room._id || room.id || room.roomNumber || room.name} value={room.roomNumber || room.name}>
                            Room {room.roomNumber || room.name} - {room.floor || room.floorNumber || 'N/A'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="no-rooms-message">
                        No available rooms found for this student's hostel.
                      </div>
                    )}
                  </div>
                  {/* Floor field removed as per request; floor is auto-set from selected room */}
                </>
              )}
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => submitAssignRoom(false)}
                  disabled={modalLoading || loadingRooms || availableRooms.length === 0}
                >
                  {modalLoading ? 'Assigning...' : 'Assign Room'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAssignRoomModal(false);
                    setAvailableRooms([]);
                  }}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Room Modal */}
        {showChangeRoomModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowChangeRoomModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Change Room for {selectedStudent?.name}</h2>
              <p className="current-room-info">
                Current Room: <strong>{selectedStudent?.roomNumber || 'N/A'} {selectedStudent?.floor ? `(${selectedStudent?.floor})` : ''}</strong> 
                {selectedStudent?.hostelName && <> at <strong>{selectedStudent?.hostelName}</strong></>}
              </p>
              {loadingHostels ? (
                <div className="loading-hostels">Loading available hostels...</div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Select Hostel *</label>
                    {availableHostels.length > 0 ? (
                      <select
                        value={changeRoomData.hostelId}
                        onChange={(e) => handleHostelChangeForRoom(e.target.value)}
                        disabled={modalLoading}
                        className="hostel-select"
                      >
                        <option value="">Select a hostel</option>
                        {availableHostels.map((hostel) => (
                          <option key={hostel._id || hostel.id} value={hostel._id || hostel.id}>
                            {hostel.name} ({hostel.gender || 'N/A'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="no-hostels-message">
                        No hostels available for this student's gender.
                      </div>
                    )}
                  </div>

                  {changeRoomData.hostelId && (
                    <div className="form-group">
                      <label>Select New Room *</label>
                      {loadingRooms ? (
                        <div className="loading-rooms">Loading available rooms...</div>
                      ) : availableRooms.length > 0 ? (
                        <select
                          value={changeRoomData.roomId}
                          onChange={(e) => setChangeRoomData(prev => ({ ...prev, roomId: e.target.value }))}
                          disabled={modalLoading}
                          className="room-select"
                        >
                          <option value="">Select an available room</option>
                          {availableRooms.map((room) => (
                            <option key={room._id || room.id} value={room._id || room.id}>
                              Room {room.roomNumber || room.name} - {room.floor || room.floorNumber || 'N/A'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="no-rooms-message">
                          No available rooms found for this hostel.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={submitChangeRoom}
                  disabled={modalLoading || loadingHostels || loadingRooms || !changeRoomData.hostelId || !changeRoomData.roomId}
                >
                  {modalLoading ? 'Changing...' : 'Change Room'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowChangeRoomModal(false);
                    setAvailableRooms([]);
                    setAvailableHostels([]);
                    setChangeRoomData({ hostelId: '', roomId: '' });
                  }}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Application Modal */}
        {showRejectModal && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Reject Application - {selectedStudent?.name}</h2>
              <div className="form-group">
                <label>Reason for Rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-danger"
                  onClick={submitRejectApplication}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Rejecting...' : 'Reject Application'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blacklist Modal */}
        {showBlacklistModal && (
          <div className="modal-overlay" onClick={() => setShowBlacklistModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {selectedStudent?.isBlacklisted ? 'Unblacklist' : 'Blacklist'} Student -{' '}
                {selectedStudent?.name}
              </h2>
              {!selectedStudent?.isBlacklisted && (
                <div className="form-group">
                  <label>Reason for Blacklisting</label>
                  <textarea
                    value={blacklistReason}
                    onChange={(e) => setBlacklistReason(e.target.value)}
                    placeholder="Enter reason for blacklisting"
                    rows="4"
                  />
                </div>
              )}
              <div className="modal-actions">
                <button
                  className={`btn ${selectedStudent?.isBlacklisted ? 'btn-success' : 'btn-danger'}`}
                  onClick={submitBlacklistStudent}
                  disabled={modalLoading}
                >
                  {modalLoading
                    ? 'Processing...'
                    : selectedStudent?.isBlacklisted
                    ? 'Unblacklist Student'
                    : 'Blacklist Student'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowBlacklistModal(false)}
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

export default SuperAdminStudents;
