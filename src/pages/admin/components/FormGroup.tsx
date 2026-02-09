import React from 'react';

/**
 * Reusable Form Group Component
 * @param {string} label - Field label
 * @param {string} error - Error message
 * @param {boolean} required - Required field indicator
 * @param {ReactNode} children - Form input element
 */
interface FormGroupProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = ({ label, error, required = false, children }) => {
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
