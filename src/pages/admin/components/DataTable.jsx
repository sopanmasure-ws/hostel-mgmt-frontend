import React from 'react';
import '../../styles/table.css';

/**
 * Reusable Data Table Component
 * @param {Array} columns - [{key, label, render?, width?}]
 * @param {Array} data - Array of data objects
 * @param {function} onRowClick - Optional row click handler
 * @param {boolean} loading - Show loading state
 * @param {string} emptyMessage - Message when no data
 */
const DataTable = ({ 
  columns, 
  data, 
  onRowClick,
  loading = false,
  emptyMessage = 'No data available'
}) => {
  if (loading) {
    return <div className="table-loading">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="no-data">{emptyMessage}</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                style={column.width ? { width: column.width } : {}}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={row.id || row._id || index}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column) => (
                <td key={`${row.id || index}-${column.key}`}>
                  {column.render 
                    ? column.render(row[column.key], row) 
                    : row[column.key] || 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
