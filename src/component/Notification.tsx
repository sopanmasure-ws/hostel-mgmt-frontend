import React from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const icons: Record<NotificationType, string> = {
    success: '✓',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const colors: Record<NotificationType, string> = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 min-w-80 max-w-md px-4 py-3 border-l-4 rounded-lg shadow-lg flex items-center justify-between gap-3 animate-fade-in ${colors[type] || colors.info}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icons[type]}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button 
        className="text-xl font-bold hover:opacity-70 transition-opacity flex-shrink-0"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;
