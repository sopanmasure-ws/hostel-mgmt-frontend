import React from 'react';
import '../../styles/modal.css';

/**
 * Reusable Modal Component
 * @param {string} title - Modal title
 * @param {boolean} isOpen - Control modal visibility
 * @param {function} onClose - Close handler
 * @param {ReactNode} children - Modal content
 * @param {ReactNode} footer - Optional footer content
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {boolean} loading - Show loading state
 */
const GenericModal = ({ 
  title, 
  isOpen, 
  onClose, 
  children, 
  footer,
  size = 'medium',
  loading = false 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div 
        className={`modal-content ${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericModal;
