import { API_CONFIG } from '../config';
import { tokenService } from './services/tokenService';

const API_BASE_URL = API_CONFIG.BASE_URL;
// Fallback direct backend URL to bypass dev proxy when it resets
const FALLBACK_BASE_URL = 'https://hostel-mgmt-backend-0icp.onrender.com/api';

// Helper to get authorization headers
const getAuthHeaders = (token = null) => {
  const headers = { ...API_CONFIG.HEADERS };
  const bearerToken = token || tokenService.getAdminToken() || tokenService.getStudentToken();
  
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }
  
  return headers;
};

const apiFetch = async (endpoint, options = {}) => {
  const headers = getAuthHeaders(options.token);
  const controller = new AbortController();
  const timeoutMs = API_CONFIG.TIMEOUT || 30000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeout);
    const msg = (err && err.message) || '';
    const isConnReset = msg.includes('ECONNRESET') || msg.includes('Failed to fetch');
    // Retry once using direct backend URL to avoid proxy resets
    if (isConnReset) {
      const response = await fetch(`${FALLBACK_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.status}`);
      }
      return await response.json();
    }
    throw err;
  }
};

const createRequestOptions = (method = 'POST', data, token = null) => ({
  method,
  headers: getAuthHeaders(token),
  body: JSON.stringify(data),
});
export const authAPI = {
  register: async (userData) => {
    return await apiFetch('/auth/register', createRequestOptions('POST', userData));
  },

  login: async (credentials) => {
    return await apiFetch('/auth/login', createRequestOptions('POST', credentials));
  },

  getMe: async () => {
    return await apiFetch('/auth/me');
  },
};
export const hostelAPI = {
  getAllHostels: async () => {
    return await apiFetch('/hostels');
  },

  getHostelById: async (id) => {
    return await apiFetch(`/hostels/${id}`);
  },

  createHostel: async (hostelData) => {
    return await apiFetch('/hostels', createRequestOptions('POST', hostelData));
  },

  updateHostel: async (id, hostelData) => {
    return await apiFetch(`/hostels/${id}`, createRequestOptions('PUT', hostelData));
  },

  deleteHostel: async (id) => {
    return await apiFetch(`/hostels/${id}`, { method: 'DELETE' });
  },
};
export const applicationAPI = {
  submitApplication: async (applicationData) => {
    // Ensure student Bearer token is sent in headers for booking
    return await apiFetch('/applications', createRequestOptions('POST', applicationData, tokenService.getStudentToken()));
  },

  getMyApplications: async (studentPNR) => {
    return await apiFetch(`/applications/${studentPNR}`);
  },

  getApplications: async () => {
    return await apiFetch('/applications');
  },

  getApplicationById: async (id) => {
    return await apiFetch(`/applications/${id}`);
  },

  updateApplication: async (id, data) => {
    return await apiFetch(`/applications/${id}`, createRequestOptions('PUT', data));
  },

  deleteApplication: async (id) => {
    return await apiFetch(`/applications/${id}`, { method: 'DELETE' });
  },

  getApplicationsByHostel: async (hostelId) => {
    return await apiFetch(`/applications/hostel/${hostelId}`);
  },

  getApplicationsByPNR: async (pnr) => {
    try {
      const resp = await apiFetch(`/applications/${pnr}`);
      // Normalize to a single application object
      if (resp?.application && typeof resp.application === 'object') return resp.application;
      if (resp?.data && typeof resp.data === 'object') return resp.data;
      if (resp && typeof resp === 'object') return resp;
      return null;
    } catch (err) {
      // Gracefully handle not found: return null instead of throwing
      const msg = err?.message || '';
      if (msg.includes('API Error: 404') || msg.toLowerCase().includes('not found')) {
        return null;
      }
      // For other errors, also return null to avoid breaking UI enrichment
      return null;
    }
  },
};
export const adminAuthAPI = {
  register: async (adminData) => {
    return await apiFetch('/admin/register', createRequestOptions('POST', adminData));
  },

  login: async (credentials) => {
    return await apiFetch('/admin/login', createRequestOptions('POST', credentials));
  },

  getMe: async () => {
    return await apiFetch('/admin/me');
  },
};

export const adminHostelAPI = {
  getAdminHostels: async (adminId) => {
    return await apiFetch(`/admin/${adminId}/hostels`);
  },

  getHostelById: async (hostelId) => {
    return await apiFetch(`/admin/hostels/${hostelId}`);
  },

  updateHostel: async (hostelId, hostelData) => {
    return await apiFetch(`/admin/hostels/${hostelId}`, createRequestOptions('PUT', hostelData));
  },
};

export const adminApplicationAPI = {
  getApplicationsByHostel: async (hostelId, status = null) => {
    const endpoint = status
      ? `/admin/hostels/${hostelId}/applications?status=${status}`
      : `/admin/hostels/${hostelId}/applications`;
    return await apiFetch(endpoint);
  },

  getApplicationsByStatus: async (hostelId,status = null) => {
    return await apiFetch(`/admin/hostels/${hostelId}/applications?status=${status}`);
  },

  changeApplicationStatus: async (applicationId, roomData, status) => {
    return await apiFetch(`/admin/applications/${applicationId}/${status}`, createRequestOptions('PUT', roomData));
  },

  rejectStudentApplication: async (applicationId, rejectionReason, status) => {
    return await apiFetch(`/admin/applications/${applicationId}/${status}`, createRequestOptions('PUT', rejectionReason));
  },
};

export const adminRoomAPI = {
  getInventory: async (hostelId, filters = {}) => {
    let endpoint = `/admin/hostels/${hostelId}/inventory`;
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.floor) params.append('floor', filters.floor);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return await apiFetch(endpoint);
  },

  getAvailableRooms: async (hostelId) => {
    return await apiFetch(`/admin/hostels/${hostelId}/inventory?status=empty`);
  },

  getRoomsByHostel: async (hostelId) => {
    let endpoint = `/admin/hostels/${hostelId}/rooms`;
    return await apiFetch(endpoint);
  },

  updateRoomStatus: async (roomId, statusData) => {
    return await apiFetch(`/admin/rooms/${roomId}/update-status`, createRequestOptions('PUT', statusData));
  },

  releaseRoom: async (roomId) => {
    return await apiFetch(`/admin/rooms/${roomId}/release`, createRequestOptions('PUT', {}));
  },
};

/**
 * Super Admin API endpoints
 * Reference: SUPERADMIN_API_DOCS.md
 * All endpoints are under /api/superadmin and require Bearer token authentication
 */
export const superAdminAPI = {
  // ==================== Dashboard APIs ====================
  
  /**
   * GET /superadmin/dashboard/overview
   * Get dashboard overview counts (admins, students, hostels, rooms, applications)
   */
  getDashboardOverview: async () => {
    return await apiFetch('/superadmin/dashboard/overview');
  },

  /**
   * GET /superadmin/dashboard/data
   * Get complete dashboard data including all admins, students, and hostels
   */
  getDashboardData: async () => {
    return await apiFetch('/superadmin/dashboard/data');
  },

  /**
   * GET /superadmin/dashboard/detailed
   * Get detailed dashboard data with all entities (students, admins, hostels, rooms, applications)
   */
  getDashboardDetailed: async () => {
    return await apiFetch('/superadmin/dashboard/detailed');
  },

  // ==================== Admin Management APIs ====================

  /**
   * GET /superadmin/admins
   * List all admins with search support
   * Query: ?q=searchTerm
   */
  getAllAdmins: async (searchTerm = '') => {
    const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
    return await apiFetch(`/superadmin/admins${query}`);
  },

  /**
   * GET /superadmin/admins/:adminId
   * Get specific admin details with their hostels and stats
   */
  getAdminById: async (adminId) => {
    return await apiFetch(`/superadmin/admins/${adminId}`);
  },

  /**
   * POST /superadmin/admins
   * Create new admin account
   * Request body: { name, email, adminId, phone, password, confirmPassword }
   */
  createAdmin: async (adminData) => {
    return await apiFetch('/superadmin/admins', createRequestOptions('POST', adminData));
  },

  /**
   * DELETE /superadmin/admins/:adminId
   * Delete admin account permanently
   */
  deleteAdmin: async (adminId) => {
    return await apiFetch(`/superadmin/admins/${adminId}`, { method: 'DELETE' });
  },

  /**
   * PATCH /superadmin/admins/:adminId/disable
   * Disable admin account
   * Request body: { reason? }
   */
  disableAdmin: async (adminId, disableData = {}) => {
    return await apiFetch(`/superadmin/admins/${adminId}/disable`, createRequestOptions('PATCH', disableData));
  },

  /**
   * PATCH /superadmin/admins/:adminId/enable
   * Enable disabled admin account
   */
  enableAdmin: async (adminId) => {
    return await apiFetch(`/superadmin/admins/${adminId}/enable`, createRequestOptions('PATCH', {}));
  },

  // ==================== Student Management APIs ====================

  /**
   * GET /superadmin/students
   * List all students with search support
   * Query: ?q=searchTerm
   */
  getAllStudents: async (searchTerm = '') => {
    const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
    return await apiFetch(`/superadmin/students${query}`);
  },

  /**
   * GET /superadmin/students/:pnr
   * Get specific student details with their application
   * URL parameter: pnr (student's PNR/unique identifier)
   */
  getStudentByPNR: async (pnr) => {
    return await apiFetch(`/superadmin/students/${pnr}`);
  },

  /**
   * PUT /superadmin/students/:pnr/assign-room
   * Assign room to student
   * Request body: { roomNumber, floor? }
   */
  assignStudentRoom: async (pnr, roomData) => {
    return await apiFetch(`/superadmin/students/${pnr}/assign-room`, createRequestOptions('PUT', roomData));
  },

  /**
   * PUT /superadmin/students/:pnr/reject-application
   * Reject student's hostel application
   * Request body: { reason }
   */
  rejectStudentApplication: async (pnr, rejectionData) => {
    return await apiFetch(`/superadmin/students/${pnr}/reject-application`, createRequestOptions('PUT', rejectionData));
  },

  /**
   * PUT /superadmin/students/:pnr/blacklist
   * Blacklist student from applying to hostels
   * Request body: { reason }
   */
  blacklistStudent: async (pnr, blacklistData) => {
    return await apiFetch(`/superadmin/students/${pnr}/blacklist`, createRequestOptions('PUT', blacklistData));
  },

  /**
   * PUT /superadmin/students/:pnr/unblacklist
   * Remove student from blacklist
   */
  unblacklistStudent: async (pnr) => {
    return await apiFetch(`/superadmin/students/${pnr}/unblacklist`, createRequestOptions('PUT', {}));
  },

  /**
   * PUT /superadmin/students/:pnr/change-room
   * Change student's room (can also change hostel)
   * Request body: { hostelId, roomId }
   */
  changeStudentRoom: async (pnr, changeRoomData) => {
    return await apiFetch(`/superadmin/students/${pnr}/change-room`, createRequestOptions('PUT', changeRoomData));
  },

  /**
   * PUT /superadmin/students/:pnr/removeStudentFromRoom
   * Remove student from assigned room
   * Request body: { remark }
   */
  removeStudentFromRoom: async (pnr, removeData) => {
    return await apiFetch(`/superadmin/students/${pnr}/removeStudentFromRoom`, createRequestOptions('PUT', removeData));
  },

  /**
   * PUT /superadmin/students/:pnr/reassign-room
   * Reassign student's room
   * Request body: { hostelId, roomId, remark }
   */
  reassignStudentRoom: async (pnr, reassignData) => {
    return await apiFetch(`/superadmin/students/${pnr}/reassign-room`, createRequestOptions('PUT', reassignData));
  },

  // ==================== Hostel Management APIs ====================

  /**
   * GET /superadmin/hostels
   * List all hostels with search support
   * Query: ?q=searchTerm
   */
  getAllHostels: async (searchTerm = '') => {
    const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
    return await apiFetch(`/superadmin/hostels${query}`);
  },

  /**
   * GET /superadmin/hostels/:hostelId
   * Get specific hostel details with rooms, students, and stats
   */
  getHostelById: async (hostelId) => {
    return await apiFetch(`/superadmin/hostels/${hostelId}`);
  },

  /**
   * POST /superadmin/hostels
   * Create new hostel
   * Request body: { name, address, adminId, capacity, description?, warden?, wardenPhone?, gender?, rentPerMonth?, amenities?, rules? }
   */
  createHostel: async (hostelData) => {
    return await apiFetch('/superadmin/hostels', createRequestOptions('POST', hostelData));
  },

  /**
   * PUT /superadmin/hostels/:hostelId
   * Update hostel details
   * Request body: { name?, address?, capacity?, description?, ... }
   */
  updateHostel: async (hostelId, hostelData) => {
    return await apiFetch(`/superadmin/hostels/${hostelId}`, createRequestOptions('PUT', hostelData));
  },

  /**
   * DELETE /superadmin/hostels/:hostelId
   * Delete hostel permanently
   */
  deleteHostel: async (hostelId) => {
    return await apiFetch(`/superadmin/hostels/${hostelId}`, { method: 'DELETE' });
  },

  /**
   * PATCH /superadmin/hostels/:hostelId/disable
   * Disable hostel
   * Request body: { reason? }
   */
  disableHostel: async (hostelId, disableData = {}) => {
    return await apiFetch(`/superadmin/hostels/${hostelId}/disable`, createRequestOptions('PATCH', disableData));
  },

  /**
   * PATCH /superadmin/hostels/:hostelId/enable
   * Enable disabled hostel
   */
  enableHostel: async (hostelId) => {
    return await apiFetch(`/superadmin/hostels/${hostelId}/enable`, createRequestOptions('PATCH', {}));
  },

  /**
   * PUT /superadmin/hostels/:hostelId/change-admin
   * Assign hostel to different admin
   * Request body: { adminId }
   */
  changeHostelAdmin: async (hostelId, adminChangeData) => {
    return await apiFetch(`/superadmin/hostels/${hostelId}/change-admin`, createRequestOptions('PUT', adminChangeData));
  },

  /**
   * PUT /superadmin/hostels/:hostelId/rooms/:roomId/change-status
   * Change room status
   * Request body: { status: 'available'|'occupied'|'maintenance' }
   */
  changeRoomStatus: async (hostelId, roomId, roomStatusData) => {
    return await apiFetch(`/superadmin/hostels/${hostelId}/rooms/${roomId}/change-status`, createRequestOptions('PUT', roomStatusData));
  },
};

/**
 * Data transformation utilities for API responses
 */
export const apiTransformers = {
  /**
   * Transform dashboard overview response
   * API Response: { success, data: { counts: { admins, students, hostels, rooms, applications } } }
   */
  transformDashboardOverview: (apiResponse) => {
    if (!apiResponse?.success || !apiResponse?.data?.counts) {
      return {
        totalStudents: 0,
        totalAdmins: 0,
        totalHostels: 0,
        totalRooms: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        blacklistedStudents: 0,
        occupiedRooms: 0,
        availableRooms: 0,
      };
    }

    const { counts } = apiResponse.data;
    return {
      totalStudents: counts.students || 0,
      totalAdmins: counts.admins || 0,
      totalHostels: counts.hostels || 0,
      totalRooms: counts.rooms || 0,
      pendingApplications: counts.pendingApplications || 0,
      approvedApplications: counts.approvedApplications || 0,
      rejectedApplications: counts.rejectedApplications || 0,
      blacklistedStudents: counts.blacklistedStudents || 0,
      occupiedRooms: counts.occupiedRooms || 0,
      availableRooms: counts.availableRooms || 0,
    };
  },

  /**
   * Transform admin list response
   * API Response: { success, data: { total, admins: [...] } }
   */
  transformAdminsList: (apiResponse) => {
    if (!apiResponse?.success || !apiResponse?.data?.admins) {
      return [];
    }

    return apiResponse.data.admins.map((admin) => ({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      adminId: admin.adminId,
      phone: admin.phone,
      hostelIds: admin.hostelIds || [],
      role: admin.role || 'admin',
      isActive: admin.isActive ?? true,
      isDisabled: !admin.isActive,
      createdAt: admin.createdAt,
    }));
  },

  /**
   * Transform single admin response
   * API Response: { success, data: { admin, hostels, stats } }
   */
  transformAdminDetail: (apiResponse) => {
    if (!apiResponse?.success || !apiResponse?.data?.admin) {
      return null;
    }

    const { admin, hostels = [], stats = {} } = apiResponse.data;
    return {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      adminId: admin.adminId,
      phone: admin.phone,
      hostelIds: admin.hostelIds || [],
      role: admin.role || 'admin',
      isActive: admin.isActive ?? true,
      isDisabled: !admin.isActive,
      createdAt: admin.createdAt,
      managedHostels: hostels,
      stats: {
        hostelCount: stats.hostels || 0,
        applicationCount: stats.applications || 0,
      },
    };
  },

  /**
   * Transform students list response
   * API Response: { success, data: { total, students: [...] } }
   */
  transformStudentsList: (apiResponse) => {
    if (!apiResponse?.success || !apiResponse?.data?.students) {
      return [];
    }

    return apiResponse.data.students.map((student) => {
      // Normalize assignedRoom to ensure roomNumber is present when available
      let assignedRoom = student.assignedRoom || null;
      if (!assignedRoom && (student.assignedRoomNumber || student.roomNumber)) {
        assignedRoom = {
          roomNumber: student.assignedRoomNumber || student.roomNumber,
          floor: student.floor || '',
        };
      } else if (assignedRoom && typeof assignedRoom === 'string') {
        assignedRoom = { roomNumber: assignedRoom };
      }

      // Include currentApplication if the API provides it on the list item
      const currentApplication = student.currentApplication || student.application || null;

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        pnr: student.pnr,
        gender: student.gender,
        year: student.year,
        phone: student.phone,
        address: student.address,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        role: student.role || 'student',
        isActive: student.isActive ?? true,
        isBlacklisted: student.isBlacklisted ?? false,
        assignedRoom,
        roomNumber: student.roomNumber || null,
        floor: student.floor || null,
        hostelName: student.hostelName || null,
        applicationStatus: student.applicationStatus || null,
        currentApplication,
        createdAt: student.createdAt,
      };
    });
  },

  /**
   * Transform single student response
   * API Response: { success, data: { student, application } }
   */
  transformStudentDetail: (apiResponse) => {
    if (!apiResponse?.success || !apiResponse?.data?.student) {
      return null;
    }

    const { student, application = {} } = apiResponse.data;
    // Normalize assignedRoom from detail
    let assignedRoom = student.assignedRoom || null;
    if (!assignedRoom && (student.assignedRoomNumber || student.roomNumber)) {
      assignedRoom = {
        roomNumber: student.assignedRoomNumber || student.roomNumber,
        floor: student.floor || '',
      };
    } else if (assignedRoom && typeof assignedRoom === 'string') {
      assignedRoom = { roomNumber: assignedRoom };
    }
    return {
      _id: student._id,
      name: student.name,
      email: student.email,
      pnr: student.pnr,
      gender: student.gender,
      year: student.year,
      phone: student.phone,
      address: student.address,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      role: student.role || 'student',
      isActive: student.isActive ?? true,
      isBlacklisted: student.isBlacklisted ?? false,
      assignedRoom,
      roomNumber: student.roomNumber || null,
      floor: student.floor || null,
      hostelName: student.hostelName || null,
      applicationStatus: student.applicationStatus || null,
      createdAt: student.createdAt,
      currentApplication: {
        _id: application._id || null,
        hostelId: application.hostelId || null,
        hostelName: application.hostelId?.name || 'N/A',
        status: application.status || 'Pending',
        appliedOn: application.appliedOn || null,
      },
    };
  },

  /**
   * Transform hostels list response
   * API Response: { success, data: { total, hostels: [...] } }
   */
  transformHostelsList: (apiResponse) => {
    if (!apiResponse?.success || !apiResponse?.data?.hostels) {
      return [];
    }

    return apiResponse.data.hostels.map((hostel) => ({
      _id: hostel._id,
      name: hostel.name,
      description: hostel.description,
      location: hostel.location,
      address: hostel.address,
      warden: hostel.warden,
      wardenPhone: hostel.wardenPhone,
      capacity: hostel.capacity,
      availableRooms: hostel.availableRooms,
      occupiedRooms: (hostel.capacity - hostel.availableRooms) || 0,
      amenities: hostel.amenities || [],
      gender: hostel.gender,
      rentPerMonth: hostel.rentPerMonth,
      rules: hostel.rules || [],
      image: hostel.image,
      adminId: typeof hostel.adminId === 'object' ? hostel.adminId._id : hostel.adminId,
      adminName: typeof hostel.adminId === 'object' ? hostel.adminId.name : 'N/A',
      isActive: hostel.isActive ?? true,
      isDisabled: !hostel.isActive,
      createdAt: hostel.createdAt,
    }));
  },

  /**
   * Transform single hostel response
   * API Response: { success, data: { hostel, rooms, students, stats } }
   */
  transformHostelDetail: (apiResponse) => {
    if (!apiResponse?.success || !apiResponse?.data?.hostel) {
      return null;
    }

    const { hostel, rooms = [], students = [], stats = {} } = apiResponse.data;
    return {
      _id: hostel._id,
      name: hostel.name,
      description: hostel.description,
      location: hostel.location,
      address: hostel.address,
      warden: hostel.warden,
      wardenPhone: hostel.wardenPhone,
      capacity: hostel.capacity,
      availableRooms: hostel.availableRooms,
      occupiedRooms: (hostel.capacity - hostel.availableRooms) || 0,
      amenities: hostel.amenities || [],
      gender: hostel.gender,
      rentPerMonth: hostel.rentPerMonth,
      rules: hostel.rules || [],
      image: hostel.image,
      adminId: typeof hostel.adminId === 'object' ? hostel.adminId._id : hostel.adminId,
      adminName: typeof hostel.adminId === 'object' ? hostel.adminId.name : 'N/A',
      isActive: hostel.isActive ?? true,
      isDisabled: !hostel.isActive,
      createdAt: hostel.createdAt,
      rooms: rooms,
      students: students,
      stats: {
        totalRooms: stats.totalRooms || hostel.capacity,
        occupiedRooms: stats.occupiedRooms || 0,
        availableRooms: stats.availableRooms || hostel.availableRooms,
        studentCount: stats.studentCount || students.length,
      },
    };
  },

  /**
   * Transform applications list response
   */
  transformApplicationsList: (apiResponse) => {
    if (!apiResponse?.success || !apiResponse?.data?.applications) {
      return [];
    }

    return apiResponse.data.applications.map((app) => ({
      _id: app._id,
      studentId: typeof app.studentId === 'object' ? app.studentId._id : app.studentId,
      studentName: app.studentName || (typeof app.studentId === 'object' ? app.studentId.name : 'N/A'),
      studentPNR: app.studentPNR || (typeof app.studentId === 'object' ? app.studentId.pnr : ''),
      studentEmail: typeof app.studentId === 'object' ? app.studentId.email : '',
      hostelId: app.hostelId,
      hostelName: app.hostelName || 'N/A',
      status: app.status,
      appliedOn: app.appliedOn,
      approvedOn: app.approvedOn || null,
      rejectionReason: app.rejectionReason || null,
      assignedRoom: app.assignedRoom || null,
      year: app.studentYear || app.year,
      branch: app.branch,
    }));
  },
};

/**
 * Request payload builders for API calls
 */
export const requestPayloads = {
  /**
   * Build create admin payload
   */
  createAdmin: (formData) => ({
    name: formData.name,
    email: formData.email,
    adminId: formData.adminId,
    phone: formData.phone,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  }),

  /**
   * Build update admin payload
   */
  updateAdmin: (adminData) => ({
    name: adminData.name,
    email: adminData.email,
    phone: adminData.phone,
  }),

  /**
   * Build assign room payload
   */
  assignRoom: (roomData) => ({
    roomNumber: roomData.roomNumber,
    floor: roomData.floor || null,
    hostelId: roomData.hostelId,
  }),

  /**
   * Build reject application payload
   */
  rejectApplication: (reason) => ({
    reason: reason,
  }),

  /**
   * Build blacklist student payload
   */
  blacklistStudent: (reason) => ({
    reason: reason,
  }),

  /**
   * Build create hostel payload
   */
  createHostel: (formData) => ({
    name: formData.name,
    address: formData.address,
    location: formData.location || formData.address,
    adminId: formData.adminId,
    capacity: parseInt(formData.capacity),
    description: formData.description,
    warden: formData.warden || null,
    wardenPhone: formData.wardenPhone || null,
    gender: formData.gender || 'Mixed',
    rentPerMonth: parseInt(formData.rentPerMonth) || 0,
    amenities: formData.amenities || [],
    rules: formData.rules || [],
  }),

  /**
   * Build change admin payload
   */
  changeAdmin: (adminId) => ({
    adminId: adminId,
  }),

  /**
   * Build change hostel admin payload
   */
  changeHostelAdmin: (hostelId, data) => ({
    adminId: data.adminId,
  }),

  /**
   * Build change room status payload
   */
  changeRoomStatus: (hostelId, roomData) => ({
    roomNumber: roomData.roomNumber,
    status: roomData.status,
    floor: roomData.floor || null,
  }),

  /**
   * Build disable admin payload
   */
  disableAdmin: (adminId, data) => ({
    reason: data?.reason || '',
  }),

  /**
   * Build enable admin payload
   */
  enableAdmin: () => ({
    // Enable endpoint may not need a body, but include empty object for consistency
  }),

  /**
   * Build disable hostel payload
   */
  disableHostel: (hostelId, data) => ({
    reason: data?.reason || '',
  }),

  /**
   * Build enable hostel payload
   */
  enableHostel: () => ({
    // Enable endpoint may not need a body, but include empty object for consistency
  }),
};

/**
 * API error handlers
 */
export const errorHandlers = {
  /**
   * Parse API error message
   */
  parseError: (error) => {
    try {
      if (error?.response?.data?.message) {
        return String(error.response.data.message);
      }
      if (error?.message) {
        return String(error.message);
      }
      if (typeof error === 'string') {
        return error;
      }
      return 'An error occurred. Please try again.';
    } catch (e) {
      return 'An error occurred. Please try again.';
    }
  },

  /**
   * Check if error is authentication error
   */
  isAuthError: (error) => {
    return error.response?.status === 401 || error.response?.status === 403;
  },

  /**
   * Check if error is validation error
   */
  isValidationError: (error) => {
    return error.response?.status === 400;
  },

  /**
   * Get validation error details
   */
  getValidationErrors: (error) => {
    if (error.response?.data?.errors) {
      return error.response.data.errors;
    }
    return null;
  },
};

/**
 * API pagination helper
 */
export const paginationHelper = {
  /**
   * Build query string from filters
   */
  buildQueryString: (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) {
      params.append('q', filters.search);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.role) {
      params.append('role', filters.role);
    }
    if (filters.gender) {
      params.append('gender', filters.gender);
    }

    return params.toString();
  },

  /**
   * Extract pagination info from response
   */
  extractPaginationInfo: (apiResponse) => {
    if (!apiResponse?.data) {
      return { total: 0, page: 1, limit: 10 };
    }

    const { data } = apiResponse;
    return {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
      pages: Math.ceil((data.total || 0) / (data.limit || 10)),
    };
  },
};

export default {
  authAPI,
  hostelAPI,
  applicationAPI,
  adminAuthAPI,
  adminHostelAPI,
  adminApplicationAPI,
  adminRoomAPI,
  superAdminAPI,
  apiTransformers,
  requestPayloads,
  errorHandlers,
  paginationHelper,
};
