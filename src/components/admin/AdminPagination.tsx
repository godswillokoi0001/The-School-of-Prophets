"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function AdminPagination({
  totalItems,
  pageSize = 10,
  currentPage,
  onPageChange,
  className = "",
  alwaysShow = false,
}: {
  totalItems: number;
  pageSize?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  alwaysShow?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (!alwaysShow && totalPages <= 1) return null;

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  function getPageNumbers() {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const startP = Math.max(2, currentPage - 1);
      const endP = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startP; i <= endP; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-parchment/10 px-4 py-3 text-xs ${className}`}
      aria-label="Table pagination"
    >
      <div className="opacity-60 text-[0.7rem] sm:text-xs">
        Showing <span className="font-semibold text-parchment">{start}</span>–
        <span className="font-semibold text-parchment">{end}</span> of{" "}
        <span className="font-semibold text-parchment">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="admin-btn admin-btn-ghost !p-1.5 disabled:opacity-30 disabled:pointer-events-none"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-xs opacity-40" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`min-w-8 h-8 tabular-nums text-xs font-medium transition-colors ${
                currentPage === p
                  ? "bg-gold text-ink font-bold"
                  : "hover:bg-parchment/10 opacity-70 hover:opacity-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="admin-btn admin-btn-ghost !p-1.5 disabled:opacity-30 disabled:pointer-events-none"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
