type ValidationErrors = Record<string, string>;

interface AdminRegistrationData {
  email?: string;
  adminId?: string;
  password?: string;
  confirmPassword?: string;
}

interface Room {
  status?: string;
  assignedStudents?: Array<unknown>;
  capacity?: number;
  floor?: string | number;
}

interface HostelStats {
  totalRooms: number;
  filledRooms: number;
  availableRooms: number;
  pendingApplications: number;
}

interface Application {
  appliedDate?: string;
  studentName?: string;
  status?: string;
  pnr?: string;
}

export const validateAdminLogin = (adminId: string, password: string) => {
  const errors: ValidationErrors = {};

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

export const validateAdminRegistration = (data: AdminRegistrationData) => {
  const errors: ValidationErrors = {};

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

export const formatRoomStatus = (status: string) => {
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

export const formatApplicationStatus = (status: string) => {
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

export const calculateOccupancyPercentage = (filled: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
};

export const getOccupancyColor = (percentage: number) => {
  if (percentage < 30) return '#4CAF50'; 
  if (percentage < 70) return '#FF9800'; 
  return '#F44336';
};

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const groupRoomsByFloor = (rooms: Room[]) => {
  return rooms.reduce<Record<string, Room[]>>((acc, room) => {
    const floorKey = String(room.floor ?? '');
    if (!acc[floorKey]) {
      acc[floorKey] = [];
    }
    acc[floorKey].push(room);
    return acc;
  }, {});
};


export const filterRooms = (rooms: Room[], filters: { floor?: string | number; status?: string }) => {
  let filtered = [...rooms];

  if (filters.floor) {
    filtered = filtered.filter((room) => room.floor === filters.floor);
  }

  if (filters.status) {
    filtered = filtered.filter((room) => room.status === filters.status);
  }

  return filtered;
};


export const generateRoomStats = (rooms: Room[]) => {
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

export const generateHostelStats = (hostels: HostelStats[]) => {
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

export const sortApplicationsByDate = (applications: Application[], order: 'asc' | 'desc' = 'desc') => {
  return [...applications].sort((a, b) => {
    const dateA = new Date(a.appliedDate || 0);
    const dateB = new Date(b.appliedDate || 0);
    return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });
};


export const isRoomAvailable = (room: Room) => {
  return room.status === 'available' && (room.assignedStudents?.length || 0) < (room.capacity || 0);
};


export const getRoomOccupancyDetails = (room: Room) => {
  const { capacity = 0, assignedStudents = [] } = room;
  const occupied = assignedStudents.length;
  return `${occupied}/${capacity} occupied`;
};


export const formatApplicationSummary = (application: Application) => {
  return `${application.studentName || 'Unknown'} - ${(application.status || '').toUpperCase()} (PNR: ${application.pnr || 'N/A'})`;
};


export const exportToCSV = (data: Array<Record<string, unknown>>, filename: string) => {
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
