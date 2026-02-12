import adminAuthReducer, {
  adminRegisterSuccess,
  adminRegisterFailure,
  adminLoginSuccess,
  adminLoginFailure,
  adminLogout,
  clearError,
} from '../../src/store/adminAuthSlice';

describe('Admin Auth Slice', () => {
  const initialState = {
    admin: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null,
    registeredAdmins: [],
    role: null,
  };

  describe('Admin Registration Flow', () => {
    it('should handle adminRegisterSuccess', () => {
      const admin = {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@hostel.com',
        hostelId: 'H1',
      };

      const state = adminAuthReducer(initialState, adminRegisterSuccess(admin));

      expect(state.registeredAdmins).toHaveLength(1);
      expect(state.registeredAdmins[0]).toMatchObject(admin);
      expect(state.registeredAdmins[0].id).toBeDefined();
      expect(state.error).toBeNull();
    });

    it('should handle adminRegisterFailure', () => {
      const errorMessage = 'Admin registration failed';
      
      const state = adminAuthReducer(initialState, adminRegisterFailure(errorMessage));

      expect(state.error).toBe(errorMessage);
      expect(state.registeredAdmins).toHaveLength(0);
    });

    it('should add multiple admins to registered list', () => {
      const admin1 = { id: 'a1', name: 'Admin 1', email: 'admin1@test.com', hostelId: 'H1' };
      const admin2 = { id: 'a2', name: 'Admin 2', email: 'admin2@test.com', hostelId: 'H2' };

      let state = adminAuthReducer(initialState, adminRegisterSuccess(admin1));
      state = adminAuthReducer(state, adminRegisterSuccess(admin2));

      expect(state.registeredAdmins).toHaveLength(2);
    });
  });

  describe('Admin Login Flow', () => {
    it('should handle adminLoginSuccess with default role', () => {
      const admin = {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@hostel.com',
        hostelId: 'H1',
      };

      const state = adminAuthReducer(initialState, adminLoginSuccess({ admin }));

      expect(state.admin).toEqual(admin);
      expect(state.isAuthenticated).toBe(true);
      expect(state.role).toBe('admin');
      expect(state.error).toBeNull();
    });

    it('should handle adminLoginSuccess with admin role', () => {
      const admin = {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@hostel.com',
        hostelId: 'H1',
      };

      const state = adminAuthReducer(initialState, adminLoginSuccess({ admin, role: 'admin' }));

      expect(state.admin).toEqual(admin);
      expect(state.isAuthenticated).toBe(true);
      expect(state.role).toBe('admin');
    });

    it('should handle adminLoginFailure', () => {
      const errorMessage = 'Invalid admin credentials';
      
      const state = adminAuthReducer(initialState, adminLoginFailure(errorMessage));

      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
      expect(state.role).toBeNull();
    });

    it('should reset authentication on login failure', () => {
      const admin = { id: 'a1', name: 'Admin', email: 'admin@test.com', hostelId: 'H1' };
      let state = adminAuthReducer(initialState, adminLoginSuccess({ admin, role: 'admin' }));
      
      state = adminAuthReducer(state, adminLoginFailure('Token expired'));

      expect(state.isAuthenticated).toBe(false);
      expect(state.role).toBeNull();
      expect(state.error).toBe('Token expired');
    });
  });

  describe('Super Admin Login Flow', () => {
    it('should handle superAdmin login', () => {
      const superAdmin = {
        id: 'super1',
        name: 'Super Admin',
        email: 'super@hostel.com',
      };

      const state = adminAuthReducer(initialState, adminLoginSuccess({ admin: superAdmin, role: 'superAdmin' }));

      expect(state.admin).toEqual(superAdmin);
      expect(state.isAuthenticated).toBe(true);
      expect(state.role).toBe('superAdmin');
      expect(state.error).toBeNull();
    });

    it('should distinguish between admin and superAdmin roles', () => {
      const admin = { id: 'a1', name: 'Admin', email: 'admin@test.com', hostelId: 'H1' };
      const superAdmin = { id: 's1', name: 'Super Admin', email: 'super@test.com' };

      let state = adminAuthReducer(initialState, adminLoginSuccess({ admin, role: 'admin' }));
      expect(state.role).toBe('admin');

      state = adminAuthReducer(initialState, adminLoginSuccess({ admin: superAdmin, role: 'superAdmin' }));
      expect(state.role).toBe('superAdmin');
    });

    it('should handle superAdmin session switch', () => {
      const admin = { id: 'a1', name: 'Admin', email: 'admin@test.com', hostelId: 'H1' };
      const superAdmin = { id: 's1', name: 'Super Admin', email: 'super@test.com' };

      let state = adminAuthReducer(initialState, adminLoginSuccess({ admin, role: 'admin' }));
      state = adminAuthReducer(state, adminLoginSuccess({ admin: superAdmin, role: 'superAdmin' }));

      expect(state.admin).toEqual(superAdmin);
      expect(state.role).toBe('superAdmin');
    });
  });

  describe('Admin Logout Flow', () => {
    it('should handle adminLogout', () => {
      const authenticatedState = {
        admin: { id: 'a1', name: 'Admin', email: 'admin@test.com', hostelId: 'H1' },
        isAuthenticated: true,
        token: 'admin-token',
        loading: false,
        error: null,
        registeredAdmins: [],
        role: 'admin' as const,
      };

      const state = adminAuthReducer(authenticatedState, adminLogout());

      expect(state.admin).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.role).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should clear superAdmin session on logout', () => {
      const authenticatedState = {
        admin: { id: 's1', name: 'Super Admin', email: 'super@test.com' },
        isAuthenticated: true,
        token: 'super-token',
        loading: false,
        error: null,
        registeredAdmins: [],
        role: 'superAdmin' as const,
      };

      const state = adminAuthReducer(authenticatedState, adminLogout());

      expect(state.admin).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.role).toBeNull();
    });

    it('should preserve registered admins list on logout', () => {
      const stateWithAdmins = {
        ...initialState,
        admin: { id: 'a1', name: 'Admin', email: 'admin@test.com', hostelId: 'H1' },
        isAuthenticated: true,
        registeredAdmins: [
          { id: 1, name: 'Admin 1', email: 'admin1@test.com', hostelId: 'H1' },
        ],
      };

      const state = adminAuthReducer(stateWithAdmins, adminLogout());

      expect(state.registeredAdmins).toHaveLength(1);
      expect(state.admin).toBeNull();
    });
  });

  describe('Error Management', () => {
    it('should clear error', () => {
      const stateWithError = { ...initialState, error: 'Test error' };

      const state = adminAuthReducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });

    it('should not affect authentication state when clearing error', () => {
      const authenticatedState = {
        admin: { id: 'a1', name: 'Admin', email: 'admin@test.com', hostelId: 'H1' },
        isAuthenticated: true,
        token: 'token',
        loading: false,
        error: 'Some error',
        registeredAdmins: [],
        role: 'admin' as const,
      };

      const state = adminAuthReducer(authenticatedState, clearError());

      expect(state.error).toBeNull();
      expect(state.isAuthenticated).toBe(true);
      expect(state.role).toBe('admin');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should maintain role information throughout session', () => {
      const admin = { id: 'a1', name: 'Admin', email: 'admin@test.com', hostelId: 'H1' };
      
      let state = adminAuthReducer(initialState, adminLoginSuccess({ admin, role: 'admin' }));
      expect(state.role).toBe('admin');
      
      state = adminAuthReducer(state, clearError());
      expect(state.role).toBe('admin');
    });

    it('should handle complete admin authentication cycle', () => {
      const admin = { id: 'a1', name: 'Admin', email: 'admin@test.com', hostelId: 'H1' };
      
      // Register
      let state = adminAuthReducer(initialState, adminRegisterSuccess(admin));
      expect(state.registeredAdmins).toHaveLength(1);
      
      // Login
      state = adminAuthReducer(state, adminLoginSuccess({ admin, role: 'admin' }));
      expect(state.isAuthenticated).toBe(true);
      expect(state.role).toBe('admin');
      
      // Logout
      state = adminAuthReducer(state, adminLogout());
      expect(state.isAuthenticated).toBe(false);
      expect(state.role).toBeNull();
    });

    it('should handle complete superAdmin authentication cycle', () => {
      const superAdmin = { id: 's1', name: 'Super Admin', email: 'super@test.com' };
      
      // Login as superAdmin
      let state = adminAuthReducer(initialState, adminLoginSuccess({ admin: superAdmin, role: 'superAdmin' }));
      expect(state.isAuthenticated).toBe(true);
      expect(state.role).toBe('superAdmin');
      
      // Logout
      state = adminAuthReducer(state, adminLogout());
      expect(state.isAuthenticated).toBe(false);
      expect(state.role).toBeNull();
    });
  });
});
