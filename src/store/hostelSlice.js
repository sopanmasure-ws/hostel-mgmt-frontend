import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hostelAPI } from '../lib/api';

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
  loading: false,
  error: null,
};

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    selectHostel: (state, action) => {
      state.selectedHostel = state.hostels.find(
        (hostel) => hostel.id === action.payload
      );
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
  selectHostel,
  setHostels,
} = hostelSlice.actions;
export default hostelSlice.reducer;
