import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import hostelReducer from './hostelSlice';
import applicationReducer from './applicationSlice';
import adminAuthReducer from './adminAuthSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hostel: hostelReducer,
    application: applicationReducer,
    adminAuth: adminAuthReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
