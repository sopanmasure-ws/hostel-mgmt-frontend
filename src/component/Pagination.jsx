import React, { useMemo } from 'react';
import '../styles/pagination.css';

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
    <div className={`pagination ${className}`.trim()}>
      <div className="pagination__meta">
        Showing <strong>{start}</strong>-<strong>{end}</strong> of <strong>{totalItems}</strong>
      </div>

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          disabled={!canPrev}
          onClick={() => onPageChange(safePage - 1)}
        >
          Prev
        </button>

        {model.map((item, idx) =>
          item === '…' ? (
            <span key={`dots-${idx}`} className="pagination__dots">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`pagination__btn ${item === safePage ? 'active' : ''}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className="pagination__btn"
          disabled={!canNext}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </button>
      </div>

      {typeof onPageSizeChange === 'function' && (
        <div className="pagination__size">
          <label className="pagination__sizeLabel">
            Per page:{' '}
            <select
              className="pagination__select"
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

