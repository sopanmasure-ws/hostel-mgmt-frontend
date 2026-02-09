import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  applications: [],
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state.applications = action.payload;
    },
    submitApplication: (state, action) => {
      const userHasApplication = state.applications.some(
        (app) => app.userId === action.payload.userId && app.status === 'APPROVED'
      );
      
      if (userHasApplication) {
        return; 
      }

      state.applications.push(action.payload);
    },
    updateApplicationStatus: (state, action) => {
      const { applicationId, status, roomNumber, floor, reason } = action.payload;
      const application = state.applications.find((app) => app.id === applicationId);
      if (application) {
        application.status = status;
        if (roomNumber) application.roomNumber = roomNumber;
        if (floor) application.floor = floor;
        if (reason) application.reason = reason;
      }
    },
  },
});

export const { setApplications, submitApplication, updateApplicationStatus } = applicationSlice.actions;
export default applicationSlice.reducer;
