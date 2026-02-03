import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hostelAPI } from '../lib/api';
import { SAMPLE_APPLICATIONS } from '../util/data';

export const fetchAllHostels = createAsyncThunk(
  'hostel/fetchAllHostels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hostelAPI.getAllHostels();
      return Array.isArray(response) ? response : response.hostels || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hostels');
    }
  }
);

const initialState = {
  hostels: [],
  selectedHostel: null,
  filteredHostels: [],
  loading: false,
  error: null,
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
      state.filteredHostels = state.hostels.filter(
        (hostel) => hostel.gender === action.payload
      );
    },
    selectHostel: (state, action) => {
      state.selectedHostel = state.hostels.find(
        (hostel) => hostel.id === action.payload
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
    setHostels: (state, action) => {
      state.hostels = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllHostels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllHostels.fulfilled, (state, action) => {
        state.loading = false;
        state.hostels = action.payload;
      })
      .addCase(fetchAllHostels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  filterHostelsByGender,
  selectHostel,
  updateApplicationForm,
  resetApplicationForm,
  setHostels,
} = hostelSlice.actions;
export default hostelSlice.reducer;
