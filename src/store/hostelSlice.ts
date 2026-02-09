import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { hostelAPI } from '../lib/api';
import type { Hostel } from '../types';

export const fetchAllHostels = createAsyncThunk<Hostel[], void, { rejectValue: string }>(
  'hostel/fetchAllHostels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hostelAPI.getAllHostels();
      return Array.isArray(response) ? response : response.hostels || [];
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch hostels';
      return rejectWithValue(msg);
    }
  }
);

interface HostelState {
  hostels: Hostel[];
  selectedHostel: Hostel | null;
  loading: boolean;
  error: string | null;
}

const initialState: HostelState = {
  hostels: [],
  selectedHostel: null,
  loading: false,
  error: null,
};

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    selectHostel: (state, action: PayloadAction<string>) => {
      state.selectedHostel = state.hostels.find(
        (hostel) => hostel.id === action.payload || hostel._id === action.payload
      ) || null;
    },
    setHostels: (state, action: PayloadAction<Hostel[]>) => {
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
        state.error = action.payload || 'Failed to fetch hostels';
      });
  },
});

export const {
  selectHostel,
  setHostels,
} = hostelSlice.actions;
export default hostelSlice.reducer;
