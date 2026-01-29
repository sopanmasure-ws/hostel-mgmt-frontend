import { PASSWORD_REQUIREMENTS, PASSWORD_ERRORS, VALIDATION } from '../constants';

export const validatePassword = (password) => {
  return {
    minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    hasUpperCase: PASSWORD_REQUIREMENTS.HAS_UPPERCASE.test(password),
    hasLowerCase: PASSWORD_REQUIREMENTS.HAS_LOWERCASE.test(password),
    hasSpecialChar: PASSWORD_REQUIREMENTS.HAS_SPECIAL_CHAR.test(password),
  };
};

export const isPasswordValid = (password) => {
  const requirements = validatePassword(password);
  return Object.values(requirements).every((req) => req === true);
};
export const getPasswordErrorMessage = (password) => {
  const requirements = validatePassword(password);
  const errors = [];

  if (!requirements.minLength) errors.push(PASSWORD_ERRORS.MIN_LENGTH);
  if (!requirements.hasUpperCase) errors.push(PASSWORD_ERRORS.UPPERCASE);
  if (!requirements.hasLowerCase) errors.push(PASSWORD_ERRORS.LOWERCASE);
  if (!requirements.hasSpecialChar) errors.push(PASSWORD_ERRORS.SPECIAL_CHAR);

  return errors;
};
export const isEmailValid = (email) => {
  return VALIDATION.EMAIL_PATTERN.test(email);
};
export const isPNRValid = (pnr) => {
  return VALIDATION.PNR_PATTERN.test(pnr);
};

export const isPhoneValid = (phone) => {
  return VALIDATION.PHONE_PATTERN.test(phone);
};

