"use client";
import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { UsePaginationReturn } from "../../hooks/usePagination";

interface PaginationProps extends UsePaginationReturn {
  /** Show the "Rows per page" selector. Default: true */
  showPageSize?: boolean;
  /** Show "X – Y of Z" info text. Default: true */
  showInfo?: boolean;
  /** Show first/last jump buttons. Default: true */
  showEdgeButtons?: boolean;
  /** Extra Tailwind classes on the root wrapper */
  className?: string;
  /** "compact" hides page-size selector & collapses label text */
  variant?: "default" | "compact";
}

// ─── Page number builder ───────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavBtn = ({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={[
      "inline-flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-medium transition-colors",
      disabled
        ? "border-gray-100 text-gray-300 cursor-not-allowed bg-white"
        : "border-gray-200 text-gray-600 bg-white hover:bg-bisu-blue hover:text-white hover:border-bisu-blue",
    ].join(" ")}
  >
    {children}
  </button>
);

const PageBtn = ({
  page,
  current,
  onClick,
}: {
  page: number;
  current: number;
  onClick: (p: number) => void;
}) => {
  const active = page === current;
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      className={[
        "inline-flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-medium transition-colors",
        active
          ? "bg-bisu-blue border-bisu-blue text-white shadow-sm"
          : "border-gray-200 text-gray-600 bg-white hover:bg-bisu-blue hover:text-white hover:border-bisu-blue",
      ].join(" ")}
    >
      {page}
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const Pagination = ({
  page,
  pageSize,
  totalPages,
  totalItems,
  from,
  to,
  hasPrev,
  hasNext,
  setPage,
  setPageSize,
  goToFirst,
  goToLast,
  goToPrev,
  goToNext,
  pageSizeOptions,
  showPageSize = true,
  showInfo = true,
  showEdgeButtons = true,
  className = "",
  variant = "default",
}: PaginationProps) => {
  const isCompact = variant === "compact";
  const pages = buildPageWindows(page, totalPages);

  return (
    <div
      className={[
        "flex flex-wrap items-center gap-3",
        isCompact ? "justify-center" : "justify-between",
        className,
      ].join(" ")}
    >
      {/* ── Left: info + page size ── */}
      {!isCompact && (
        <div className="flex items-center gap-3 flex-wrap">
          {showInfo && (
            <p className="text-sm text-gray-500">
              {totalItems === 0 ? (
                "No results"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {from}–{to}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {totalItems}
                  </span>
                </>
              )}
            </p>
          )}

          {showPageSize && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-colors"
              >
                {pageSizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ── Right: nav controls ── */}
      <div className="flex items-center gap-1">
        {showEdgeButtons && (
          <NavBtn onClick={goToFirst} disabled={!hasPrev} title="First page">
            <ChevronsLeft size={15} />
          </NavBtn>
        )}

        <NavBtn onClick={goToPrev} disabled={!hasPrev} title="Previous page">
          <ChevronLeft size={15} />
        </NavBtn>

        {/* Page number buttons */}
        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 text-center text-gray-400 text-sm select-none"
              >
                …
              </span>
            ) : (
              <PageBtn key={p} page={p} current={page} onClick={setPage} />
            ),
          )}
        </div>

        <NavBtn onClick={goToNext} disabled={!hasNext} title="Next page">
          <ChevronRight size={15} />
        </NavBtn>

        {showEdgeButtons && (
          <NavBtn onClick={goToLast} disabled={!hasNext} title="Last page">
            <ChevronsRight size={15} />
          </NavBtn>
        )}
      </div>

      {/* Compact info */}
      {isCompact && showInfo && (
        <p className="w-full text-center text-xs text-gray-400">
          Page {page} of {totalPages}
        </p>
      )}
    </div>
  );
};
