import React from 'react';

/**
 * Reusable Form Group Component
 * @param {string} label - Field label
 * @param {string} error - Error message
 * @param {boolean} required - Required field indicator
 * @param {ReactNode} children - Form input element
 */
const FormGroup = ({ label, error, required = false, children }) => {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span className="required-mark"> *</span>}
        </label>
      )}
      {children}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormGroup;
