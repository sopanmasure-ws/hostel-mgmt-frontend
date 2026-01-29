import React from 'react';
import '../styles/loading-spinner.css';

/**
 * LoadingSpinner Component
 * Used as Suspense fallback for lazy-loaded components
 */
const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner">
        <div className="spinner-border"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
