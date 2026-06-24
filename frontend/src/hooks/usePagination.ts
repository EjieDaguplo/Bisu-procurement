import { useMemo, useState } from "react";

export interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirst: () => void;
  goToLast: () => void;
  goToPrev: () => void;
  goToNext: () => void;
  pageSizeOptions: number[];
  /** Slice a full data array to the current page window */
  paginate: <T>(data: T[]) => T[];
}

export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
}: UsePaginationOptions): UsePaginationReturn {
  const [page, setPageRaw] = useState(initialPage);
  const [pageSize, setPageSizeRaw] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize],
  );

  const safePage = Math.min(page, totalPages);

  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);

  const setPage = (p: number) =>
    setPageRaw(Math.max(1, Math.min(p, totalPages)));
  const setPageSize = (s: number) => {
    setPageSizeRaw(s);
    setPageRaw(1);
  };

  const paginate = <T>(data: T[]): T[] =>
    data.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    page: safePage,
    pageSize,
    totalPages,
    totalItems,
    from,
    to,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    setPage,
    setPageSize,
    goToFirst: () => setPage(1),
    goToLast: () => setPage(totalPages),
    goToPrev: () => setPage(safePage - 1),
    goToNext: () => setPage(safePage + 1),
    pageSizeOptions,
    paginate,
  };
}
