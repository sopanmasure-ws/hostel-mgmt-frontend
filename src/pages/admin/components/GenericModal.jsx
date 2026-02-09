import React from 'react';

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

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div 
        className={`bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button 
            className="text-white hover:text-gray-200 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 180px)'}}>
          {children}
        </div>
        
        {footer && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericModal;
