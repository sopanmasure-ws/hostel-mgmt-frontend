

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';
const ADMIN_TOKEN_EXPIRY_KEY = 'admin_token_expiry';

interface User {
  [key: string]: any;
}

export const tokenService = {
  setStudentToken: (token: string, expiryTime: number | null = null): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      const expiry = expiryTime || Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error('Failed to set student token:', error);
    }
  },

  getStudentToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get student token:', error);
      return null;
    }
  },

  isStudentTokenValid: (): boolean => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return false;

      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) return false;

      return Date.now() < parseInt(expiry);
    } catch (error) {
      console.error('Failed to validate student token:', error);
      return false;
    }
  },

  removeStudentToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to remove student token:', error);
    }
  },

  setStudentUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to set student user:', error);
    }
  },

  getStudentUser: (): User | null => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Failed to get student user:', error);
      return null;
    }
  },

  // Admin token methods
  setAdminToken: (token: string, expiryTime: number | null = null): void => {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      const expiry = expiryTime || Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(ADMIN_TOKEN_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error('Failed to set admin token:', error);
    }
  },

  getAdminToken: (): string | null => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get admin token:', error);
      return null;
    }
  },

  isAdminTokenValid: (): boolean => {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!token) return false;

      const expiry = localStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);
      if (!expiry) return false;

      return Date.now() < parseInt(expiry);
    } catch (error) {
      console.error('Failed to validate admin token:', error);
      return false;
    }
  },

  removeAdminToken: (): void => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    } catch (error) {
      console.error('Failed to remove admin token:', error);
    }
  },

  setAdminUser: (user: User): void => {
    try {
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to set admin user:', error);
    }
  },

  getAdminUser: (): User | null => {
    try {
      const user = localStorage.getItem(ADMIN_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Failed to get admin user:', error);
      return null;
    }
  },

  // Utility methods
  getTimeUntilExpiry: (isAdmin: boolean = false): number => {
    try {
      const expiryKey = isAdmin ? ADMIN_TOKEN_EXPIRY_KEY : TOKEN_EXPIRY_KEY;
      const expiry = localStorage.getItem(expiryKey);
      if (!expiry) return 0;
      return Math.max(0, parseInt(expiry) - Date.now());
    } catch (error) {
      console.error('Failed to get expiry time:', error);
      return 0;
    }
  },

  isTokenExpired: (isAdmin: boolean = false): boolean => {
    return !(isAdmin ? tokenService.isAdminTokenValid() : tokenService.isStudentTokenValid());
  },

  clearAll: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    } catch (error) {
      console.error('Failed to clear all tokens:', error);
    }
  },
};

export default tokenService;
