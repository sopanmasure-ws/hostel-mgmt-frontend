import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, Student } from '../types';

const initialState: AuthState & { loading: boolean; error: string | null } = {
  user: null,
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerSuccess: (state, action: PayloadAction<Student>) => {
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    loginSuccess: (state, action: PayloadAction<Student>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
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
  },
});

export const { 
  registerSuccess, 
  registerFailure, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError,
} = authSlice.actions;
export default authSlice.reducer;
