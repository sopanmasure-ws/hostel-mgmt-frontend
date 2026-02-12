import { tokenService } from '../../src/lib/services/tokenService';

describe('tokenService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Student Token Management', () => {
    it('should set and get student token', () => {
      const token = 'test-token-123';
      tokenService.setStudentToken(token);

      const result = tokenService.getStudentToken();
      expect(result).toBe(token);
    });

    it('should validate valid student token', () => {
      const token = 'test-token-123';
      const futureExpiry = Date.now() + 1000 * 60 * 60;
      tokenService.setStudentToken(token, futureExpiry);

      expect(tokenService.isStudentTokenValid()).toBe(true);
    });

    it('should return false for expired student token', () => {
      const token = 'test-token-123';
      const pastExpiry = Date.now() - 1000;
      tokenService.setStudentToken(token, pastExpiry);

      expect(tokenService.isStudentTokenValid()).toBe(false);
    });

    it('should return false when no token exists', () => {
      expect(tokenService.isStudentTokenValid()).toBe(false);
    });

    it('should remove student token', () => {
      tokenService.setStudentToken('test-token');
      tokenService.removeStudentToken();

      expect(tokenService.getStudentToken()).toBeNull();
    });

    it('should set and get student user', () => {
      const user = { id: '123', name: 'John Doe', email: 'john@example.com' };
      tokenService.setStudentUser(user);

      const result = tokenService.getStudentUser();
      expect(result).toEqual(user);
    });

    it('should return null when no user exists', () => {
      const result = tokenService.getStudentUser();
      expect(result).toBeNull();
    });
  });

  describe('Admin Token Management', () => {
    it('should set and get admin token', () => {
      const token = 'admin-token-123';
      tokenService.setAdminToken(token);

      const result = tokenService.getAdminToken();
      expect(result).toBe(token);
    });

    it('should validate valid admin token', () => {
      const token = 'admin-token-123';
      const futureExpiry = Date.now() + 1000 * 60 * 60;
      tokenService.setAdminToken(token, futureExpiry);

      expect(tokenService.isAdminTokenValid()).toBe(true);
    });

    it('should return false for expired admin token', () => {
      const token = 'admin-token-123';
      const pastExpiry = Date.now() - 1000;
      tokenService.setAdminToken(token, pastExpiry);

      expect(tokenService.isAdminTokenValid()).toBe(false);
    });

    it('should remove admin token', () => {
      tokenService.setAdminToken('admin-token');
      tokenService.removeAdminToken();

      expect(tokenService.getAdminToken()).toBeNull();
    });

    it('should set and get admin user', () => {
      const user = { id: 'admin1', role: 'admin', hostelId: 'H1' };
      tokenService.setAdminUser(user);

      const result = tokenService.getAdminUser();
      expect(result).toEqual(user);
    });
  });

  describe('getTimeUntilExpiry', () => {
    it('should return time until student token expiry in milliseconds', () => {
      const futureTime = Date.now() + 3600000; // 1 hour from now
      tokenService.setStudentToken('token', futureTime);
      
      const result = tokenService.getTimeUntilExpiry(false);
      
      expect(result).toBeGreaterThan(3595000); // Allow small timing difference
      expect(result).toBeLessThan(3605000);
    });

    it('should return time until admin token expiry', () => {
      const futureTime = Date.now() + 7200000; // 2 hours from now
      tokenService.setAdminToken('admin-token', futureTime);
      
      const result = tokenService.getTimeUntilExpiry(true);
      
      expect(result).toBeGreaterThan(7195000);
      expect(result).toBeLessThan(7205000);
    });

    it('should return 0 for expired student token', () => {
      const pastTime = Date.now() - 3600000; // 1 hour ago
      tokenService.setStudentToken('token', pastTime);
      
      const result = tokenService.getTimeUntilExpiry(false);
      
      expect(result).toBe(0);
    });

    it('should return 0 when no token exists', () => {
      localStorage.clear();
      
      const result = tokenService.getTimeUntilExpiry(false);
      
      expect(result).toBe(0);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired student token', () => {
      const pastTime = Date.now() - 3600000;
      tokenService.setStudentToken('token', pastTime);
      
      expect(tokenService.isTokenExpired(false)).toBe(true);
    });

    it('should return false for valid student token', () => {
      const futureTime = Date.now() + 3600000;
      tokenService.setStudentToken('token', futureTime);
      
      expect(tokenService.isTokenExpired(false)).toBe(false);
    });

    it('should return true for expired admin token', () => {
      const pastTime = Date.now() - 3600000;
      tokenService.setAdminToken('admin-token', pastTime);
      
      expect(tokenService.isTokenExpired(true)).toBe(true);
    });

    it('should return false for valid admin token', () => {
      const futureTime = Date.now() + 3600000;
      tokenService.setAdminToken('admin-token', futureTime);
      
      expect(tokenService.isTokenExpired(true)).toBe(false);
    });

    it('should return true when token does not exist', () => {
      localStorage.clear();
      
      expect(tokenService.isTokenExpired(false)).toBe(true);
    });
  });

  describe('clearAll', () => {
    beforeEach(() => {
      tokenService.setStudentToken('test-token');
      tokenService.setAdminToken('admin-token');
      tokenService.setStudentUser({ id: '1', name: 'Test' });
      tokenService.setAdminUser({ id: 'a1', name: 'Admin' });
    });

    it('should clear all tokens from localStorage', () => {
      tokenService.clearAll();
      
      expect(tokenService.getStudentToken()).toBeNull();
      expect(tokenService.getAdminToken()).toBeNull();
      expect(tokenService.getStudentUser()).toBeNull();
      expect(tokenService.getAdminUser()).toBeNull();
    });

    it('should not affect other localStorage items', () => {
      localStorage.setItem('other-key', 'other-value');
      
      tokenService.clearAll();
      
      expect(localStorage.getItem('other-key')).toBe('other-value');
    });

    it('should be idempotent', () => {
      tokenService.clearAll();
      tokenService.clearAll(); // Call twice
      
      expect(tokenService.getStudentToken()).toBeNull();
      expect(tokenService.getAdminToken()).toBeNull();
    });
  });
});
