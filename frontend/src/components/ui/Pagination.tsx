"use client";
import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrev: () => void;
  /** Show per-page selector. Default: true */
  showPageSizeSelector?: boolean;
  itemsPerPage?: number;
  onItemsPerPageChange?: (n: number) => void;
  pageSizeOptions?: number[];
  /** Label for items, e.g. "requests". Default: "items" */
  itemLabel?: string;
  /** Compact mode hides the item count summary. Default: false */
  compact?: boolean;
}

/** Returns an array of page numbers and ellipsis markers to render. */
function buildPageWindows(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  hasPrev,
  hasNext,
  onPageChange,
  onNext,
  onPrev,
  showPageSizeSelector = true,
  itemsPerPage = 10,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = "items",
  compact = false,
}: PaginationProps) => {
  const pages = buildPageWindows(currentPage, totalPages);

  if (totalPages <= 1 && totalItems <= (pageSizeOptions[0] ?? 10)) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
      {/* Left: summary */}
      {!compact && (
        <p className="text-sm text-gray-500 order-2 sm:order-1">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {totalItems === 0 ? 0 : startIndex + 1}–{endIndex}
          </span>{" "}
          of <span className="font-semibold text-gray-700">{totalItems}</span>{" "}
          {itemLabel}
        </p>
      )}

      {/* Center / Right: controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* First page */}
        <PageButton
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          aria-label="First page"
        >
          <ChevronsLeft size={15} />
        </PageButton>

        {/* Prev */}
        <PageButton
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </PageButton>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm select-none"
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              onClick={() => onPageChange(p as number)}
              active={p === currentPage}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </PageButton>
          ),
        )}

        {/* Next */}
        <PageButton onClick={onNext} disabled={!hasNext} aria-label="Next page">
          <ChevronRight size={15} />
        </PageButton>

        {/* Last page */}
        <PageButton
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          aria-label="Last page"
        >
          <ChevronsRight size={15} />
        </PageButton>
      </div>

      {/* Per-page selector */}
      {showPageSizeSelector && onItemsPerPageChange && (
        <div className="flex items-center gap-2 order-3 text-sm text-gray-500">
          <label htmlFor="page-size-select" className="whitespace-nowrap">
            Rows per page
          </label>
          <select
            id="page-size-select"
            className="input-field !py-1 !px-2 !w-auto text-sm"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

/* ── Small helper ── */
interface PageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const PageButton = ({
  active,
  children,
  disabled,
  className = "",
  ...props
}: PageButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    className={[
      "w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors select-none",
      active
        ? "bg-bisu-blue-DEFAULT text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100",
      disabled
        ? "opacity-40 cursor-not-allowed pointer-events-none"
        : "cursor-pointer",
      className,
    ].join(" ")}
    {...props}
  >
    {children}
  </button>
);
