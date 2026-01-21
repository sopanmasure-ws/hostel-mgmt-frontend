// Password validation utility

export const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  return requirements;
};

export const isPasswordValid = (password) => {
  const requirements = validatePassword(password);
  return (
    requirements.minLength &&
    requirements.hasUpperCase &&
    requirements.hasLowerCase &&
    requirements.hasSpecialChar
  );
};

export const getPasswordErrorMessage = (password) => {
  const req = validatePassword(password);
  const errors = [];

  if (!req.minLength) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!req.hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!req.hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!req.hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  return errors;
};
