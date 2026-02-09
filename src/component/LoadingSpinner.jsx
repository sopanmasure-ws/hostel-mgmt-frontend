import React from 'react';

/**
 * LoadingSpinner Component
 * Used as Suspense fallback for lazy-loaded components
 */
const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
