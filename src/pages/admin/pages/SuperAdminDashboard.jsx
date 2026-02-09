/* eslint-disable no-constant-binary-expression */
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../component/NotificationContext';
import { superAdminAPI, adminRoomAPI, apiTransformers, errorHandlers } from '../../../lib/api';
import { cacheService } from '../../../lib/services/cacheService';
import Pagination from '../../../component/Pagination';
import Layout from '../../../layout/Layout';

/**
 * Super Admin Dashboard Component with Detailed Views
 * Displays overview statistics and detailed modals for each entity
 * API Reference: GET /api/superadmin/dashboard/detailed
 */
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { adminAuth } = useSelector((state) => state);
  const { showNotification } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [showHostelDetailModal, setShowHostelDetailModal] = useState(false);
  const [hostelDetailLoading, setHostelDetailLoading] = useState(false);
  const [hostelDetailError, setHostelDetailError] = useState('');
  const [hostelDetail, setHostelDetail] = useState(null);
  const [hostelEditMode, setHostelEditMode] = useState(false);
  const [hostelEditData, setHostelEditData] = useState({
    name: '',
    address: '',
    location: '',
    capacity: '',
    warden: '',
    wardenPhone: '',
    gender: '',
    rentPerMonth: '',
    description: ''
  });
  const [showChangeAdminModal, setShowChangeAdminModal] = useState(false);
  const [hostelChangeAdminId, setHostelChangeAdminId] = useState('');
  const [roomStatusSelections, setRoomStatusSelections] = useState({});
  const [roomStatusUpdatingId, setRoomStatusUpdatingId] = useState(null);

  // For room hierarchy navigation
  const [roomView, setRoomView] = useState('hostels'); // 'hostels', 'floors', 'rooms'
  const [selectedHostelForRooms, setSelectedHostelForRooms] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [roomStatusFilter, setRoomStatusFilter] = useState('all'); // 'all', 'available', 'occupied', 'damaged'
  
  // For room assignment
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [selectedRoomForAssignment, setSelectedRoomForAssignment] = useState(null);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // For change room functionality
  const [showChangeRoomModal, setShowChangeRoomModal] = useState(false);
  const [showReassignRoomModal, setShowReassignRoomModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableHostels, setAvailableHostels] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingHostels, setLoadingHostels] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [changeRoomData, setChangeRoomData] = useState({
    hostelId: '',
    roomId: '',
  });

  // For students filters
  const [studentFilterHostel, setStudentFilterHostel] = useState('all');
  const [studentFilterGender, setStudentFilterGender] = useState('all');

  const fetchDashboardData = useCallback(() => {
    setLoading(true);
    const cacheKey = 'superadmin_dashboard_detailed';
    const cachedData = cacheService.get(cacheKey, 'local');

    if (cachedData) {
      setDashboardData(cachedData);
      setLoading(false);
      return;
    }

    superAdminAPI
      .getDashboardDetailed()
      .then((response) => {
        const data = response.data || response;
        setDashboardData(data);
        cacheService.set(cacheKey, data, 5 * 60 * 1000, 'local');
      })
      .catch((err) => {
        const errorMsg = errorHandlers.parseError(err);
        showNotification(errorMsg, 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [showNotification]);

  useEffect(() => {
    if (!adminAuth.isAuthenticated || adminAuth.role !== 'superadmin') {
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [adminAuth.isAuthenticated, adminAuth.role, navigate, fetchDashboardData]);

  const openHostelDetailModal = (hostelId) => {
    setShowHostelDetailModal(true);
    setHostelDetailLoading(true);
    setHostelDetailError('');
    setHostelDetail(null);
    setHostelEditMode(false);
    setHostelChangeAdminId('');

    superAdminAPI
      .getHostelById(hostelId)
      .then((response) => {
        const data = response?.data?.hostel || response?.data || response;
        setHostelDetail(data);
        setHostelEditData({
          name: data?.name || '',
          address: data?.address || '',
          location: data?.location || '',
          capacity: data?.capacity || '',
          warden: data?.warden || '',
          wardenPhone: data?.wardenPhone || '',
          gender: data?.gender || '',
          rentPerMonth: data?.rentPerMonth || '',
          description: data?.description || ''
        });
      })
      .catch((err) => {
        setHostelDetailError(errorHandlers.parseError(err));
      })
      .finally(() => {
        setHostelDetailLoading(false);
      });
  };

  const closeHostelDetailModal = () => {
    setShowHostelDetailModal(false);
    setHostelDetail(null);
    setHostelDetailError('');
    setHostelEditMode(false);
    setHostelChangeAdminId('');
  };

  const refreshHostelDetail = (hostelId) => {
    setHostelDetailLoading(true);
    superAdminAPI
      .getHostelById(hostelId)
      .then((response) => {
        const data = response?.data?.hostel || response?.data || response;
        setHostelDetail(data);
        setHostelEditData({
          name: data?.name || '',
          address: data?.address || '',
          location: data?.location || '',
          capacity: data?.capacity || '',
          warden: data?.warden || '',
          wardenPhone: data?.wardenPhone || '',
          gender: data?.gender || '',
          rentPerMonth: data?.rentPerMonth || '',
          description: data?.description || ''
        });
      })
      .catch((err) => {
        setHostelDetailError(errorHandlers.parseError(err));
      })
      .finally(() => {
        setHostelDetailLoading(false);
      });
  };

  const handleHostelUpdate = () => {
    if (!hostelDetail?._id) return;

    setModalLoading(true);
    superAdminAPI
      .updateHostel(hostelDetail._id, hostelEditData)
      .then(() => {
        showNotification('Hostel updated successfully', 'success');
        setHostelEditMode(false);
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
        refreshHostelDetail(hostelDetail._id);
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleHostelDelete = () => {
    if (!hostelDetail?._id) return;
    if (!window.confirm(`Delete hostel ${hostelDetail?.name || ''}? This cannot be undone.`)) {
      return;
    }

    setModalLoading(true);
    superAdminAPI
      .deleteHostel(hostelDetail._id)
      .then(() => {
        showNotification('Hostel deleted successfully', 'success');
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
        closeHostelDetailModal();
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleHostelDisableToggle = () => {
    if (!hostelDetail?._id) return;

    const isDisabled = hostelDetail?.isDisabled;
    const reason = isDisabled ? null : window.prompt('Reason for disabling this hostel (optional):');
    if (reason === null && !isDisabled) return;

    setModalLoading(true);
    const action = isDisabled
      ? superAdminAPI.enableHostel(hostelDetail._id)
      : superAdminAPI.disableHostel(hostelDetail._id, reason ? { reason } : {});

    action
      .then(() => {
        showNotification(isDisabled ? 'Hostel enabled' : 'Hostel disabled', 'success');
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
        refreshHostelDetail(hostelDetail._id);
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleHostelChangeAdmin = () => {
    if (!hostelDetail?._id || !hostelChangeAdminId) return;

    setModalLoading(true);
    superAdminAPI
      .changeHostelAdmin(hostelDetail._id, { adminId: hostelChangeAdminId })
      .then(() => {
        showNotification('Hostel admin changed successfully', 'success');
        setHostelChangeAdminId('');
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
        refreshHostelDetail(hostelDetail._id);
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleRoomStatusChange = (room, status) => {
    if (!selectedHostelForRooms?._id || !room?._id || !status) return;
    setRoomStatusUpdatingId(room._id);
    superAdminAPI
      .changeRoomStatus(selectedHostelForRooms._id, room._id, { status })
      .then(() => {
        showNotification('Room status updated successfully', 'success');
        // Clear the selection to show updated status from API
        setRoomStatusSelections((prev) => {
          const updated = { ...prev };
          delete updated[room._id];
          return updated;
        });
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setRoomStatusUpdatingId(null);
      });
  };

  const openModal = (modalType) => {
    setActiveModal(modalType);
    setPage(1);
    setSearchTerm('');
    
    // Reset room hierarchy when opening rooms modal
    if (modalType === 'rooms' || modalType === 'occupied-rooms' || modalType === 'available-rooms') {
      setRoomView('hostels');
      setSelectedHostelForRooms(null);
      setSelectedFloor(null);
      setRoomStatusFilter(modalType === 'occupied-rooms' ? 'occupied' : modalType === 'available-rooms' ? 'available' : 'all');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setPage(1);
    setSearchTerm('');
    setRoomView('hostels');
    setSelectedHostelForRooms(null);
    setSelectedFloor(null);
    setRoomStatusFilter('all');
  };

  const handleHostelClickInRoomView = (hostel) => {
    setSelectedHostelForRooms(hostel);
    setRoomView('floors');
  };

  const handleFloorClick = (floor) => {
    setSelectedFloor(floor);
    setRoomView('rooms');
  };

  const handleBackToHostels = () => {
    setRoomView('hostels');
    setSelectedHostelForRooms(null);
    setSelectedFloor(null);
  };

  const handleBackToFloors = () => {
    setRoomView('floors');
    setSelectedFloor(null);
  };

  const handleRoomClick = (room) => {
    // Check if room is available
    const availableSeats = room.capacity - (room.occupiedBeds || 0);
    if (availableSeats > 0 && !room.isDamaged) {
      setSelectedRoomForAssignment(room);
      loadPendingApplications(selectedHostelForRooms._id);
    }
  };

  const loadPendingApplications = (hostelId) => {
    setLoadingApplications(true);
    setShowAssignRoomModal(true);
    
    // Get pending applications from dashboard data
    const allApplications = dashboardData?.pendingApplications || [];
    const pending = allApplications.filter(
      app => (app.hostelId?._id === hostelId || app.hostelId === hostelId)
    );
    setPendingApplications(pending);
    setLoadingApplications(false);
  };

  const handleAssignStudentToRoom = (application) => {
    if (!selectedRoomForAssignment || !application) return;

    setModalLoading(true);
    
    // Assign student to room using change room API
    superAdminAPI
      .changeStudentRoom(application.studentId?.pnr || application.pnr, {
        hostelId: selectedHostelForRooms._id,
        roomId: selectedRoomForAssignment._id
      })
      .then(() => {
        showNotification('Student assigned to room successfully', 'success');
        setShowAssignRoomModal(false);
        setSelectedRoomForAssignment(null);
        setPendingApplications([]);
        
        // Refresh dashboard data
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const getFloorsFromRooms = (rooms) => {
    const floors = {};
    rooms.forEach(room => {
      const floor = room.floor || room.floorNumber || '1';
      if (!floors[floor]) {
        floors[floor] = {
          floor,
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          damagedRooms: 0,
          rooms: []
        };
      }
      floors[floor].totalRooms++;
      floors[floor].rooms.push(room);
      
      const availableSeats = room.capacity - (room.occupiedBeds || 0);
      if (room.isDamaged) {
        floors[floor].damagedRooms++;
      } else if (availableSeats === 0) {
        floors[floor].occupiedRooms++;
      } else {
        floors[floor].availableRooms++;
      }
    });
    return Object.values(floors).sort((a, b) => a.floor - b.floor);
  };

  const getModalData = () => {
    if (!dashboardData || !activeModal) return [];
    
    let data = [];
    switch (activeModal) {
      case 'students':
        data = dashboardData.totalStudents || [];
        break;
      case 'admins':
        data = dashboardData.totalAdmins || [];
        break;
      case 'hostels':
        data = dashboardData.totalHostels || [];
        break;
      case 'rooms':
        data = dashboardData.totalRooms || [];
        break;
      case 'occupied-rooms':
        data = dashboardData.occupiedRooms || [];
        break;
      case 'available-rooms':
        data = dashboardData.availableRooms || [];
        break;
      case 'pending-applications':
        data = dashboardData.pendingApplications || [];
        break;
      case 'approved-applications':
        data = dashboardData.approvedApplications || [];
        break;
      case 'rejected-applications':
        data = dashboardData.rejectedApplications || [];
        break;
      case 'blacklisted':
        data = dashboardData.blacklistedStudents || [];
        break;
      default:
        data = [];
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // For rooms, search only by hostel name
      if (activeModal === 'rooms' || activeModal === 'occupied-rooms' || activeModal === 'available-rooms') {
        data = data.filter(item => {
          const hostelName = item.hostelId?.name || '';
          return hostelName.toLowerCase().includes(searchLower);
        });
      } else {
        // For other modals, search by multiple fields
        data = data.filter(item => {
          return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.email?.toLowerCase().includes(searchLower) ||
            item.pnr?.toLowerCase().includes(searchLower) ||
            item.adminId?.toLowerCase().includes(searchLower) ||
            item.location?.toLowerCase().includes(searchLower)
          );
        });
      }
    }

    return data;
  };

  const paginatedData = () => {
    const data = getModalData();
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  };

  const handleChangeRoom = async (student) => {
    setSelectedStudent(student);
    setChangeRoomData({ hostelId: '', roomId: '' });
    setAvailableRooms([]);
    setShowChangeRoomModal(true);
    closeModal();
    
    try {
      setLoadingHostels(true);
      const response = await superAdminAPI.getStudentByPNR(student.pnr);
      const studentDetails = apiTransformers.transformStudentDetail(response);
      
      const hostelsResponse = await superAdminAPI.getAllHostels();
      let allHostels = [];
      
      if (hostelsResponse?.data?.hostels && Array.isArray(hostelsResponse.data.hostels)) {
        allHostels = hostelsResponse.data.hostels;
      } else if (Array.isArray(hostelsResponse)) {
        allHostels = hostelsResponse;
      }
      
      const studentGender = studentDetails.gender || student.gender;
      const filteredHostels = allHostels.filter(hostel => 
        hostel.gender?.toLowerCase() === studentGender?.toLowerCase()
      );
      
      setAvailableHostels(filteredHostels);
      
      let currentHostelId = '';
      if (studentDetails?.assignedRoom?.hostelId) {
        currentHostelId = typeof studentDetails.assignedRoom.hostelId === 'object'
          ? (studentDetails.assignedRoom.hostelId._id || studentDetails.assignedRoom.hostelId.id)
          : studentDetails.assignedRoom.hostelId;
      }
      
      if (currentHostelId) {
        setChangeRoomData({ hostelId: currentHostelId, roomId: '' });
        setLoadingHostels(false);
        setLoadingRooms(true);
        
        const resp = await adminRoomAPI.getAvailableRooms(currentHostelId);
        let roomsData = [];
        if (Array.isArray(resp)) roomsData = resp;
        else if (resp?.data?.rooms) roomsData = resp.data.rooms;
        
        setAvailableRooms(roomsData);
        setLoadingRooms(false);
      }
    } catch (err) {
      showNotification(errorHandlers.parseError(err), 'error');
    } finally {
      setLoadingHostels(false);
    }
  };

  const handleReassignRoom = async (student) => {
    setSelectedStudent(student);
    setChangeRoomData({ hostelId: '', roomId: '' });
    setAvailableRooms([]);
    setShowReassignRoomModal(true);
    closeModal();

    try {
      setLoadingHostels(true);
      const response = await superAdminAPI.getStudentByPNR(student.pnr);
      const studentDetails = apiTransformers.transformStudentDetail(response);

      const hostelsResponse = await superAdminAPI.getAllHostels();
      let allHostels = [];

      if (hostelsResponse?.data?.hostels && Array.isArray(hostelsResponse.data.hostels)) {
        allHostels = hostelsResponse.data.hostels;
      } else if (Array.isArray(hostelsResponse)) {
        allHostels = hostelsResponse;
      }

      const studentGender = studentDetails.gender || student.gender;
      const filteredHostels = allHostels.filter(hostel =>
        hostel.gender?.toLowerCase() === studentGender?.toLowerCase()
      );

      setAvailableHostels(filteredHostels);
    } catch (err) {
      showNotification(errorHandlers.parseError(err), 'error');
    } finally {
      setLoadingHostels(false);
    }
  };

  const handleHostelChange = async (hostelId) => {
    setChangeRoomData(prev => ({ ...prev, hostelId, roomId: '' }));
    setAvailableRooms([]);
    
    if (!hostelId) return;
    
    try {
      setLoadingRooms(true);
      const resp = await adminRoomAPI.getAvailableRooms(hostelId);
      let roomsData = [];
      if (Array.isArray(resp)) roomsData = resp;
      else if (resp?.data?.rooms) roomsData = resp.data.rooms;
      
      setAvailableRooms(roomsData);
    } catch (err) {
      showNotification(errorHandlers.parseError(err), 'error');
    } finally {
      setLoadingRooms(false);
    }
  };

  const submitChangeRoom = () => {
    if (!changeRoomData.hostelId || !changeRoomData.roomId) {
      showNotification('Please select both hostel and room', 'error');
      return;
    }

    setModalLoading(true);
    superAdminAPI
      .changeStudentRoom(selectedStudent.pnr, changeRoomData)
      .then(() => {
        showNotification('Room changed successfully', 'success');
        setShowChangeRoomModal(false);
        setChangeRoomData({ hostelId: '', roomId: '' });
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const submitReassignRoom = () => {
    if (!changeRoomData.hostelId || !changeRoomData.roomId) {
      showNotification('Please select both hostel and room', 'error');
      return;
    }

    setModalLoading(true);
    superAdminAPI
      .reassignStudentRoom(selectedStudent.pnr, {
        hostelId: changeRoomData.hostelId,
        roomId: changeRoomData.roomId,
        remark: 'Student room reassigned by admin',
      })
      .then(() => {
        showNotification('Room reassigned successfully', 'success');
        setShowReassignRoomModal(false);
        setChangeRoomData({ hostelId: '', roomId: '' });
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleBlacklistToggle = (student) => {
    if (!window.confirm(`Are you sure you want to ${student.isBlacklisted ? 'unblacklist' : 'blacklist'} ${student.name}?`)) {
      return;
    }

    setModalLoading(true);
    const action = student.isBlacklisted
      ? superAdminAPI.unblacklistStudent(student.pnr)
      : superAdminAPI.blacklistStudent(student.pnr, { reason: 'Blacklisted by admin' });

    action
      .then(() => {
        showNotification(
          student.isBlacklisted ? 'Student unblacklisted' : 'Student blacklisted',
          'success'
        );
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleRemoveStudentFromRoom = (student) => {
    const studentName = student?.name || 'this student';
    if (!window.confirm(`Remove ${studentName} from the room?`)) {
      return;
    }

    setModalLoading(true);
    superAdminAPI
      .removeStudentFromRoom(student.pnr, {
        remark: 'Student is removed from room by admin',
      })
      .then(() => {
        showNotification('Student removed from room', 'success');
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleDisableAdmin = (admin) => {
    if (!window.confirm(`Are you sure you want to ${admin.isDisabled ? 'enable' : 'disable'} ${admin.name}?`)) {
      return;
    }

    setModalLoading(true);
    const action = admin.isDisabled
      ? superAdminAPI.enableAdmin(admin._id)
      : superAdminAPI.disableAdmin(admin._id, { reason: 'Disabled by super admin' });

    action
      .then(() => {
        showNotification(
          admin.isDisabled ? 'Admin enabled' : 'Admin disabled',
          'success'
        );
        cacheService.remove('superadmin_dashboard_detailed', 'local');
        fetchDashboardData();
      })
      .catch((err) => {
        showNotification(errorHandlers.parseError(err), 'error');
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const renderModalContent = () => {
    const data = paginatedData();
    
    if (!activeModal || data.length === 0) {
      return <div className="no-data">No data available</div>;
    }

    switch (activeModal) {
      case 'students': {
        // Get unique hostels for filter
        const studentHostelsSet = new Set();
        dashboardData?.totalStudents?.forEach(student => {
          const room = dashboardData?.totalRooms?.find(
            r => r.roomNumber === student.roomNumber && 
            r.studentDetails?.some(sd => sd.pnr === student.pnr)
          );
          if (room && room.hostelId) {
            const hostelName = typeof room.hostelId === 'string' ? room.hostelId : room.hostelId?.name;
            if (hostelName) {
              studentHostelsSet.add(hostelName);
            }
          }
        });
        const studentHostels = Array.from(studentHostelsSet).sort() || [];
        
        // Apply filters
        let filteredStudents = data;
        if (studentFilterHostel !== 'all') {
          filteredStudents = filteredStudents.filter(student => {
            const studentRoom = dashboardData?.totalRooms?.find(
              room => room.roomNumber === student.roomNumber && 
              room.studentDetails?.some(s => s.pnr === student.pnr)
            );
            return studentRoom?.hostelId?.name === studentFilterHostel;
          });
        }
        if (studentFilterGender !== 'all') {
          filteredStudents = filteredStudents.filter(student => student.gender?.toLowerCase() === studentFilterGender.toLowerCase());
        }
        
        return (
          <div>
            <div className="student-filters">
              <div className="filter-group">
                <label>Filter by Hostel:</label>
                <select 
                  value={studentFilterHostel} 
                  onChange={(e) => {
                    setStudentFilterHostel(e.target.value);
                    setPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="all">All Hostels</option>
                  {studentHostels.map((hostel) => (
                    <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Filter by Gender:</label>
                <select 
                  value={studentFilterGender} 
                  onChange={(e) => {
                    setStudentFilterGender(e.target.value);
                    setPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setStudentFilterHostel('all');
                  setStudentFilterGender('all');
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>PNR</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  // Find the room details from totalRooms if available
                  const roomDetails = dashboardData?.totalRooms?.find(
                    room => room.roomNumber === student.roomNumber && 
                    room.studentDetails?.some(s => s.pnr === student.pnr)
                  );
                  const roomDisplay = student.roomNumber ? 
                    `${roomDetails?.hostelId?.name || 'N/A'} - Room ${student.roomNumber}${roomDetails?.floor ? ` (${roomDetails.floor})` : ''}` : 
                    'Not Assigned';
                  
                  return (
                  <tr key={student.pnr || student._id}>
                    <td>{student.pnr}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.gender}</td>
                    <td>{roomDisplay}</td>
                    <td>
                      <span className={`status-badge ${student.applicationStatus?.toLowerCase()}`}>
                        {student.applicationStatus || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {student.roomNumber && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleChangeRoom(student)}
                            title="Change Room"
                          >
                            🔄 Change Room
                          </button>
                        )}
                        {student.applicationStatus?.toUpperCase() === 'DISALLOWCATED' && (
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleReassignRoom(student)}
                            title="Reassign Room"
                          >
                            ♻️ Reassign Room
                          </button>
                        )}
                        <button
                          className={`btn btn-sm ${student.isBlacklisted ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => handleBlacklistToggle(student)}
                          title={student.isBlacklisted ? 'Unblacklist' : 'Blacklist'}
                        >
                          {student.isBlacklisted ? '🔓 Unblacklist' : '🔒 Blacklist'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }

      case 'admins':
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Admin ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Hostels</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.adminId}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.phone}</td>
                  <td>{admin.hostels?.length || 0}</td>
                  <td>
                    <span className={`status-badge ${admin.isDisabled ? 'disabled' : 'active'}`}>
                      {admin.isDisabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${admin.isDisabled ? 'btn-success' : 'btn-warning'}`}
                      onClick={() => handleDisableAdmin(admin)}
                    >
                      {admin.isDisabled ? 'Enable' : 'Disable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'hostels':
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Gender</th>
                <th>Capacity</th>
                <th>Available</th>
                <th>Warden</th>
                <th>Rent/Month</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((hostel) => (
                <tr key={hostel._id}>
                  <td>{hostel.name}</td>
                  <td>{hostel.location || hostel.address}</td>
                  <td>{hostel.gender}</td>
                  <td>{hostel.capacity}</td>
                  <td>{hostel.availableRooms}</td>
                  <td>{hostel.warden}</td>
                  <td>₹{hostel.rentPerMonth}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => openHostelDetailModal(hostel._id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'rooms':
      case 'occupied-rooms':
      case 'available-rooms':
        // Hierarchical view: Hostels → Floors → Rooms
        if (roomView === 'hostels') {
          // Show list of hostels
          let hostels = dashboardData?.allHostels || dashboardData?.totalHostels || [];
          
          // Apply search filter on hostel names
          if (searchTerm) {
            hostels = hostels.filter(hostel => 
              hostel.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          return (
            <div className="rooms-hierarchy-view">
              <div className="room-filters">
                <button
                  className={`filter-btn ${roomStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setRoomStatusFilter('all')}
                >
                  All Rooms
                </button>
                <button
                  className={`filter-btn ${roomStatusFilter === 'available' ? 'active' : ''}`}
                  onClick={() => setRoomStatusFilter('available')}
                >
                  🟢 Available
                </button>
                <button
                  className={`filter-btn ${roomStatusFilter === 'occupied' ? 'active' : ''}`}
                  onClick={() => setRoomStatusFilter('occupied')}
                >
                  🔴 Occupied
                </button>
                <button
                  className={`filter-btn ${roomStatusFilter === 'damaged' ? 'active' : ''}`}
                  onClick={() => setRoomStatusFilter('damaged')}
                >
                  ⚠️ Damaged
                </button>
              </div>
              
              <div className="hostels-list-grid">
                {hostels.map((hostel) => {
                  const hostelRooms = dashboardData.totalRooms?.filter(r => r.hostelId?._id === hostel._id || r.hostelId === hostel._id) || [];
                  const totalRooms = hostelRooms.length;
                  const occupiedRooms = hostelRooms.filter(r => (r.capacity - (r.occupiedBeds || 0)) === 0).length;
                  const availableRooms = hostelRooms.filter(r => (r.capacity - (r.occupiedBeds || 0)) > 0 && !r.isDamaged).length;
                  const damagedRooms = hostelRooms.filter(r => r.isDamaged).length;
                  
                  return (
                    <div
                      key={hostel._id}
                      className="hostel-card clickable"
                      onClick={() => handleHostelClickInRoomView(hostel)}
                    >
                      <div className="hostel-card-header">
                        <h3>{hostel.name}</h3>
                        <span className="hostel-gender-badge">{hostel.gender}</span>
                      </div>
                      <div className="hostel-card-stats">
                        <div className="stat-item">
                          <span className="stat-label">Total Rooms:</span>
                          <span className="stat-value">{totalRooms}</span>
                        </div>
                        <div className="stat-item available">
                          <span className="stat-label">Available:</span>
                          <span className="stat-value">{availableRooms}</span>
                        </div>
                        <div className="stat-item occupied">
                          <span className="stat-label">Occupied:</span>
                          <span className="stat-value">{occupiedRooms}</span>
                        </div>
                        {damagedRooms > 0 && (
                          <div className="stat-item damaged">
                            <span className="stat-label">Damaged:</span>
                            <span className="stat-value">{damagedRooms}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        } else if (roomView === 'floors' && selectedHostelForRooms) {
          // Show floors of selected hostel
          const hostelRooms = dashboardData.totalRooms?.filter(r => 
            r.hostelId?._id === selectedHostelForRooms._id || r.hostelId === selectedHostelForRooms._id
          ) || [];
          const floors = getFloorsFromRooms(hostelRooms);
          
          return (
            <div className="rooms-hierarchy-view">
              <div className="breadcrumb">
                <button onClick={handleBackToHostels} className="breadcrumb-btn">
                  ← Back to Hostels
                </button>
                <span className="breadcrumb-current">{selectedHostelForRooms.name}</span>
              </div>
              
              <div className="floors-grid">
                {floors.map((floorData) => (
                  <div
                    key={floorData.floor}
                    className="floor-card clickable"
                    onClick={() => handleFloorClick(floorData.floor)}
                  >
                    <div className="floor-header">
                      <h3>Floor {floorData.floor}</h3>
                    </div>
                    <div className="floor-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Rooms:</span>
                        <span className="stat-value">{floorData.totalRooms}</span>
                      </div>
                      <div className="stat-item available">
                        <span className="stat-label">Available:</span>
                        <span className="stat-value">{floorData.availableRooms}</span>
                      </div>
                      <div className="stat-item occupied">
                        <span className="stat-label">Occupied:</span>
                        <span className="stat-value">{floorData.occupiedRooms}</span>
                      </div>
                      {floorData.damagedRooms > 0 && (
                        <div className="stat-item damaged">
                          <span className="stat-label">Damaged:</span>
                          <span className="stat-value">{floorData.damagedRooms}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (roomView === 'rooms' && selectedFloor) {
          // Show rooms of selected floor
          const hostelRooms = dashboardData.totalRooms?.filter(r => 
            (r.hostelId?._id === selectedHostelForRooms._id || r.hostelId === selectedHostelForRooms._id) &&
            (r.floor === selectedFloor || r.floorNumber === selectedFloor)
          ) || [];
          
          // Apply filter
          const filteredRooms = hostelRooms.filter(room => {
            const availableSeats = room.capacity - (room.occupiedBeds || 0);
            if (roomStatusFilter === 'available') return availableSeats > 0 && !room.isDamaged;
            if (roomStatusFilter === 'occupied') return availableSeats === 0 && !room.isDamaged;
            if (roomStatusFilter === 'damaged') return room.isDamaged;
            return true;
          });
          
          return (
            <div className="rooms-hierarchy-view">
              <div className="breadcrumb">
                <button onClick={handleBackToHostels} className="breadcrumb-btn">
                  Hostels
                </button>
                <span className="breadcrumb-separator">→</span>
                <button onClick={handleBackToFloors} className="breadcrumb-btn">
                  {selectedHostelForRooms.name}
                </button>
                <span className="breadcrumb-separator">→</span>
                <span className="breadcrumb-current"> {selectedFloor}</span>
              </div>
              
              <div className="room-filters">
                <button
                  className={`filter-btn ${roomStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setRoomStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${roomStatusFilter === 'available' ? 'active' : ''}`}
                  onClick={() => setRoomStatusFilter('available')}
                >
                  🟢 Available
                </button>
                <button
                  className={`filter-btn ${roomStatusFilter === 'occupied' ? 'active' : ''}`}
                  onClick={() => setRoomStatusFilter('occupied')}
                >
                  🔴 Occupied
                </button>
                <button
                  className={`filter-btn ${roomStatusFilter === 'damaged' ? 'active' : ''}`}
                  onClick={() => setRoomStatusFilter('damaged')}
                >
                  ⚠️ Damaged
                </button>
              </div>
              
              <div className="rooms-grid-floor">
                {filteredRooms.length === 0 ? (
                  <div className="no-rooms-message">No rooms found with selected filter</div>
                ) : (
                  filteredRooms.map((room) => {
                    const availableSeats = room.capacity - (room.occupiedBeds || 0);
                    const isFullyOccupied = availableSeats === 0;
                    const isDamaged = room.isDamaged;
                    const students = room.studentDetails || [];
                    const currentStatus = room.status || (isDamaged ? 'damaged' : isFullyOccupied ? 'occupied' : 'available');
                    const selectedStatus = roomStatusSelections[room._id] || currentStatus;
                    
                    return (
                      <div
                        key={room._id}
                        className={`room-card-detailed ${isDamaged ? 'damaged' : isFullyOccupied ? 'occupied' : 'available'}`}
                        onClick={() => !isDamaged && !isFullyOccupied && handleRoomClick(room)}
                        style={{ cursor: !isDamaged && !isFullyOccupied ? 'pointer' : 'default' }}
                      >
                        <div className="room-header-info">
                          <div className="hostel-name-small">{selectedHostelForRooms?.name || 'N/A'}</div>
                          <div className="floor-info">{room.floor || 'N/A'}</div>
                        </div>
                        <div className="room-number-large">
                          Room {room.roomNumber}
                        </div>
                        <div className="room-capacity-info">
                          <span className="occupied-count">{room.occupiedBeds || 0}</span>
                          <span className="capacity-separator">/</span>
                          <span className="total-capacity">{room.capacity}</span>
                        </div>
                        <div className="room-status-control" onClick={(e) => e.stopPropagation()}>
                          <select
                            className="filter-select room-status-select"
                            value={selectedStatus}
                            onChange={(e) =>
                              setRoomStatusSelections((prev) => ({
                                ...prev,
                                [room._id]: e.target.value,
                              }))
                            }
                            disabled={roomStatusUpdatingId === room._id || students.length > 0}
                            title={students.length > 0 ? 'Cannot change status: Room has assigned students' : 'Select room status'}
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="damaged">Damaged</option>
                          </select>
                          <button
                            className="btn btn-sm btn-secondary room-status-btn"
                            onClick={() => handleRoomStatusChange(room, selectedStatus)}
                            disabled={roomStatusUpdatingId === room._id || selectedStatus === currentStatus || students.length > 0}
                            title={students.length > 0 ? 'Cannot change status: Room has assigned students' : 'Update Room Status'}
                          >
                            {roomStatusUpdatingId === room._id ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                        {isDamaged || selectedStatus === 'damaged' || selectedStatus === 'maintenance' ? (
                          <div className={`room-status-label ${selectedStatus === 'maintenance' ? 'maintenance' : 'damaged'}`}>
                            {selectedStatus === 'maintenance' ? '🔧 Under Maintenance' : '⚠️ Damaged'}
                          </div>
                        ) : isFullyOccupied ? (
                          <>
                            <div className="room-status-label occupied">
                              🔴 Occupied
                            </div>
                            {students.length > 0 && (
                              <div className="room-students">
                                {students.map((student, idx) => (
                                  <div key={idx} className="student-name-chip">
                                    <span className="student-name-text">{student.name || 'Unknown'}</span>
                                    <button
                                      type="button"
                                      className="remove-student-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveStudentFromRoom(student);
                                      }}
                                      title="Remove from room"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="room-status-label available">
                              🟢 {availableSeats} Free
                            </div>
                            {students.length > 0 && (
                              <div className="room-students">
                                {students.map((student, idx) => (
                                  <div key={idx} className="student-name-chip">
                                    <span className="student-name-text">{student.name || 'Unknown'}</span>
                                    <button
                                      type="button"
                                      className="remove-student-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveStudentFromRoom(student);
                                      }}
                                      title="Remove from room"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {selectedStatus !== 'maintenance' && selectedStatus !== 'damaged' && currentStatus !== 'maintenance' && currentStatus !== 'damaged' && (
                              <button
                                className="btn btn-assign-room"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRoomClick(room);
                                }}
                              >
                                👤 Assign Student
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        }
        
        return <div className="no-data">Loading rooms...</div>;

      case 'pending-applications':
      case 'approved-applications':
      case 'rejected-applications':
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Hostel</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {data.map((app) => (
                <tr key={app._id}>
                  <td>{app.studentId?.name || app.pnr}</td>
                  <td>{app.hostelId?.name || 'N/A'}</td>
                  <td>{new Date(app.appliedOn || app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${app.status?.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{`${app?.roomNumber} (${app.floor})` || 'Not Assigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'blacklisted':
        return (
          <table className="data-table">
            <thead>
              <tr>
                <th>PNR</th>
                <th>Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((student) => (
                <tr key={student.pnr || student._id}>
                  <td>{student.pnr}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.gender}</td>
                  <td>{student.blacklistReason || 'N/A'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleBlacklistToggle(student)}
                    >
                      🔓 Unblacklist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return <div className="no-data">Select a metric to view details</div>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            Failed to load dashboard data
          </div>
        </div>
      </Layout>
    );
  }

  const getModalTitle = () => {
    switch (activeModal) {
      case 'students': return 'All Students';
      case 'admins': return 'All Admins';
      case 'hostels': return 'All Hostels';
      case 'rooms': return 'All Rooms';
      case 'occupied-rooms': return 'Occupied Rooms';
      case 'available-rooms': return 'Available Rooms';
      case 'pending-applications': return 'Pending Applications';
      case 'approved-applications': return 'Approved Applications';
      case 'rejected-applications': return 'Rejected Applications';
      case 'blacklisted': return 'Blacklisted Students';
      default: return '';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
              <p className="text-purple-100 mt-1">Comprehensive overview and management</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-150 text-sm" 
                onClick={() => navigate('/superadmin/students')}
              >
                Manage Students
              </button>
              <button 
                className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-150 text-sm" 
                onClick={() => navigate('/superadmin/hostels')}
              >
                Manage Hostels
              </button>
              <button 
                className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-150 text-sm" 
                onClick={() => navigate('/superadmin/admins')}
              >
                Manage Admins
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-purple-500 group"
            onClick={() => openModal('students')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">👥</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{dashboardData.totalStudentsCount || 0}</h3>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-purple-500 group"
            onClick={() => openModal('admins')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">👨‍💼</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{dashboardData.totalAdminsCount || 0}</h3>
                <p className="text-sm text-gray-600">Total Admins</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-purple-500 group"
            onClick={() => openModal('hostels')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🏢</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{dashboardData.totalHostelsCount || 0}</h3>
                <p className="text-sm text-gray-600">Total Hostels</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-purple-500 group"
            onClick={() => openModal('rooms')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🚪</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{dashboardData.totalRoomsCount || 0}</h3>
                <p className="text-sm text-gray-600">Total Rooms</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-red-500 group"
            onClick={() => openModal('occupied-rooms')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🔴</div>
              <div>
                <h3 className="text-3xl font-bold text-red-600">{dashboardData.occupiedRoomsCount || 0}</h3>
                <p className="text-sm text-gray-600">Occupied Rooms</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-orange-500 group"
            onClick={() => openModal('pending-applications')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">⏳</div>
              <div>
                <h3 className="text-3xl font-bold text-orange-600">{dashboardData.pendingApplicationsCount || 0}</h3>
                <p className="text-sm text-gray-600">Pending Applications</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-green-500 group"
            onClick={() => openModal('approved-applications')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">✅</div>
              <div>
                <h3 className="text-3xl font-bold text-green-600">{dashboardData.approvedApplicationsCount || 0}</h3>
                <p className="text-sm text-gray-600">Approved Applications</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-red-500 group"
            onClick={() => openModal('rejected-applications')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">❌</div>
              <div>
                <h3 className="text-3xl font-bold text-red-600">{dashboardData.rejectedApplicationsCount || 0}</h3>
                <p className="text-sm text-gray-600">Rejected Applications</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-gray-700 group"
            onClick={() => openModal('blacklisted')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🔒</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{dashboardData.blacklistedStudentsCount || 0}</h3>
                <p className="text-sm text-gray-600">Blacklisted Students</p>
              </div>
            </div>
          </div>
        </div>

        {activeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{getModalTitle()}</h2>
                <button 
                  className="text-white hover:text-gray-200 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors" 
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-filters">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="modal-body">
                {renderModalContent()}
              </div>

              {/* Only show pagination for non-room views */}
              {getModalData().length > pageSize && 
               activeModal !== 'rooms' && 
               activeModal !== 'occupied-rooms' && 
               activeModal !== 'available-rooms' && (
                <div className="modal-footer">
                  <Pagination
                    currentPage={page}
                    totalItems={getModalData().length}
                    onPageChange={setPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {showHostelDetailModal && (
          <div className="modal-overlay" onClick={closeHostelDetailModal}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Hostel Details</h2>
                <button className="close-btn" onClick={closeHostelDetailModal}>×</button>
              </div>
              <div className="modal-body">
                {hostelDetailLoading ? (
                  <div className="loading">Loading hostel details...</div>
                ) : hostelDetailError ? (
                  <div className="error">{hostelDetailError}</div>
                ) : hostelDetail ? (
                  <div className="hostel-detail-content">
                    {!hostelEditMode ? (
                      <div className="hostel-detail-grid">
                        <div><strong>Name:</strong> {hostelDetail.name || 'N/A'}</div>
                        <div><strong>Location:</strong> {hostelDetail.location || hostelDetail.address || 'N/A'}</div>
                        <div><strong>Gender:</strong> {hostelDetail.gender || 'N/A'}</div>
                        <div><strong>Capacity:</strong> {hostelDetail.capacity || 'N/A'}</div>
                        <div><strong>Warden:</strong> {hostelDetail.warden || 'N/A'}</div>
                        <div><strong>Warden Phone:</strong> {hostelDetail.wardenPhone || 'N/A'}</div>
                        <div><strong>Rent/Month:</strong> {hostelDetail.rentPerMonth ? `₹${hostelDetail.rentPerMonth}` : 'N/A'}</div>
                        <div><strong>Status:</strong> {hostelDetail.isDisabled ? 'Disabled' : 'Enabled'}</div>
                        <div className="hostel-detail-description"><strong>Description:</strong> {hostelDetail.description || 'N/A'}</div>
                      </div>
                    ) : (
                      <div className="hostel-edit-form">
                        <div className="form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            value={hostelEditData.name}
                            onChange={(e) => setHostelEditData((prev) => ({ ...prev, name: e.target.value }))}
                            disabled={modalLoading}
                          />
                        </div>
                        <div className="form-group">
                          <label>Location</label>
                          <input
                            type="text"
                            value={hostelEditData.location}
                            onChange={(e) => setHostelEditData((prev) => ({ ...prev, location: e.target.value }))}
                            disabled={modalLoading}
                          />
                        </div>
                        <div className="form-group">
                          <label>Address</label>
                          <input
                            type="text"
                            value={hostelEditData.address}
                            onChange={(e) => setHostelEditData((prev) => ({ ...prev, address: e.target.value }))}
                            disabled={modalLoading}
                          />
                        </div>
                        <div className="form-group">
                          <label>Capacity</label>
                          <input
                            type="number"
                            value={hostelEditData.capacity}
                            onChange={(e) => setHostelEditData((prev) => ({ ...prev, capacity: e.target.value }))}
                            disabled={modalLoading}
                          />
                        </div>
                        <div className="form-group">
                          <label>Warden</label>
                          <input
                            type="text"
                            value={hostelEditData.warden}
                            onChange={(e) => setHostelEditData((prev) => ({ ...prev, warden: e.target.value }))}
                            disabled={modalLoading}
                          />
                        </div>
                        <div className="form-group">
                          <label>Warden Phone</label>
                          <input
                            type="text"
                            value={hostelEditData.wardenPhone}
                            onChange={(e) => setHostelEditData((prev) => ({ ...prev, wardenPhone: e.target.value }))}
                            disabled={modalLoading}
                          />
                        </div>
                        <div className="form-group">
                          <label>Gender</label>
                          <select
                            value={hostelEditData.gender}
                            onChange={(e) => setHostelEditData((prev) => ({ ...prev, gender: e.target.value }))}
                            disabled={modalLoading}
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Rent/Month</label>
                          <input
                            type="number"
                            value={hostelEditData.rentPerMonth}
                            onChange={(e) => setHostelEditData((prev) => ({ ...prev, rentPerMonth: e.target.value }))}
                            disabled={modalLoading}
                          />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <textarea
                            value={hostelEditData.description}
                            onChange={(e) => setHostelEditData((prev) => ({ ...prev, description: e.target.value }))}
                            rows="3"
                            disabled={modalLoading}
                          />
                        </div>
                      </div>
                    )}

                    <div className="modal-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setHostelEditMode((prev) => !prev)}
                        disabled={modalLoading}
                      >
                        {hostelEditMode ? 'Cancel Edit' : 'Update Hostel'}
                      </button>
                      {hostelEditMode && (
                        <button
                          className="btn btn-primary"
                          onClick={handleHostelUpdate}
                          disabled={modalLoading}
                        >
                          {modalLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      )}
                      <button
                        className={hostelDetail.isDisabled ? 'btn btn-success' : 'btn btn-warning'}
                        onClick={handleHostelDisableToggle}
                        disabled={modalLoading}
                      >
                        {hostelDetail.isDisabled ? 'Enable Hostel' : 'Disable Hostel'}
                      </button>
                      <button
                        className="btn btn-info"
                        onClick={() => setShowChangeAdminModal(true)}
                        disabled={modalLoading}
                      >
                        Change Admin
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={handleHostelDelete}
                        disabled={modalLoading}
                      >
                        Delete Hostel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">No hostel details available</div>
                )}
              </div>
            </div>
          </div>
        )}

        {showChangeAdminModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowChangeAdminModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Change Hostel Admin</h2>
                <button className="close-btn" onClick={() => setShowChangeAdminModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select New Admin</label>
                  <select
                    value={hostelChangeAdminId}
                    onChange={(e) => setHostelChangeAdminId(e.target.value)}
                    disabled={modalLoading}
                    className="form-input"
                  >
                    <option value="">Select an admin</option>
                    {(dashboardData?.totalAdmins || []).map((admin) => (
                      <option key={admin._id || admin.adminId} value={admin.adminId}>
                        {admin.name} ({admin.adminId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleHostelChangeAdmin();
                    setShowChangeAdminModal(false);
                  }}
                  disabled={modalLoading || !hostelChangeAdminId}
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

        {showChangeRoomModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowChangeRoomModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Change Room for {selectedStudent?.name}</h2>
              <p className="current-room-info">
                Current Room: <strong>{selectedStudent?.roomNumber || 'N/A'}</strong>
              </p>
              {loadingHostels ? (
                <div className="loading-hostels">Loading hostels...</div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Select Hostel *</label>
                    <select
                      value={changeRoomData.hostelId}
                      onChange={(e) => handleHostelChange(e.target.value)}
                      disabled={modalLoading}
                      className="hostel-select"
                    >
                      <option value="">Select a hostel</option>
                      {availableHostels.map((hostel) => (
                        <option key={hostel._id || hostel.id} value={hostel._id || hostel.id}>
                          {hostel.name} ({hostel.gender})
                        </option>
                      ))}
                    </select>
                  </div>

                  {changeRoomData.hostelId && (
                    <div className="form-group">
                      <label>Select Room *</label>
                      {loadingRooms ? (
                        <div className="loading-rooms">Loading rooms...</div>
                      ) : availableRooms.length > 0 ? (
                        <select
                          value={changeRoomData.roomId}
                          onChange={(e) => setChangeRoomData(prev => ({ ...prev, roomId: e.target.value }))}
                          disabled={modalLoading}
                          className="room-select"
                        >
                          <option value="">Select a room</option>
                          {availableRooms.map((room) => (
                            <option key={room._id || room.id} value={room._id || room.id}>
                              Room {room.roomNumber} - {room.floor || 'N/A'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="no-rooms-message">No available rooms</div>
                      )}
                    </div>
                  )}
                </>
              )}
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={submitChangeRoom}
                  disabled={modalLoading || !changeRoomData.hostelId || !changeRoomData.roomId}
                >
                  {modalLoading ? 'Changing...' : 'Change Room'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowChangeRoomModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showReassignRoomModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowReassignRoomModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Reassign Room for {selectedStudent?.name}</h2>
              <p className="current-room-info">
                Current Room: <strong>{selectedStudent?.roomNumber || 'N/A'}</strong>
              </p>
              {loadingHostels ? (
                <div className="loading-hostels">Loading hostels...</div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Select Hostel *</label>
                    <select
                      value={changeRoomData.hostelId}
                      onChange={(e) => handleHostelChange(e.target.value)}
                      disabled={modalLoading}
                      className="hostel-select"
                    >
                      <option value="">Select a hostel</option>
                      {availableHostels.map((hostel) => (
                        <option key={hostel._id || hostel.id} value={hostel._id || hostel.id}>
                          {hostel.name} ({hostel.gender})
                        </option>
                      ))}
                    </select>
                  </div>

                  {changeRoomData.hostelId && (
                    <div className="form-group">
                      <label>Select Room *</label>
                      {loadingRooms ? (
                        <div className="loading-rooms">Loading rooms...</div>
                      ) : availableRooms.length > 0 ? (
                        <select
                          value={changeRoomData.roomId}
                          onChange={(e) => setChangeRoomData(prev => ({ ...prev, roomId: e.target.value }))}
                          disabled={modalLoading}
                          className="room-select"
                        >
                          <option value="">Select a room</option>
                          {availableRooms.map((room) => (
                            <option key={room._id || room.id} value={room._id || room.id}>
                              Room {room.roomNumber} - {room.floor || 'N/A'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="no-rooms-message">No available rooms</div>
                      )}
                    </div>
                  )}
                </>
              )}
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={submitReassignRoom}
                  disabled={modalLoading || !changeRoomData.hostelId || !changeRoomData.roomId}
                >
                  {modalLoading ? 'Reassigning...' : 'Reassign Room'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReassignRoomModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Room Modal */}
        {showAssignRoomModal && (
          <div className="modal-overlay" onClick={() => !modalLoading && setShowAssignRoomModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Assign Student to Room {selectedRoomForAssignment?.roomNumber}</h2>
              <p className="modal-description">
                Hostel: <strong>{selectedHostelForRooms?.name}</strong> | 
                Floor: <strong>{selectedFloor}</strong> | 
                Available Seats: <strong>{selectedRoomForAssignment?.capacity - (selectedRoomForAssignment?.occupiedBeds || 0)}</strong>
              </p>

              {loadingApplications ? (
                <div className="loading-applications">Loading pending applications...</div>
              ) : pendingApplications.length === 0 ? (
                <div className="no-applications">
                  <p>No pending applications for this hostel.</p>
                  <p>Students must apply to this hostel before they can be assigned.</p>
                </div>
              ) : (
                <div className="applications-list">
                  <h3>Pending Applications ({pendingApplications.length})</h3>
                  <div className="students-grid">
                    {pendingApplications.map((app) => (
                      <div
                        key={app._id}
                        className="student-application-card"
                        onClick={() => handleAssignStudentToRoom(app)}
                      >
                        <div className="student-info">
                          <div className="student-name">{app.studentId?.name || app.name}</div>
                          <div className="student-pnr">PNR: {app.studentId?.pnr || app.pnr}</div>
                          <div className="student-email">{app.studentId?.email || app.email}</div>
                          <div className="student-gender">Gender: {app.studentId?.gender || app.gender}</div>
                        </div>
                        <button className="btn btn-sm btn-primary">
                          Assign to Room
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAssignRoomModal(false);
                    setSelectedRoomForAssignment(null);
                    setPendingApplications([]);
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

export default SuperAdminDashboard;
