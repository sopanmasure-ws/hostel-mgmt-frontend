
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

export const validateAdminRegistration = (data) => {
  const errors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.adminId || data.adminId.length < 3) {
    errors.adminId = 'Admin ID must be at least 3 characters';
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

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

export const calculateOccupancyPercentage = (filled, total) => {
  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
};

export const getOccupancyColor = (percentage) => {
  if (percentage < 30) return '#4CAF50'; 
  if (percentage < 70) return '#FF9800'; 
  return '#F44336';
};

export const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

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

export const sortApplicationsByDate = (applications, order = 'desc') => {
  return [...applications].sort((a, b) => {
    const dateA = new Date(a.appliedDate);
    const dateB = new Date(b.appliedDate);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};


export const isRoomAvailable = (room) => {
  return room.status === 'available' && room.assignedStudents.length < room.capacity;
};


export const getRoomOccupancyDetails = (room) => {
  const { capacity, assignedStudents } = room;
  const occupied = assignedStudents.length;
  return `${occupied}/${capacity} occupied`;
};


export const formatApplicationSummary = (application) => {
  return `${application.studentName} - ${application.status.toUpperCase()} (PNR: ${application.pnr})`;
};


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
