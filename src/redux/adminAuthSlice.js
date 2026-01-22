import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  admin: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  registeredAdmins: [], // Store all registered admins
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    // Register
    adminRegisterSuccess: (state, action) => {
      const newAdmin = {
        id: Date.now(),
        ...action.payload,
      };
      state.registeredAdmins.push(newAdmin);
      state.error = null;
    },
    adminRegisterFailure: (state, action) => {
      state.error = action.payload;
    },

    // Login
    adminLoginSuccess: (state, action) => {
      state.admin = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    adminLoginFailure: (state, action) => {
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    // Logout
    adminLogout: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Get all registered admins (helper)
    getAllAdmins: (state) => {
      return state.registeredAdmins;
    },
  },
});

export const {
  adminRegisterSuccess,
  adminRegisterFailure,
  adminLoginSuccess,
  adminLoginFailure,
  adminLogout,
  clearError,
  getAllAdmins,
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
