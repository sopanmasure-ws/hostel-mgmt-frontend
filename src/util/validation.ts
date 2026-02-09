import { PASSWORD_REQUIREMENTS, PASSWORD_ERRORS, VALIDATION } from '../config';

interface PasswordValidation {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasSpecialChar: boolean;
}

export const validatePassword = (password: string): PasswordValidation => {
  return {
    minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    hasUpperCase: PASSWORD_REQUIREMENTS.HAS_UPPERCASE.test(password),
    hasLowerCase: PASSWORD_REQUIREMENTS.HAS_LOWERCASE.test(password),
    hasSpecialChar: PASSWORD_REQUIREMENTS.HAS_SPECIAL_CHAR.test(password),
  };
};

export const isPasswordValid = (password: string): boolean => {
  const requirements = validatePassword(password);
  return Object.values(requirements).every((req) => req === true);
};

export const getPasswordErrorMessage = (password: string): string[] => {
  const requirements = validatePassword(password);
  const errors: string[] = [];

  if (!requirements.minLength) errors.push(PASSWORD_ERRORS.MIN_LENGTH);
  if (!requirements.hasUpperCase) errors.push(PASSWORD_ERRORS.UPPERCASE);
  if (!requirements.hasLowerCase) errors.push(PASSWORD_ERRORS.LOWERCASE);
  if (!requirements.hasSpecialChar) errors.push(PASSWORD_ERRORS.SPECIAL_CHAR);

  return errors;
};

export const isEmailValid = (email: string): boolean => {
  return VALIDATION.EMAIL_PATTERN.test(email);
};

export const isPNRValid = (pnr: string): boolean => {
  return VALIDATION.PNR_PATTERN.test(pnr);
};

export const isPhoneValid = (phone: string): boolean => {
  return VALIDATION.PHONE_PATTERN.test(phone);
};

