import { memo } from 'react'
import type { BookingStatusEvent } from '../../types/domain'
import { formatDateTime } from '../../data/helpers'
import { StatusBadge } from './StatusBadge'

interface StatusTimelineProps {
  events: BookingStatusEvent[]
}

const EVENT_LABEL: Record<string, string> = {
  create: 'Booking created',
  assign: 'Vendor assigned',
  accept: 'Accepted by vendor',
  reject: 'Rejected by vendor',
  start: 'Service started',
  complete: 'Service completed',
  cancel: 'Booking cancelled',
}

export const StatusTimeline = memo(({ events }: StatusTimelineProps) => {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted">No activity recorded yet.</p>
    )
  }

  return (
    <ol className="relative border-l border-default pl-5 space-y-5">
      {events.map((ev) => (
        <li key={ev.id} className="relative">
          <span
            className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-brand ring-4 ring-surface"
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ev.to_status} />
            <span className="text-sm font-semibold text-primary">
              {EVENT_LABEL[ev.event] ?? ev.event}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            {formatDateTime(ev.created_at)} · by {ev.actor_role}
          </p>
          {ev.note && (
            <p className="text-sm text-secondary mt-1 italic">“{ev.note}”</p>
          )}
        </li>
      ))}
    </ol>
  )
})

StatusTimeline.displayName = 'StatusTimeline'
