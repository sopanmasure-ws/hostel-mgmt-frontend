import React from 'react';

/**
 * Reusable Data Table Component
 * @param {Array} columns - [{key, label, render?, width?}]
 * @param {Array} data - Array of data objects
 * @param {function} onRowClick - Optional row click handler
 * @param {boolean} loading - Show loading state
 * @param {string} emptyMessage - Message when no data
 */
interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const DataTable = <T extends Record<string, any>>({ 
  columns, 
  data, 
  onRowClick,
  loading = false,
  emptyMessage = 'No data available'
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                style={column.width ? { width: column.width } : {}}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr 
              key={row.id || row._id || index}
              onClick={() => onRowClick && onRowClick(row)}
              className={`${
                onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
              }`}
            >
              {columns.map((column) => (
                <td key={`${row.id || index}-${column.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
