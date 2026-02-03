import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  admin: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  registeredAdmins: [],
  role: null, // 'admin' or 'superAdmin'
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
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

    
    adminLoginSuccess: (state, action) => {
      state.admin = action.payload.admin;
      state.role = action.payload.role || 'admin'; // Default to admin if role not provided
      state.isAuthenticated = true;
      state.error = null;
    },
    adminLoginFailure: (state, action) => {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.role = null;
    },

    adminLogout: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      state.error = null;
      state.role = null;
    },

    clearError: (state) => {
      state.error = null;
    },

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
