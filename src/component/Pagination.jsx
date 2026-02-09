import React, { useMemo } from 'react';

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function buildPageModel(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const filtered = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const withDots = [];
  for (let i = 0; i < filtered.length; i++) {
    const p = filtered[i];
    const prev = filtered[i - 1];
    if (i > 0 && p - prev > 1) withDots.push('…');
    withDots.push(p);
  }
  return withDots;
}

export default function Pagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
  className = '',
}) {
  if (!totalItems || totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = clamp(currentPage, 1, totalPages);
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);

  const model = useMemo(() => buildPageModel(safePage, totalPages), [safePage, totalPages]);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`.trim()}>
      <div className="text-sm text-gray-600">
        Showing <strong className="font-semibold text-gray-900">{start}</strong>-<strong className="font-semibold text-gray-900">{end}</strong> of <strong className="font-semibold text-gray-900">{totalItems}</strong>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="px-3 py-1.5 min-w-[70px] text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-150"
          disabled={!canPrev}
          onClick={() => onPageChange(safePage - 1)}
        >
          Prev
        </button>

        {model.map((item, idx) =>
          item === '…' ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-500">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`px-3 py-1.5 min-w-[40px] text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors duration-150 ${
                item === safePage
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className="px-3 py-1.5 min-w-[70px] text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-150"
          disabled={!canNext}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </button>
      </div>

      {typeof onPageSizeChange === 'function' && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 flex items-center gap-2">
            Per page:
            <select
              className="px-2 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-150 cursor-pointer"
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}

