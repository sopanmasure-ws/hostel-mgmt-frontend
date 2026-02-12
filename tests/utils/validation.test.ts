import {
  validatePassword,
  isPasswordValid,
  getPasswordErrorMessage,
  isEmailValid,
  isPNRValid,
  isPhoneValid,
} from '../../src/util/validation';

// Mock the config module
jest.mock('../../src/config', () => ({
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    HAS_UPPERCASE: /[A-Z]/,
    HAS_LOWERCASE: /[a-z]/,
    HAS_SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  },
  PASSWORD_ERRORS: {
    MIN_LENGTH: 'Password must be at least 8 characters long',
    UPPERCASE: 'Password must contain at least one uppercase letter',
    LOWERCASE: 'Password must contain at least one lowercase letter',
    SPECIAL_CHAR: 'Password must contain at least one special character (!@#$%^&* etc.)',
  },
  VALIDATION: {
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PNR_PATTERN: /^[A-Z]{2}\d{4}$/,
    PHONE_PATTERN: /^[0-9]{10}$/,
  },
}));

describe('Validation Utilities', () => {
  describe('validatePassword', () => {
    it('should validate a strong password correctly', () => {
      const result = validatePassword('Test@123');
      expect(result).toEqual({
        minLength: true,
        hasUpperCase: true,
        hasLowerCase: true,
        hasSpecialChar: true,
      });
    });

    it('should detect password without minimum length', () => {
      const result = validatePassword('Test@1');
      expect(result.minLength).toBe(false);
    });

    it('should detect password without uppercase letter', () => {
      const result = validatePassword('test@123');
      expect(result.hasUpperCase).toBe(false);
    });

    it('should detect password without lowercase letter', () => {
      const result = validatePassword('TEST@123');
      expect(result.hasLowerCase).toBe(false);
    });

    it('should detect password without special character', () => {
      const result = validatePassword('Test1234');
      expect(result.hasSpecialChar).toBe(false);
    });

    it('should handle empty string', () => {
      const result = validatePassword('');
      expect(result).toEqual({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasSpecialChar: false,
      });
    });
  });

  describe('isPasswordValid', () => {
    it('should return true for valid password', () => {
      expect(isPasswordValid('Test@123')).toBe(true);
      expect(isPasswordValid('MyP@ssw0rd')).toBe(true);
      expect(isPasswordValid('Secur3#Pass')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(isPasswordValid('test')).toBe(false);
      expect(isPasswordValid('test123')).toBe(false);
      expect(isPasswordValid('TEST@123')).toBe(false);
      expect(isPasswordValid('Test1234')).toBe(false);
      expect(isPasswordValid('')).toBe(false);
    });
  });

  describe('getPasswordErrorMessage', () => {
    it('should return empty array for valid password', () => {
      const errors = getPasswordErrorMessage('Test@123');
      expect(errors).toEqual([]);
    });

    it('should return correct error messages for weak password', () => {
      const errors = getPasswordErrorMessage('test');
      expect(errors).toContain('Password must be at least 8 characters long');
      expect(errors).toContain('Password must contain at least one uppercase letter');
      expect(errors).toContain('Password must contain at least one special character (!@#$%^&* etc.)');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should return multiple errors when multiple requirements fail', () => {
      const errors = getPasswordErrorMessage('abc');
      expect(errors.length).toBe(3); // min length, uppercase, and special char fail
      expect(errors).toContain('Password must be at least 8 characters long');
      expect(errors).toContain('Password must contain at least one uppercase letter');
      expect(errors).toContain('Password must contain at least one special character (!@#$%^&* etc.)');
    });

    it('should return specific error for missing special character', () => {
      const errors = getPasswordErrorMessage('Test1234');
      expect(errors).toContain('Password must contain at least one special character (!@#$%^&* etc.)');
      expect(errors.length).toBe(1);
    });
  });

  describe('isEmailValid', () => {
    it('should validate correct email addresses', () => {
      expect(isEmailValid('test@example.com')).toBe(true);
      expect(isEmailValid('user.name@domain.co.in')).toBe(true);
      expect(isEmailValid('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isEmailValid('invalidemail')).toBe(false);
      expect(isEmailValid('@example.com')).toBe(false);
      expect(isEmailValid('user@')).toBe(false);
      expect(isEmailValid('user@domain')).toBe(false);
      expect(isEmailValid('')).toBe(false);
      expect(isEmailValid('user @example.com')).toBe(false);
    });
  });

  describe('isPNRValid', () => {
    it('should validate correct PNR format', () => {
      expect(isPNRValid('AB1234')).toBe(true);
      expect(isPNRValid('XY9876')).toBe(true);
      expect(isPNRValid('PQ0000')).toBe(true);
    });

    it('should reject invalid PNR format', () => {
      expect(isPNRValid('ab1234')).toBe(false); // lowercase
      expect(isPNRValid('AB123')).toBe(false); // too short
      expect(isPNRValid('AB12345')).toBe(false); // too long
      expect(isPNRValid('A11234')).toBe(false); // only 1 letter
      expect(isPNRValid('1B1234')).toBe(false); // starts with number
      expect(isPNRValid('ABCDEF')).toBe(false); // no numbers
      expect(isPNRValid('')).toBe(false);
    });
  });

  describe('isPhoneValid', () => {
    it('should validate correct phone numbers', () => {
      expect(isPhoneValid('1234567890')).toBe(true);
      expect(isPhoneValid('9876543210')).toBe(true);
      expect(isPhoneValid('0000000000')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isPhoneValid('123456789')).toBe(false); // too short
      expect(isPhoneValid('12345678901')).toBe(false); // too long
      expect(isPhoneValid('12345abc90')).toBe(false); // contains letters
      expect(isPhoneValid('+1234567890')).toBe(false); // contains +
      expect(isPhoneValid('123-456-7890')).toBe(false); // contains dashes
      expect(isPhoneValid('')).toBe(false);
    });
  });
});
