import { memo } from 'react'
import type { DisplayStatus } from '../../types/delay'
import { displayStatusLabel } from '../../data/helpers'

interface StatusBadgeProps {
  status: DisplayStatus
  className?: string
}

const VARIANT: Record<DisplayStatus, string> = {
  pending: 'badge-warning',
  assigned: 'badge-info',
  accepted: 'badge-info',
  in_progress: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-error',
  rejected: 'badge-error',
  delayed: 'badge-delayed',
  cannot_attend: 'badge-cannot-attend',
  rescheduling: 'badge-rescheduling',
  rescheduled: 'badge-rescheduled',
}

export const StatusBadge = memo(({ status, className }: StatusBadgeProps) => {
  return (
    <span className={`badge ${VARIANT[status]} ${className ?? ''}`.trim()}>
      {displayStatusLabel(status)}
    </span>
  )
})

StatusBadge.displayName = 'StatusBadge'
