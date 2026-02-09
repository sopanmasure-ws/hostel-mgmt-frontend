import React from 'react';
import '../../styles/filter.css';

/**
 * Reusable Filter Bar Component
 * @param {string} searchValue - Current search value
 * @param {function} onSearchChange - Search change handler
 * @param {string} searchPlaceholder - Search input placeholder
 * @param {Array} filters - [{label, value, options: [{label, value}], onChange}]
 * @param {function} onClearFilters - Optional clear all filters handler
 */
const FilterBar = ({ 
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onClearFilters
}) => {
  return (
    <div className="filter-bar">
      {onSearchChange && (
        <input
          type="text"
          className="search-input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      )}
      
      {filters.length > 0 && (
        <div className="filter-group-container">
          {filters.map((filter, index) => (
            <div key={index} className="filter-group">
              {filter.label && <label>{filter.label}:</label>}
              <select
                className="filter-select"
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
              className="btn btn-sm btn-secondary"
              onClick={onClearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
