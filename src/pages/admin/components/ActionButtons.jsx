import React from 'react';

/**
 * Reusable Action Buttons Component
 * @param {Array} actions - [{label, icon, onClick, className, disabled, title}]
 * @param {boolean} loading - Show loading state
 */
const ActionButtons = ({ actions, loading = false }) => {
  return (
    <div className="action-buttons">
      {actions.map((action, index) => (
        <button
          key={index}
          className={`btn btn-sm ${action.className || 'btn-primary'}`}
          onClick={action.onClick}
          disabled={action.disabled || loading}
          title={action.title}
        >
          {action.icon && <span className="btn-icon">{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
