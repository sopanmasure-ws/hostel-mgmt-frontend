import hostelReducer, { selectHostel, setHostels } from '../../src/store/hostelSlice';

// Mock the API module to avoid import.meta issues
jest.mock('../../src/lib/api', () => ({
  hostelAPI: {
    getAllHostels: jest.fn(),
  },
}));

describe('Hostel Slice - Student Hostel Selection', () => {
  const initialState = {
    hostels: [],
    selectedHostel: null,
    loading: false,
    error: null,
  };

  describe('Student Hostel Browsing', () => {
    it('should set hostels list', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
        { id: 'H2', _id: 'H2', name: 'Hostel B', capacity: 150, location: 'Location B', amenities: [] },
      ];

      const state = hostelReducer(initialState, setHostels(hostels));

      expect(state.hostels).toHaveLength(2);
      expect(state.hostels).toEqual(hostels);
    });

    it('should select hostel by id', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
        { id: 'H2', _id: 'H2', name: 'Hostel B', capacity: 150, location: 'Location B', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      state = hostelReducer(state, selectHostel('H1'));

      expect(state.selectedHostel).toEqual(hostels[0]);
    });

    it('should select hostel by _id', () => {
      const hostels = [
        { id: 'H1', _id: 'mongodb_id_1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
        { id: 'H2', _id: 'mongodb_id_2', name: 'Hostel B', capacity: 150, location: 'Location B', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      state = hostelReducer(state, selectHostel('mongodb_id_1'));

      expect(state.selectedHostel?.name).toBe('Hostel A');
    });

    it('should return null for non-existent hostel', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      state = hostelReducer(state, selectHostel('H999'));

      expect(state.selectedHostel).toBeNull();
    });

    it('should switch between selected hostels', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
        { id: 'H2', _id: 'H2', name: 'Hostel B', capacity: 150, location: 'Location B', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      
      // Select first hostel
      state = hostelReducer(state, selectHostel('H1'));
      expect(state.selectedHostel?.name).toBe('Hostel A');

      // Switch to second hostel
      state = hostelReducer(state, selectHostel('H2'));
      expect(state.selectedHostel?.name).toBe('Hostel B');
    });

    it('should handle empty hostels list', () => {
      const state = hostelReducer(initialState, setHostels([]));

      expect(state.hostels).toHaveLength(0);
      expect(state.selectedHostel).toBeNull();
    });

    it('should replace hostels when setting new list', () => {
      const oldHostels = [
        { id: 'H1', _id: 'H1', name: 'Old Hostel', capacity: 100, location: 'Location A', amenities: [] },
      ];

      const newHostels = [
        { id: 'H2', _id: 'H2', name: 'New Hostel A', capacity: 150, location: 'Location B', amenities: [] },
        { id: 'H3', _id: 'H3', name: 'New Hostel B', capacity: 200, location: 'Location C', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(oldHostels));
      state = hostelReducer(state, setHostels(newHostels));

      expect(state.hostels).toHaveLength(2);
      expect(state.hostels[0].name).toBe('New Hostel A');
    });
  });

  describe('Student Hostel Viewing', () => {
    it('should maintain selected hostel state', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: ['WiFi', 'AC'] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      state = hostelReducer(state, selectHostel('H1'));

      expect(state.selectedHostel).toBeTruthy();
      expect(state.selectedHostel?.amenities).toContain('WiFi');
    });

    it('should handle hostel selection for booking', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
        { id: 'H2', _id: 'H2', name: 'Hostel B', capacity: 150, location: 'Location B', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      
      // Student views Hostel B details for booking
      state = hostelReducer(state, selectHostel('H2'));

      expect(state.selectedHostel?.id).toBe('H2');
      expect(state.selectedHostel?.capacity).toBe(150);
    });

    it('should clear selection implicitly when selecting non-existent hostel', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      state = hostelReducer(state, selectHostel('H1'));
      state = hostelReducer(state, selectHostel('H999'));

      expect(state.selectedHostel).toBeNull();
    });
  });

  describe('Student Hostel Discovery', () => {
    it('should handle multiple hostels for comparison', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Budget Hostel', capacity: 50, location: 'Downtown', amenities: ['WiFi'] },
        { id: 'H2', _id: 'H2', name: 'Premium Hostel', capacity: 100, location: 'Uptown', amenities: ['WiFi', 'AC', 'Gym'] },
        { id: 'H3', _id: 'H3', name: 'Standard Hostel', capacity: 75, location: 'Midtown', amenities: ['WiFi', 'AC'] },
      ];

      const state = hostelReducer(initialState, setHostels(hostels));

      expect(state.hostels).toHaveLength(3);
      expect(state.hostels[1].amenities).toContain('Gym');
    });

    it('should handle hostel with complete details', () => {
      const hostel = {
        id: 'H1',
        _id: 'H1',
        name: 'Complete Hostel',
        capacity: 100,
        location: 'Main Street',
        amenities: ['WiFi', 'AC', 'Gym', 'Mess'],
        description: 'A fully equipped hostel',
        rating: 4.5,
        price: 5000,
      };

      let state = hostelReducer(initialState, setHostels([hostel]));
      state = hostelReducer(state, selectHostel('H1'));

      expect(state.selectedHostel).toEqual(hostel);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined id in selectHostel', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      state = hostelReducer(state, selectHostel(''));

      expect(state.selectedHostel).toBeNull();
    });

    it('should handle hostels without _id field', () => {
      const hostels = [
        { id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      state = hostelReducer(state, selectHostel('H1'));

      expect(state.selectedHostel?.name).toBe('Hostel A');
    });

    it('should handle duplicate hostel ids', () => {
      const hostels = [
        { id: 'H1', _id: 'H1', name: 'Hostel A', capacity: 100, location: 'Location A', amenities: [] },
        { id: 'H1', _id: 'H1', name: 'Hostel A Duplicate', capacity: 150, location: 'Location B', amenities: [] },
      ];

      let state = hostelReducer(initialState, setHostels(hostels));
      state = hostelReducer(state, selectHostel('H1'));

      // Should select the first match
      expect(state.selectedHostel?.name).toBe('Hostel A');
    });
  });
});
