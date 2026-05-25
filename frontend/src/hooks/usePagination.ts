import { useState, useMemo } from "react";

interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setItemsPerPage: (n: number) => void;
  paginate: (items: T[]) => T[];
  startIndex: number;
  endIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export function usePagination<T>({
  totalItems,
  itemsPerPage: initialItemsPerPage = 10,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const setPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const nextPage = () => setPage(currentPage + 1);
  const prevPage = () => setPage(currentPage - 1);

  const setItemsPerPage = (n: number) => {
    setItemsPerPageState(n);
    setCurrentPage(1); // reset to page 1 when page size changes
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginate = useMemo(
    () => (items: T[]) => items.slice(startIndex, endIndex),
    [startIndex, endIndex],
  );

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    setPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    paginate,
    startIndex,
    endIndex,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}
