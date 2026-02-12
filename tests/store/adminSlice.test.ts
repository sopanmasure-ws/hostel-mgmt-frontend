import adminReducer, {
  setAdminHostels,
  setCurrentHostel,
  setApplications,
  addApplication,
  updateApplicationStatus,
  setRooms,
  updateRoomStatus,
  setFilter,
  clearFilters,
} from '../../src/store/adminSlice';

describe('Admin Slice - Admin & SuperAdmin Operations', () => {
  const initialState = {
    adminHostels: [],
    currentHostel: null,
    applications: [],
    rooms: [],
    filters: {
      floor: null,
      roomStatus: null,
    },
    loading: false,
    error: null,
  };

  describe('Admin Hostel Management', () => {
    it('should set admin hostels', () => {
      const hostels = [
        { id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A' },
        { id: 'H2', name: 'Hostel B', capacity: 150, location: 'Location B' },
      ];

      const state = adminReducer(initialState, setAdminHostels(hostels));

      expect(state.adminHostels).toHaveLength(2);
      expect(state.adminHostels).toEqual(hostels);
      expect(state.error).toBeNull();
    });

    it('should set current hostel', () => {
      const hostel = { id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A' };

      const state = adminReducer(initialState, setCurrentHostel(hostel));

      expect(state.currentHostel).toEqual(hostel);
    });

    it('should clear current hostel', () => {
      const stateWithHostel = {
        ...initialState,
        currentHostel: { id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A' },
      };

      const state = adminReducer(stateWithHostel, setCurrentHostel(null));

      expect(state.currentHostel).toBeNull();
    });

    it('should switch between hostels', () => {
      const hostel1 = { id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A' };
      const hostel2 = { id: 'H2', name: 'Hostel B', capacity: 150, location: 'Location B' };

      let state = adminReducer(initialState, setCurrentHostel(hostel1));
      expect(state.currentHostel?.id).toBe('H1');

      state = adminReducer(state, setCurrentHostel(hostel2));
      expect(state.currentHostel?.id).toBe('H2');
    });
  });

  describe('Admin Application Management', () => {
    it('should set applications', () => {
      const applications = [
        { id: 'app1', studentName: 'John', status: 'pending', pnr: 'PNR123', _id: 'app1' },
        { id: 'app2', studentName: 'Jane', status: 'accepted', pnr: 'PNR456', _id: 'app2' },
      ];

      const state = adminReducer(initialState, setApplications(applications));

      expect(state.applications).toHaveLength(2);
      expect(state.applications).toEqual(applications);
    });

    it('should add new application', () => {
      const application = {
        id: 'app1',
        studentName: 'John Doe',
        status: 'pending',
        pnr: 'PNR123',
        _id: 'app1',
      };

      const state = adminReducer(initialState, addApplication(application));

      expect(state.applications).toHaveLength(1);
      expect(state.applications[0]).toEqual(application);
    });

    it('should update application status to accepted', () => {
      const stateWithApps = {
        ...initialState,
        applications: [
          { id: 'app1', studentName: 'John', status: 'pending', pnr: 'PNR123', _id: 'app1' },
        ],
      };

      const state = adminReducer(
        stateWithApps,
        updateApplicationStatus({
          applicationId: 'app1',
          status: 'accepted',
          roomNumber: '201',
          floor: '2',
        })
      );

      expect(state.applications[0].status).toBe('accepted');
      expect(state.applications[0].roomNumber).toBe('201');
      expect(state.applications[0].floor).toBe('2');
    });

    it('should update application status to rejected with reason', () => {
      const stateWithApps = {
        ...initialState,
        applications: [
          { id: 'app1', studentName: 'John', status: 'pending', pnr: 'PNR123', _id: 'app1' },
        ],
      };

      const state = adminReducer(
        stateWithApps,
        updateApplicationStatus({
          applicationId: 'app1',
          status: 'rejected',
          reason: 'Insufficient documents',
        })
      );

      expect(state.applications[0].status).toBe('rejected');
      expect(state.applications[0].rejectionReason).toBe('Insufficient documents');
    });

    it('should find application by _id', () => {
      const stateWithApps = {
        ...initialState,
        applications: [
          { studentName: 'John', status: 'pending', pnr: 'PNR123', _id: 'mongodb_id_1' },
        ],
      };

      const state = adminReducer(
        stateWithApps,
        updateApplicationStatus({
          applicationId: 'mongodb_id_1',
          status: 'accepted',
        })
      );

      expect(state.applications[0].status).toBe('accepted');
    });
  });

  describe('Admin Room Management', () => {
    it('should set rooms', () => {
      const rooms = [
        { id: 'r1', roomNumber: '101', floor: 1, status: 'available', capacity: 2, _id: 'r1' },
        { id: 'r2', roomNumber: '102', floor: 1, status: 'occupied', capacity: 2, _id: 'r2' },
      ];

      const state = adminReducer(initialState, setRooms(rooms));

      expect(state.rooms).toHaveLength(2);
      expect(state.rooms).toEqual(rooms);
    });

    it('should update room status to filled', () => {
      const stateWithRooms = {
        ...initialState,
        rooms: [
          { id: 'r1', roomNumber: '101', floor: 1, status: 'available', capacity: 2, _id: 'r1' },
        ],
      };

      const state = adminReducer(
        stateWithRooms,
        updateRoomStatus({
          roomId: 'r1',
          status: 'filled',
          studentId: 'student1',
          studentName: 'John Doe',
        })
      );

      expect(state.rooms[0].status).toBe('occupied');
      expect(state.rooms[0].assignedStudent).toEqual({
        id: 'student1',
        name: 'John Doe',
      });
    });

    it('should update room status to available', () => {
      const stateWithRooms = {
        ...initialState,
        rooms: [
          {
            id: 'r1',
            roomNumber: '101',
            floor: 1,
            status: 'occupied',
            capacity: 2,
            assignedStudent: { id: 's1', name: 'John' },
            _id: 'r1',
          },
        ],
      };

      const state = adminReducer(
        stateWithRooms,
        updateRoomStatus({
          roomId: 'r1',
          status: 'available',
        })
      );

      expect(state.rooms[0].status).toBe('available');
      expect(state.rooms[0].assignedStudent).toBeNull();
    });

    it('should update room status to damaged', () => {
      const stateWithRooms = {
        ...initialState,
        rooms: [
          { id: 'r1', roomNumber: '101', floor: 1, status: 'available', capacity: 2, _id: 'r1' },
        ],
      };

      const state = adminReducer(
        stateWithRooms,
        updateRoomStatus({
          roomId: 'r1',
          status: 'damaged',
        })
      );

      expect(state.rooms[0].status).toBe('damaged');
      expect(state.rooms[0].assignedStudent).toBeNull();
    });

    it('should find room by _id', () => {
      const stateWithRooms = {
        ...initialState,
        rooms: [
          { roomNumber: '101', floor: 1, status: 'available', capacity: 2, _id: 'mongodb_room_1' },
        ],
      };

      const state = adminReducer(
        stateWithRooms,
        updateRoomStatus({
          roomId: 'mongodb_room_1',
          status: 'damaged',
        })
      );

      expect(state.rooms[0].status).toBe('damaged');
    });
  });

  describe('Admin Filter Management', () => {
    it('should set floor filter', () => {
      const state = adminReducer(initialState, setFilter({ filterType: 'floor', value: 2 }));

      expect(state.filters.floor).toBe(2);
    });

    it('should set room status filter', () => {
      const state = adminReducer(initialState, setFilter({ filterType: 'roomStatus', value: 'available' }));

      expect(state.filters.roomStatus).toBe('available');
    });

    it('should update existing filter', () => {
      const stateWithFilters = {
        ...initialState,
        filters: { floor: 1, roomStatus: 'available' },
      };

      const state = adminReducer(stateWithFilters, setFilter({ filterType: 'floor', value: 3 }));

      expect(state.filters.floor).toBe(3);
      expect(state.filters.roomStatus).toBe('available');
    });

    it('should clear all filters', () => {
      const stateWithFilters = {
        ...initialState,
        filters: { floor: 2, roomStatus: 'occupied' },
      };

      const state = adminReducer(stateWithFilters, clearFilters());

      expect(state.filters.floor).toBeNull();
      expect(state.filters.roomStatus).toBeNull();
    });

    it('should handle multiple filter updates', () => {
      let state = adminReducer(initialState, setFilter({ filterType: 'floor', value: 1 }));
      state = adminReducer(state, setFilter({ filterType: 'roomStatus', value: 'available' }));

      expect(state.filters.floor).toBe(1);
      expect(state.filters.roomStatus).toBe('available');
    });
  });

  describe('SuperAdmin Operations', () => {
    it('should manage multiple hostels', () => {
      const hostels = [
        { id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A' },
        { id: 'H2', name: 'Hostel B', capacity: 150, location: 'Location B' },
        { id: 'H3', name: 'Hostel C', capacity: 200, location: 'Location C' },
      ];

      const state = adminReducer(initialState, setAdminHostels(hostels));

      expect(state.adminHostels).toHaveLength(3);
    });

    it('should switch between different hostel contexts', () => {
      const hostels = [
        { id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A' },
        { id: 'H2', name: 'Hostel B', capacity: 150, location: 'Location B' },
      ];

      let state = adminReducer(initialState, setAdminHostels(hostels));
      
      // SuperAdmin views Hostel A
      state = adminReducer(state, setCurrentHostel(hostels[0]));
      expect(state.currentHostel?.name).toBe('Hostel A');

      // SuperAdmin switches to Hostel B
      state = adminReducer(state, setCurrentHostel(hostels[1]));
      expect(state.currentHostel?.name).toBe('Hostel B');
    });

    it('should manage applications across multiple hostels', () => {
      const hostelAApps = [
        { id: 'app1', studentName: 'John', status: 'pending', hostelId: 'H1', pnr: 'PNR123', _id: 'app1' },
      ];

      const hostelBApps = [
        { id: 'app2', studentName: 'Jane', status: 'pending', hostelId: 'H2', pnr: 'PNR456', _id: 'app2' },
      ];

      let state = adminReducer(initialState, setApplications(hostelAApps));
      expect(state.applications).toHaveLength(1);

      state = adminReducer(state, setApplications(hostelBApps));
      expect(state.applications).toHaveLength(1);
      expect(state.applications[0].hostelId).toBe('H2');
    });
  });

  describe('Admin Workflow Integration', () => {
    it('should handle complete room allocation workflow', () => {
      // Set up hostel and rooms
      let state = adminReducer(
        initialState,
        setRooms([
          { id: 'r1', roomNumber: '101', floor: 1, status: 'available', capacity: 2, _id: 'r1' },
        ])
      );

      // Set up application
      state = adminReducer(
        state,
        setApplications([
          { id: 'app1', studentName: 'John', status: 'pending', pnr: 'PNR123', _id: 'app1' },
        ])
      );

      // Accept application
      state = adminReducer(
        state,
        updateApplicationStatus({
          applicationId: 'app1',
          status: 'accepted',
          roomNumber: '101',
          floor: '1',
        })
      );

      // Update room status
      state = adminReducer(
        state,
        updateRoomStatus({
          roomId: 'r1',
          status: 'filled',
          studentId: 'student1',
          studentName: 'John',
        })
      );

      expect(state.applications[0].status).toBe('accepted');
      expect(state.rooms[0].status).toBe('occupied');
    });

    it('should handle filter-based room search', () => {
      const rooms = [
        { id: 'r1', roomNumber: '101', floor: 1, status: 'available', capacity: 2, _id: 'r1' },
        { id: 'r2', roomNumber: '201', floor: 2, status: 'available', capacity: 2, _id: 'r2' },
        { id: 'r3', roomNumber: '202', floor: 2, status: 'occupied', capacity: 2, _id: 'r3' },
      ];

      let state = adminReducer(initialState, setRooms(rooms));
      state = adminReducer(state, setFilter({ filterType: 'floor', value: 2 }));
      state = adminReducer(state, setFilter({ filterType: 'roomStatus', value: 'available' }));

      expect(state.filters.floor).toBe(2);
      expect(state.filters.roomStatus).toBe('available');
    });
  });
});
