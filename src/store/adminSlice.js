import { createSlice } from '@reduxjs/toolkit';

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

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminHostels: (state, action) => {
      state.adminHostels = action.payload;
      state.error = null;
    },

    setCurrentHostel: (state, action) => {
      state.currentHostel = action.payload;
    },

    setApplications: (state, action) => {
      state.applications = action.payload;
    },

    addApplication: (state, action) => {
      state.applications.push(action.payload);
    },

    updateApplicationStatus: (state, action) => {
      const { applicationId, status, roomNumber, floor, reason } = action.payload;
      const app = state.applications.find((a) => a.id === applicationId);
      if (app) {
        app.status = status;
        if (status === 'accepted') {
          app.roomNumber = roomNumber;
          app.floor = floor;
        }
        if (status === 'rejected') {
          app.rejectionReason = reason;
        }
      }
    },

    setRooms: (state, action) => {
      state.rooms = action.payload;
    },

    updateRoomStatus: (state, action) => {
      const { roomId, status, studentId, studentName } = action.payload;
      const room = state.rooms.find((r) => r.id === roomId);
      if (room) {
        room.status = status;
        if (status === 'filled') {
          room.assignedStudent = {
            id: studentId,
            name: studentName,
          };
        } else {
          room.assignedStudent = null;
        }
      }
    },

    // Filters
    setFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.filters[filterType] = value;
    },

    clearFilters: (state) => {
      state.filters = {
        floor: null,
        roomStatus: null,
      };
    },

    // Error handling
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setAdminHostels,
  setCurrentHostel,
  setApplications,
  addApplication,
  updateApplicationStatus,
  setRooms,
  updateRoomStatus,
  setFilter,
  clearFilters,
  setLoading,
  setError,
  clearError,
} = adminSlice.actions;

export default adminSlice.reducer;
