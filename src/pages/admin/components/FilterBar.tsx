import React from 'react';

/**
 * Reusable Filter Bar Component
 * @param {string} searchValue - Current search value
 * @param {function} onSearchChange - Search change handler
 * @param {string} searchPlaceholder - Search input placeholder
 * @param {Array} filters - [{label, value, options: [{label, value}], onChange}]
 * @param {function} onClearFilters - Optional clear all filters handler
 */
interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  label?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onClearFilters?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onClearFilters
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {onSearchChange && (
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        )}
        
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-3 items-center">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center gap-2">
                {filter.label && <label className="text-sm font-medium text-gray-700">{filter.label}:</label>}
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white text-sm"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            
            {onClearFilters && (
              <button 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                onClick={onClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
