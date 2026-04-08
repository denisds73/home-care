import { memo } from 'react'
import type { BookingStatus } from '../../types/domain'
import { bookingStatusLabel } from '../../data/helpers'

interface StatusBadgeProps {
  status: BookingStatus
  className?: string
}

const VARIANT: Record<BookingStatus, string> = {
  pending: 'badge-warning',
  assigned: 'badge-info',
  accepted: 'badge-info',
  in_progress: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-error',
  rejected: 'badge-error',
}

export const StatusBadge = memo(({ status, className }: StatusBadgeProps) => {
  return (
    <span className={`badge ${VARIANT[status]} ${className ?? ''}`.trim()}>
      {bookingStatusLabel(status)}
    </span>
  )
})

StatusBadge.displayName = 'StatusBadge'
