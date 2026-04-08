import { memo } from 'react'

interface PaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
}

/**
 * Minimal prev/next pager with page indicator and item range. Used by admin
 * list views. Keeps tap targets ≥44px and announces position via aria-label.
 */
export const Pagination = memo(
  ({ page, limit, total, onPageChange }: PaginationProps) => {
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const clampedPage = Math.min(page, totalPages)
    const start = total === 0 ? 0 : (clampedPage - 1) * limit + 1
    const end = Math.min(clampedPage * limit, total)

    const canPrev = clampedPage > 1
    const canNext = clampedPage < totalPages

    return (
      <nav
        aria-label="Pagination"
        className="flex items-center justify-between gap-3 flex-wrap px-1 py-2"
      >
        <p className="text-xs text-muted">
          {total === 0
            ? 'No results'
            : `Showing ${start}–${end} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => canPrev && onPageChange(clampedPage - 1)}
            disabled={!canPrev}
            aria-label="Previous page"
            className="btn-base btn-ghost text-xs px-4 min-h-[44px] disabled:opacity-40"
          >
            ← Prev
          </button>
          <span
            className="text-xs font-semibold text-secondary min-w-[72px] text-center"
            aria-live="polite"
          >
            Page {clampedPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => canNext && onPageChange(clampedPage + 1)}
            disabled={!canNext}
            aria-label="Next page"
            className="btn-base btn-ghost text-xs px-4 min-h-[44px] disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </nav>
    )
  },
)

Pagination.displayName = 'Pagination'
