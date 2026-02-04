import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps): ReactNode {
  if (totalPages <= 1) {
    return null;
  }

  const pages: number[] = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const buttonBase =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors';
  const buttonEnabled =
    'border-input bg-background hover:bg-accent hover:text-accent-foreground';
  const buttonDisabled =
    'border-input bg-background text-muted-foreground cursor-not-allowed opacity-50';
  const buttonActive = 'border-primary bg-primary text-primary-foreground';

  return (
    <nav aria-label="Page navigation" className="flex justify-center">
      <div className="flex items-center gap-1">
        <button
          className={cn(
            buttonBase,
            currentPage === 1 ? buttonDisabled : buttonEnabled,
            'px-2',
          )}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {startPage > 1 && (
          <>
            <button
              className={cn(buttonBase, buttonEnabled)}
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {startPage > 2 && (
              <span className={cn(buttonBase, buttonDisabled)}>...</span>
            )}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            className={cn(
              buttonBase,
              page === currentPage ? buttonActive : buttonEnabled,
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className={cn(buttonBase, buttonDisabled)}>...</span>
            )}
            <button
              className={cn(buttonBase, buttonEnabled)}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className={cn(
            buttonBase,
            currentPage === totalPages ? buttonDisabled : buttonEnabled,
            'px-2',
          )}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
