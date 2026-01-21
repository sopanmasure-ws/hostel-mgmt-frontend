import { createSlice } from '@reduxjs/toolkit';
import { HOSTELS_DATA, SAMPLE_APPLICATIONS } from '../utils/data';

const initialState = {
  hostels: HOSTELS_DATA,
  selectedHostel: null,
  filteredHostels: [],
  applicationForm: {
    hostelId: null,
    year: '',
    caste: '',
    dob: '',
    branch: '',
  },
};

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    filterHostelsByGender: (state, action) => {
        console.log("state", state.hostels);
      state.filteredHostels = state.hostels.filter(
        (hostel) => hostel.gender === action.payload
      );
    },
    selectHostel: (state, action) => {
      state.selectedHostel = state.hostels.find(
        (h) => h.id === action.payload
      );
    },
    updateApplicationForm: (state, action) => {
      state.applicationForm = {
        ...state.applicationForm,
        ...action.payload,
      };
    },
    resetApplicationForm: (state) => {
      state.applicationForm = {
        hostelId: null,
        year: '',
        caste: '',
        dob: '',
        branch: '',
      };
    },
  },
});

export const {
  filterHostelsByGender,
  selectHostel,
  updateApplicationForm,
  resetApplicationForm,
} = hostelSlice.actions;
export default hostelSlice.reducer;
