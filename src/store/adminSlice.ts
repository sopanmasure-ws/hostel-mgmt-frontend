import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Application, Hostel, Room, ApplicationStatus, RoomStatus } from '../types';

interface AdminState {
  adminHostels: Hostel[];
  currentHostel: Hostel | null;
  applications: Application[];
  rooms: Room[];
  filters: {
    floor: string | number | null;
    roomStatus: string | number | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
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
    setAdminHostels: (state, action: PayloadAction<Hostel[]>) => {
      state.adminHostels = action.payload;
      state.error = null;
    },

    setCurrentHostel: (state, action: PayloadAction<Hostel | null>) => {
      state.currentHostel = action.payload;
    },

    setApplications: (state, action: PayloadAction<Application[]>) => {
      state.applications = action.payload;
    },

    addApplication: (state, action: PayloadAction<Application>) => {
      state.applications.push(action.payload);
    },

    updateApplicationStatus: (state, action: PayloadAction<{ applicationId: string; status: string; roomNumber?: string; floor?: string; reason?: string }>) => {
      const { applicationId, status, roomNumber, floor, reason } = action.payload;
      const app = state.applications.find((a) => (a as any).id === applicationId || a._id === applicationId);
      if (app) {
        app.status = status as ApplicationStatus;
        if (status === 'accepted') {
          app.roomNumber = roomNumber;
          app.floor = floor;
        }
        if (status === 'rejected') {
          app.rejectionReason = reason;
        }
      }
    },

    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
    },

    updateRoomStatus: (state, action: PayloadAction<{ roomId: string; status: string; studentId?: string; studentName?: string }>) => {
      const { roomId, status, studentId, studentName } = action.payload;
      const room = state.rooms.find((r) => r.id === roomId || r._id === roomId);
      if (room) {
        room.status = (status === 'filled' ? 'occupied' : status) as RoomStatus;
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
    setFilter: (state, action: PayloadAction<{ filterType: 'floor' | 'roomStatus'; value: string | number | null }>) => {
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
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
