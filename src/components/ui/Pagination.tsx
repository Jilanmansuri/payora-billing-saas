import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-xl text-xs text-slate-500">
      <div>
        {totalItems ? (
          <span>
            Showing <strong className="text-slate-700 dark:text-slate-200">{startItem}</strong> to{' '}
            <strong className="text-slate-700 dark:text-slate-200">{endItem}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-700 dark:text-slate-200">{currentPage}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

