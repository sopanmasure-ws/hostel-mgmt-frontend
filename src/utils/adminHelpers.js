// Admin utility functions and helpers

/**
 * Validate admin credentials
 * @param {string} adminId - Admin ID
 * @param {string} password - Admin password
 * @returns {object} Validation result with errors
 */
export const validateAdminLogin = (adminId, password) => {
  const errors = {};

  if (!adminId || adminId.trim() === '') {
    errors.adminId = 'Admin ID is required';
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate admin registration data
 * @param {object} data - Registration form data
 * @returns {object} Validation result with errors
 */
export const validateAdminRegistration = (data) => {
  const errors = {};

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Admin ID validation
  if (!data.adminId || data.adminId.length < 3) {
    errors.adminId = 'Admin ID must be at least 3 characters';
  }

  // Password validation
  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Password match validation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format room status for display
 * @param {string} status - Room status
 * @returns {object} Formatted status with icon and color
 */
export const formatRoomStatus = (status) => {
  const statusMap = {
    available: {
      label: 'Available',
      icon: '✓',
      color: '#4CAF50',
      bgColor: '#E8F5E9',
    },
    filled: {
      label: 'Filled',
      icon: '👥',
      color: '#FF9800',
      bgColor: '#FFF3E0',
    },
    damaged: {
      label: 'Damaged',
      icon: '⚠️',
      color: '#F44336',
      bgColor: '#FFEBEE',
    },
  };

  return statusMap[status] || statusMap.available;
};

/**
 * Format application status for display
 * @param {string} status - Application status
 * @returns {object} Formatted status with color and badge class
 */
export const formatApplicationStatus = (status) => {
  const statusMap = {
    pending: {
      label: 'Pending',
      badge: 'badge-warning',
      color: '#FF9800',
    },
    accepted: {
      label: 'Accepted',
      badge: 'badge-success',
      color: '#4CAF50',
    },
    rejected: {
      label: 'Rejected',
      badge: 'badge-danger',
      color: '#F44336',
    },
  };

  return statusMap[status] || statusMap.pending;
};

/**
 * Calculate hostel occupancy percentage
 * @param {number} filled - Number of filled rooms
 * @param {number} total - Total number of rooms
 * @returns {number} Occupancy percentage
 */
export const calculateOccupancyPercentage = (filled, total) => {
  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
};

/**
 * Get occupancy status color
 * @param {number} percentage - Occupancy percentage
 * @returns {string} Color code
 */
export const getOccupancyColor = (percentage) => {
  if (percentage < 30) return '#4CAF50'; // Low occupancy - Green
  if (percentage < 70) return '#FF9800'; // Medium occupancy - Orange
  return '#F44336'; // High occupancy - Red
};

/**
 * Format date for display
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

/**
 * Group rooms by floor
 * @param {array} rooms - Array of room objects
 * @returns {object} Rooms grouped by floor
 */
export const groupRoomsByFloor = (rooms) => {
  return rooms.reduce((acc, room) => {
    const floor = room.floor;
    if (!acc[floor]) {
      acc[floor] = [];
    }
    acc[floor].push(room);
    return acc;
  }, {});
};

/**
 * Filter rooms by criteria
 * @param {array} rooms - Array of room objects
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered rooms
 */
export const filterRooms = (rooms, filters) => {
  let filtered = [...rooms];

  if (filters.floor) {
    filtered = filtered.filter((room) => room.floor === filters.floor);
  }

  if (filters.status) {
    filtered = filtered.filter((room) => room.status === filters.status);
  }

  return filtered;
};

/**
 * Generate room statistics
 * @param {array} rooms - Array of room objects
 * @returns {object} Room statistics
 */
export const generateRoomStats = (rooms) => {
  return {
    total: rooms.length,
    available: rooms.filter((r) => r.status === 'available').length,
    filled: rooms.filter((r) => r.status === 'filled').length,
    damaged: rooms.filter((r) => r.status === 'damaged').length,
    occupancyPercentage: calculateOccupancyPercentage(
      rooms.filter((r) => r.status === 'filled').length,
      rooms.length
    ),
  };
};

/**
 * Generate hostel statistics
 * @param {array} hostels - Array of hostel objects
 * @returns {object} Hostel statistics
 */
export const generateHostelStats = (hostels) => {
  return {
    totalHostels: hostels.length,
    totalRooms: hostels.reduce((sum, h) => sum + h.totalRooms, 0),
    totalFilled: hostels.reduce((sum, h) => sum + h.filledRooms, 0),
    totalAvailable: hostels.reduce((sum, h) => sum + h.availableRooms, 0),
    totalPendingApplcations: hostels.reduce(
      (sum, h) => sum + h.pendingApplications,
      0
    ),
  };
};

/**
 * Sort applications by date
 * @param {array} applications - Array of application objects
 * @param {string} order - 'asc' or 'desc'
 * @returns {array} Sorted applications
 */
export const sortApplicationsByDate = (applications, order = 'desc') => {
  return [...applications].sort((a, b) => {
    const dateA = new Date(a.appliedDate);
    const dateB = new Date(b.appliedDate);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Check if room is available
 * @param {object} room - Room object
 * @returns {boolean} True if room is available
 */
export const isRoomAvailable = (room) => {
  return room.status === 'available' && room.assignedStudents.length < room.capacity;
};

/**
 * Get room occupancy details
 * @param {object} room - Room object
 * @returns {string} Occupancy description
 */
export const getRoomOccupancyDetails = (room) => {
  const { capacity, assignedStudents } = room;
  const occupied = assignedStudents.length;
  return `${occupied}/${capacity} occupied`;
};

/**
 * Format application summary
 * @param {object} application - Application object
 * @returns {string} Application summary
 */
export const formatApplicationSummary = (application) => {
  return `${application.studentName} - ${application.status.toUpperCase()} (PNR: ${application.pnr})`;
};

/**
 * Export data as CSV
 * @param {array} data - Array of objects to export
 * @param {string} filename - Output filename
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        const escaped = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        return escaped;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default {
  validateAdminLogin,
  validateAdminRegistration,
  formatRoomStatus,
  formatApplicationStatus,
  calculateOccupancyPercentage,
  getOccupancyColor,
  formatDate,
  groupRoomsByFloor,
  filterRooms,
  generateRoomStats,
  generateHostelStats,
  sortApplicationsByDate,
  isRoomAvailable,
  getRoomOccupancyDetails,
  formatApplicationSummary,
  exportToCSV,
};
