import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import hostelReducer from './hostelSlice';
import applicationReducer from './applicationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hostel: hostelReducer,
    application: applicationReducer,
  },
});
