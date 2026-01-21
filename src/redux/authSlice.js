import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  registeredUsers: [], // Store all registered users
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Register
    registerSuccess: (state, action) => {
      const newUser = {
        id: Date.now(),
        ...action.payload,
      };
      state.registeredUsers.push(newUser);
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.error = action.payload;
    },

    // Login
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Get all registered users (helper)
    getRegisteredUsers: (state) => {
      return state.registeredUsers;
    },
  },
});

export const { 
  registerSuccess, 
  registerFailure, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError,
  getRegisteredUsers 
} = authSlice.actions;
export default authSlice.reducer;
