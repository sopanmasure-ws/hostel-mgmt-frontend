import React from 'react';
import '../styles/notification.css';

const Notification = ({ message, type, onClose }) => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-icon">{icons[type]}</span>
        <span className="notification-message">{message}</span>
      </div>
      <button className="notification-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default Notification;
