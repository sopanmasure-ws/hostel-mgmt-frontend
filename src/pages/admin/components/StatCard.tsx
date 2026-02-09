import React from 'react';

/**
 * Reusable Stat Card Component
 * @param {string} title - Card title
 * @param {number|string} value - Main stat value
 * @param {string} icon - Icon emoji or class
 * @param {function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 * @param {string} trend - Optional trend indicator
 */
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon,
  onClick,
  className = '',
  trend
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 ${
        onClick ? 'cursor-pointer hover:border-primary border-2 border-transparent' : ''
      } ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center gap-4">
        <div className="text-4xl">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600 mt-1">{title}</p>
          {trend && <span className="text-xs text-green-600 font-medium mt-1 inline-block">{trend}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
