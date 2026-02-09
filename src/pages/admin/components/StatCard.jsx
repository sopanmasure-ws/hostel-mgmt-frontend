import React from 'react';
import '../../styles/stat-card.css';

/**
 * Reusable Stat Card Component
 * @param {string} title - Card title
 * @param {number|string} value - Main stat value
 * @param {string} icon - Icon emoji or class
 * @param {function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 * @param {string} trend - Optional trend indicator
 */
const StatCard = ({ 
  title, 
  value, 
  icon,
  onClick,
  className = '',
  trend
}) => {
  return (
    <div 
      className={`stat-card ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`stat-icon ${className}`}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{title}</p>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  );
};

export default StatCard;
