import { createSlice } from '@reduxjs/toolkit';
import { SAMPLE_APPLICATIONS } from '../utils/data';

const initialState = {
  applications: SAMPLE_APPLICATIONS,
  newApplicationId: 3,
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    submitApplication: (state, action) => {
      const userHasApplication = state.applications.some(
        (app) => app.userId === action.payload.userId && app.status == 'APPROVED'
      );
      
      if (userHasApplication) {
        return; 
      }

      const newApplication = {
        id: state.newApplicationId,
        ...action.payload,
      };
      state.applications.push(newApplication);
      state.newApplicationId += 1;
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

export const { submitApplication, updateApplicationStatus } = applicationSlice.actions;
export default applicationSlice.reducer;
