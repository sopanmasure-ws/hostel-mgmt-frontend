import authReducer, {
  registerSuccess,
  registerFailure,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} from '../../src/store/authSlice';

describe('Student Auth Slice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null,
  };

  describe('Student Registration Flow', () => {
    it('should handle registerSuccess', () => {
      const student = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        pnr: 'PNR123',
      };

      const state = authReducer(initialState, registerSuccess(student));

      expect(state.error).toBeNull();
    });

    it('should handle registerFailure', () => {
      const errorMessage = 'Registration failed';
      
      const state = authReducer(initialState, registerFailure(errorMessage));

      expect(state.error).toBe(errorMessage);
    });

    it('should clear previous error on successful registration', () => {
      const stateWithError = { ...initialState, error: 'Previous error' };
      const student = { id: '1', name: 'John', email: 'john@test.com', pnr: 'PNR123' };

      const state = authReducer(stateWithError, registerSuccess(student));

      expect(state.error).toBeNull();
    });
  });

  describe('Student Login Flow', () => {
    it('should handle loginSuccess', () => {
      const student = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        pnr: 'PNR123',
      };

      const state = authReducer(initialState, loginSuccess(student));

      expect(state.user).toEqual(student);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle loginFailure', () => {
      const errorMessage = 'Invalid credentials';
      
      const state = authReducer(initialState, loginFailure(errorMessage));

      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should update authenticated user on login', () => {
      const oldStudent = { id: '1', name: 'Old User', email: 'old@test.com', pnr: 'OLD123' };
      const newStudent = { id: '2', name: 'New User', email: 'new@test.com', pnr: 'NEW123' };
      
      let state = authReducer(initialState, loginSuccess(oldStudent));
      state = authReducer(state, loginSuccess(newStudent));

      expect(state.user).toEqual(newStudent);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should reset authentication state on login failure', () => {
      const student = { id: '1', name: 'John', email: 'john@test.com', pnr: 'PNR123' };
      let state = authReducer(initialState, loginSuccess(student));
      
      state = authReducer(state, loginFailure('Session expired'));

      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Session expired');
    });
  });

  describe('Student Logout Flow', () => {
    it('should handle logout', () => {
      const authenticatedState = {
        user: { id: '1', name: 'John', email: 'john@test.com', pnr: 'PNR123' },
        isAuthenticated: true,
        token: 'token123',
        loading: false,
        error: null,
      };

      const state = authReducer(authenticatedState, logout());

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear error on logout', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
        user: { id: '1', name: 'John', email: 'john@test.com', pnr: 'PNR123' },
        isAuthenticated: true,
      };

      const state = authReducer(stateWithError, logout());

      expect(state.error).toBeNull();
      expect(state.user).toBeNull();
    });

    it('should handle logout when already logged out', () => {
      const state = authReducer(initialState, logout());

      expect(state).toEqual(initialState);
    });
  });

  describe('Error Management', () => {
    it('should clear error', () => {
      const stateWithError = { ...initialState, error: 'Test error' };

      const state = authReducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });

    it('should not affect other state when clearing error', () => {
      const stateWithUser = {
        user: { id: '1', name: 'John', email: 'john@test.com', pnr: 'PNR123' },
        isAuthenticated: true,
        token: 'token123',
        loading: false,
        error: 'Some error',
      };

      const state = authReducer(stateWithUser, clearError());

      expect(state.error).toBeNull();
      expect(state.user).toEqual(stateWithUser.user);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('Student Session Management', () => {
    it('should maintain user state across multiple actions', () => {
      const student = { id: '1', name: 'John', email: 'john@test.com', pnr: 'PNR123' };
      
      let state = authReducer(initialState, loginSuccess(student));
      expect(state.isAuthenticated).toBe(true);
      
      state = authReducer(state, clearError());
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(student);
    });

    it('should handle complete authentication cycle', () => {
      const student = { id: '1', name: 'John', email: 'john@test.com', pnr: 'PNR123' };
      
      // Register
      let state = authReducer(initialState, registerSuccess(student));
      expect(state.error).toBeNull();
      
      // Login
      state = authReducer(state, loginSuccess(student));
      expect(state.isAuthenticated).toBe(true);
      
      // Logout
      state = authReducer(state, logout());
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
