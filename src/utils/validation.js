import { PASSWORD_REQUIREMENTS, PASSWORD_ERRORS, VALIDATION } from '../constants';

/**
 * Validate password against requirements
 */
export const validatePassword = (password) => {
  return {
    minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    hasUpperCase: PASSWORD_REQUIREMENTS.HAS_UPPERCASE.test(password),
    hasLowerCase: PASSWORD_REQUIREMENTS.HAS_LOWERCASE.test(password),
    hasSpecialChar: PASSWORD_REQUIREMENTS.HAS_SPECIAL_CHAR.test(password),
  };
};

/**
 * Check if password meets all requirements
 */
export const isPasswordValid = (password) => {
  const requirements = validatePassword(password);
  return Object.values(requirements).every((req) => req === true);
};

/**
 * Get detailed password error messages
 */
export const getPasswordErrorMessage = (password) => {
  const requirements = validatePassword(password);
  const errors = [];

  if (!requirements.minLength) errors.push(PASSWORD_ERRORS.MIN_LENGTH);
  if (!requirements.hasUpperCase) errors.push(PASSWORD_ERRORS.UPPERCASE);
  if (!requirements.hasLowerCase) errors.push(PASSWORD_ERRORS.LOWERCASE);
  if (!requirements.hasSpecialChar) errors.push(PASSWORD_ERRORS.SPECIAL_CHAR);

  return errors;
};

/**
 * Validate email format
 */
export const isEmailValid = (email) => {
  return VALIDATION.EMAIL_PATTERN.test(email);
};

/**
 * Validate PNR format
 */
export const isPNRValid = (pnr) => {
  return VALIDATION.PNR_PATTERN.test(pnr);
};

/**
 * Validate phone number
 */
export const isPhoneValid = (phone) => {
  return VALIDATION.PHONE_PATTERN.test(phone);
};

