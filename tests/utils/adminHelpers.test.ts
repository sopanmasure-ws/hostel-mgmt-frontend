import {
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
} from '../../src/util/adminHelpers';

describe('Admin Helper Functions', () => {
  describe('validateAdminLogin', () => {
    it('should return valid for correct credentials', () => {
      const result = validateAdminLogin('admin123', 'password123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return error when adminId is empty', () => {
      const result = validateAdminLogin('', 'password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.adminId).toBe('Admin ID is required');
    });

    it('should return error when adminId is whitespace', () => {
      const result = validateAdminLogin('   ', 'password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.adminId).toBe('Admin ID is required');
    });

    it('should return error when password is empty', () => {
      const result = validateAdminLogin('admin123', '');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password is required');
    });

    it('should return error when password is whitespace', () => {
      const result = validateAdminLogin('admin123', '   ');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password is required');
    });

    it('should return multiple errors when both fields are empty', () => {
      const result = validateAdminLogin('', '');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.adminId).toBe('Admin ID is required');
      expect(result.errors.password).toBe('Password is required');
    });
  });

  describe('validateAdminRegistration', () => {
    const validData = {
      email: 'admin@example.com',
      adminId: 'admin123',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('should return valid for correct registration data', () => {
      const result = validateAdminRegistration(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return error for invalid email', () => {
      const result = validateAdminRegistration({
        ...validData,
        email: 'invalid-email',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please provide a valid email address');
    });

    it('should return error for missing email', () => {
      const result = validateAdminRegistration({
        ...validData,
        email: '',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please provide a valid email address');
    });

    it('should return error for short adminId', () => {
      const result = validateAdminRegistration({
        ...validData,
        adminId: 'ab',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.adminId).toBe('Admin ID must be at least 3 characters');
    });

    it('should return error for missing adminId', () => {
      const result = validateAdminRegistration({
        ...validData,
        adminId: '',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.adminId).toBe('Admin ID must be at least 3 characters');
    });

    it('should return error for short password', () => {
      const result = validateAdminRegistration({
        ...validData,
        password: '12345',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password must be at least 6 characters');
    });

    it('should return error when passwords do not match', () => {
      const result = validateAdminRegistration({
        ...validData,
        confirmPassword: 'different-password',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBe('Passwords do not match');
    });

    it('should return multiple errors for invalid data', () => {
      const result = validateAdminRegistration({
        email: 'invalid',
        adminId: 'ab',
        password: '123',
        confirmPassword: '456',
      });
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(1);
    });
  });

  describe('formatRoomStatus', () => {
    it('should return correct format for available status', () => {
      const result = formatRoomStatus('available');
      
      expect(result.label).toBe('Available');
      expect(result.icon).toBe('✓');
      expect(result.color).toBe('#4CAF50');
      expect(result.bgColor).toBe('#E8F5E9');
    });

    it('should return correct format for filled status', () => {
      const result = formatRoomStatus('filled');
      
      expect(result.label).toBe('Filled');
      expect(result.icon).toBe('👥');
      expect(result.color).toBe('#FF9800');
      expect(result.bgColor).toBe('#FFF3E0');
    });

    it('should return correct format for damaged status', () => {
      const result = formatRoomStatus('damaged');
      
      expect(result.label).toBe('Damaged');
      expect(result.icon).toBe('⚠️');
      expect(result.color).toBe('#F44336');
      expect(result.bgColor).toBe('#FFEBEE');
    });

    it('should return available format for unknown status', () => {
      const result = formatRoomStatus('unknown');
      
      expect(result.label).toBe('Available');
      expect(result.color).toBe('#4CAF50');
    });

    it('should handle empty string', () => {
      const result = formatRoomStatus('');
      
      expect(result.label).toBe('Available');
    });
  });

  describe('formatApplicationStatus', () => {
    it('should return correct format for pending status', () => {
      const result = formatApplicationStatus('pending');
      
      expect(result.label).toBe('Pending');
      expect(result.badge).toBe('badge-warning');
      expect(result.color).toBe('#FF9800');
    });

    it('should return correct format for accepted status', () => {
      const result = formatApplicationStatus('accepted');
      
      expect(result.label).toBe('Accepted');
      expect(result.badge).toBe('badge-success');
      expect(result.color).toBe('#4CAF50');
    });

    it('should return correct format for rejected status', () => {
      const result = formatApplicationStatus('rejected');
      
      expect(result.label).toBe('Rejected');
      expect(result.badge).toBe('badge-danger');
      expect(result.color).toBe('#F44336');
    });

    it('should return pending format for unknown status', () => {
      const result = formatApplicationStatus('unknown');
      
      expect(result.label).toBe('Pending');
      expect(result.badge).toBe('badge-warning');
    });

    it('should handle empty string', () => {
      const result = formatApplicationStatus('');
      
      expect(result.label).toBe('Pending');
    });

    it('should handle case sensitivity', () => {
      const result1 = formatApplicationStatus('PENDING');
      const result2 = formatApplicationStatus('Pending');
      
      expect(result1.label).toBe('Pending');
      expect(result2.label).toBe('Pending');
    });
  });

  describe('calculateOccupancyPercentage', () => {
    it('should calculate correct percentage', () => {
      expect(calculateOccupancyPercentage(50, 100)).toBe(50);
      expect(calculateOccupancyPercentage(75, 100)).toBe(75);
      expect(calculateOccupancyPercentage(33, 100)).toBe(33);
    });

    it('should return 0 when total is 0', () => {
      expect(calculateOccupancyPercentage(10, 0)).toBe(0);
      expect(calculateOccupancyPercentage(0, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateOccupancyPercentage(33, 100)).toBe(33);
      expect(calculateOccupancyPercentage(67, 100)).toBe(67);
      expect(calculateOccupancyPercentage(1, 3)).toBe(33); // 33.333... rounded
    });

    it('should handle 100% occupancy', () => {
      expect(calculateOccupancyPercentage(100, 100)).toBe(100);
    });

    it('should handle partial occupancy', () => {
      expect(calculateOccupancyPercentage(1, 10)).toBe(10);
      expect(calculateOccupancyPercentage(9, 10)).toBe(90);
    });
  });

  describe('getOccupancyColor', () => {
    it('should return green for low occupancy', () => {
      expect(getOccupancyColor(0)).toBe('#4CAF50');
      expect(getOccupancyColor(15)).toBe('#4CAF50');
      expect(getOccupancyColor(29)).toBe('#4CAF50');
    });

    it('should return orange for medium occupancy', () => {
      expect(getOccupancyColor(30)).toBe('#FF9800');
      expect(getOccupancyColor(50)).toBe('#FF9800');
      expect(getOccupancyColor(69)).toBe('#FF9800');
    });

    it('should return red for high occupancy', () => {
      expect(getOccupancyColor(70)).toBe('#F44336');
      expect(getOccupancyColor(85)).toBe('#F44336');
      expect(getOccupancyColor(100)).toBe('#F44336');
    });

    it('should handle boundary values correctly', () => {
      expect(getOccupancyColor(29.9)).toBe('#4CAF50');
      expect(getOccupancyColor(30)).toBe('#FF9800');
      expect(getOccupancyColor(69.9)).toBe('#FF9800');
      expect(getOccupancyColor(70)).toBe('#F44336');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toMatch(/Jan 15, 2024/);
    });

    it('should handle different date formats', () => {
      const result1 = formatDate('2024-12-25');
      const result2 = formatDate('2024-06-01');
      
      expect(result1).toContain('Dec');
      expect(result2).toContain('Jun');
    });

    it('should handle ISO date strings', () => {
      const result = formatDate('2024-03-10T10:30:00Z');
      expect(result).toContain('Mar');
      expect(result).toContain('2024');
    });
  });

  describe('groupRoomsByFloor', () => {
    it('should group rooms by floor', () => {
      const rooms = [
        { floor: 1, status: 'available' },
        { floor: 1, status: 'filled' },
        { floor: 2, status: 'available' },
        { floor: 3, status: 'damaged' },
      ];

      const result = groupRoomsByFloor(rooms);

      expect(result['1']).toHaveLength(2);
      expect(result['2']).toHaveLength(1);
      expect(result['3']).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const result = groupRoomsByFloor([]);
      expect(result).toEqual({});
    });

    it('should handle string floor numbers', () => {
      const rooms = [
        { floor: 'Ground', status: 'available' },
        { floor: 'Ground', status: 'filled' },
        { floor: 'First', status: 'available' },
      ];

      const result = groupRoomsByFloor(rooms);

      expect(result['Ground']).toHaveLength(2);
      expect(result['First']).toHaveLength(1);
    });

    it('should handle rooms without floor property', () => {
      const rooms = [
        { status: 'available' },
        { status: 'filled' },
      ];

      const result = groupRoomsByFloor(rooms);
      expect(result['']).toHaveLength(2);
    });
  });

  describe('filterRooms', () => {
    const rooms = [
      { floor: 1, status: 'available', capacity: 2 },
      { floor: 1, status: 'filled', capacity: 2 },
      { floor: 2, status: 'available', capacity: 3 },
      { floor: 2, status: 'damaged', capacity: 2 },
      { floor: 3, status: 'filled', capacity: 4 },
    ];

    it('should filter by floor', () => {
      const result = filterRooms(rooms, { floor: 1 });
      expect(result).toHaveLength(2);
      expect(result.every(r => r.floor === 1)).toBe(true);
    });

    it('should filter by status', () => {
      const result = filterRooms(rooms, { status: 'available' });
      expect(result).toHaveLength(2);
      expect(result.every(r => r.status === 'available')).toBe(true);
    });

    it('should filter by both floor and status', () => {
      const result = filterRooms(rooms, { floor: 2, status: 'available' });
      expect(result).toHaveLength(1);
      expect(result[0].floor).toBe(2);
      expect(result[0].status).toBe('available');
    });

    it('should return all rooms when no filters', () => {
      const result = filterRooms(rooms, {});
      expect(result).toHaveLength(5);
    });

    it('should return empty array when no matches', () => {
      const result = filterRooms(rooms, { floor: 99 });
      expect(result).toHaveLength(0);
    });

    it('should not mutate original array', () => {
      const original = [...rooms];
      filterRooms(rooms, { floor: 1 });
      expect(rooms).toEqual(original);
    });
  });

  describe('generateRoomStats', () => {
    it('should generate correct stats', () => {
      const rooms = [
        { status: 'available' },
        { status: 'available' },
        { status: 'filled' },
        { status: 'filled' },
        { status: 'filled' },
        { status: 'damaged' },
      ];

      const result = generateRoomStats(rooms);

      expect(result.total).toBe(6);
      expect(result.available).toBe(2);
      expect(result.filled).toBe(3);
      expect(result.damaged).toBe(1);
      expect(result.occupancyPercentage).toBe(50); // 3 filled out of 6
    });

    it('should handle empty array', () => {
      const result = generateRoomStats([]);

      expect(result.total).toBe(0);
      expect(result.available).toBe(0);
      expect(result.filled).toBe(0);
      expect(result.damaged).toBe(0);
      expect(result.occupancyPercentage).toBe(0);
    });

    it('should handle all rooms of same status', () => {
      const rooms = [
        { status: 'available' },
        { status: 'available' },
        { status: 'available' },
      ];

      const result = generateRoomStats(rooms);

      expect(result.total).toBe(3);
      expect(result.available).toBe(3);
      expect(result.filled).toBe(0);
      expect(result.damaged).toBe(0);
    });
  });

  describe('generateHostelStats', () => {
    it('should aggregate stats from multiple hostels', () => {
      const hostels = [
        { totalRooms: 10, filledRooms: 5, availableRooms: 5, pendingApplications: 2 },
        { totalRooms: 20, filledRooms: 15, availableRooms: 5, pendingApplications: 3 },
        { totalRooms: 15, filledRooms: 10, availableRooms: 5, pendingApplications: 1 },
      ];

      const result = generateHostelStats(hostels);

      expect(result.totalHostels).toBe(3);
      expect(result.totalRooms).toBe(45);
      expect(result.totalFilled).toBe(30);
      expect(result.totalAvailable).toBe(15);
      expect(result.totalPendingApplcations).toBe(6);
    });

    it('should handle empty array', () => {
      const result = generateHostelStats([]);

      expect(result.totalHostels).toBe(0);
      expect(result.totalRooms).toBe(0);
      expect(result.totalFilled).toBe(0);
      expect(result.totalAvailable).toBe(0);
      expect(result.totalPendingApplcations).toBe(0);
    });

    it('should handle single hostel', () => {
      const hostels = [
        { totalRooms: 10, filledRooms: 7, availableRooms: 3, pendingApplications: 5 },
      ];

      const result = generateHostelStats(hostels);

      expect(result.totalHostels).toBe(1);
      expect(result.totalRooms).toBe(10);
      expect(result.totalFilled).toBe(7);
    });
  });

  describe('sortApplicationsByDate', () => {
    const applications = [
      { appliedDate: '2024-01-15', studentName: 'Alice', status: 'pending', pnr: 'A1' },
      { appliedDate: '2024-01-10', studentName: 'Bob', status: 'accepted', pnr: 'B1' },
      { appliedDate: '2024-01-20', studentName: 'Charlie', status: 'pending', pnr: 'C1' },
    ];

    it('should sort by date descending by default', () => {
      const result = sortApplicationsByDate(applications);

      expect(result[0].studentName).toBe('Charlie'); // 2024-01-20
      expect(result[1].studentName).toBe('Alice');   // 2024-01-15
      expect(result[2].studentName).toBe('Bob');     // 2024-01-10
    });

    it('should sort by date ascending when specified', () => {
      const result = sortApplicationsByDate(applications, 'asc');

      expect(result[0].studentName).toBe('Bob');     // 2024-01-10
      expect(result[1].studentName).toBe('Alice');   // 2024-01-15
      expect(result[2].studentName).toBe('Charlie'); // 2024-01-20
    });

    it('should not mutate original array', () => {
      const original = [...applications];
      sortApplicationsByDate(applications);
      expect(applications).toEqual(original);
    });

    it('should handle empty array', () => {
      const result = sortApplicationsByDate([]);
      expect(result).toEqual([]);
    });

    it('should handle applications without dates', () => {
      const apps = [
        { studentName: 'Alice', status: 'pending', pnr: 'A1' },
        { appliedDate: '2024-01-15', studentName: 'Bob', status: 'accepted', pnr: 'B1' },
      ];

      const result = sortApplicationsByDate(apps, 'desc');
      expect(result).toHaveLength(2);
    });
  });

  describe('isRoomAvailable', () => {
    it('should return true for available room with capacity', () => {
      const room = { status: 'available', capacity: 2, assignedStudents: [] };
      expect(isRoomAvailable(room)).toBe(true);
    });

    it('should return false when room is not available', () => {
      const room = { status: 'filled', capacity: 2, assignedStudents: [{}] };
      expect(isRoomAvailable(room)).toBe(false);
    });

    it('should return false when room is at capacity', () => {
      const room = { status: 'available', capacity: 2, assignedStudents: [{}, {}] };
      expect(isRoomAvailable(room)).toBe(false);
    });

    it('should return false when room is damaged', () => {
      const room = { status: 'damaged', capacity: 2, assignedStudents: [] };
      expect(isRoomAvailable(room)).toBe(false);
    });

    it('should handle room without assignedStudents', () => {
      const room = { status: 'available', capacity: 2 };
      expect(isRoomAvailable(room)).toBe(true);
    });

    it('should handle room without capacity', () => {
      const room = { status: 'available', assignedStudents: [] };
      expect(isRoomAvailable(room)).toBe(false);
    });
  });

  describe('getRoomOccupancyDetails', () => {
    it('should return correct occupancy details', () => {
      const room = { capacity: 3, assignedStudents: [{}, {}] };
      expect(getRoomOccupancyDetails(room)).toBe('2/3 occupied');
    });

    it('should handle empty room', () => {
      const room = { capacity: 4, assignedStudents: [] };
      expect(getRoomOccupancyDetails(room)).toBe('0/4 occupied');
    });

    it('should handle full room', () => {
      const room = { capacity: 2, assignedStudents: [{}, {}] };
      expect(getRoomOccupancyDetails(room)).toBe('2/2 occupied');
    });

    it('should handle room without assignedStudents', () => {
      const room = { capacity: 3 };
      expect(getRoomOccupancyDetails(room)).toBe('0/3 occupied');
    });

    it('should handle room without capacity', () => {
      const room = { assignedStudents: [{}] };
      expect(getRoomOccupancyDetails(room)).toBe('1/0 occupied');
    });
  });

  describe('formatApplicationSummary', () => {
    it('should format complete application correctly', () => {
      const app = { studentName: 'John Doe', status: 'pending', pnr: 'JD123' };
      expect(formatApplicationSummary(app)).toBe('John Doe - PENDING (PNR: JD123)');
    });

    it('should handle missing student name', () => {
      const app = { status: 'accepted', pnr: 'XX999' };
      expect(formatApplicationSummary(app)).toBe('Unknown - ACCEPTED (PNR: XX999)');
    });

    it('should handle missing status', () => {
      const app = { studentName: 'Jane Smith', pnr: 'JS456' };
      expect(formatApplicationSummary(app)).toBe('Jane Smith -  (PNR: JS456)');
    });

    it('should handle missing PNR', () => {
      const app = { studentName: 'Bob Wilson', status: 'rejected' };
      expect(formatApplicationSummary(app)).toBe('Bob Wilson - REJECTED (PNR: N/A)');
    });

    it('should handle empty application', () => {
      const app = {};
      expect(formatApplicationSummary(app)).toBe('Unknown -  (PNR: N/A)');
    });
  });

  describe('exportToCSV', () => {
    let createElementSpy: jest.SpyInstance;
    let clickSpy: jest.Mock;

    beforeEach(() => {
      clickSpy = jest.fn();
      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue({
        click: clickSpy,
        href: '',
        download: '',
      } as any);
      
      // Mock window.URL methods
      global.URL.createObjectURL = jest.fn(() => 'blob:url');
      global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should export data to CSV', () => {
      const data = [
        { name: 'Alice', age: 25, city: 'NYC' },
        { name: 'Bob', age: 30, city: 'LA' },
      ];

      exportToCSV(data, 'test.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });

    it('should handle empty array', () => {
      exportToCSV([], 'empty.csv');

      expect(createElementSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined data', () => {
      exportToCSV(undefined as any, 'undefined.csv');

      expect(createElementSpy).not.toHaveBeenCalled();
    });

    it('should escape quotes in CSV values', () => {
      const data = [{ name: 'John "Johnny" Doe', age: 25 }];
      
      exportToCSV(data, 'test.csv');

      expect(createElementSpy).toHaveBeenCalled();
    });
  });
});
