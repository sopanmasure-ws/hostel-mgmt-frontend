import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  registeredUsers: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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

    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

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
