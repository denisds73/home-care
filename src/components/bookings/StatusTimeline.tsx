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
  delay_reported: 'Delay reported',
  delay_updated: 'Delay updated',
  delay_accepted: 'Client accepted revised ETA',
  delay_cancelled: 'Client cancelled due to delay',
  cannot_attend: 'Technician cannot attend',
  reschedule_proposed: 'Reschedule proposed',
  reschedule_accepted: 'Reschedule accepted',
  reschedule_rejected: 'Reschedule rejected',
  reschedule_counter: 'Counter-proposal submitted',
  technician_reassigned: 'Technician reassigned',
}

const DELAY_EVENTS = new Set([
  'delay_reported',
  'delay_updated',
  'cannot_attend',
])
const RESOLVE_EVENTS = new Set([
  'delay_accepted',
  'reschedule_accepted',
  'technician_reassigned',
])
const ERROR_EVENTS = new Set(['delay_cancelled', 'reschedule_rejected'])

function getDotClass(event: string): string {
  if (DELAY_EVENTS.has(event)) return 'bg-accent-soft border-warning'
  if (ERROR_EVENTS.has(event)) return 'bg-error-soft border-error'
  if (RESOLVE_EVENTS.has(event)) return 'border-success bg-[#DCFCE7]'
  return 'bg-brand-soft border-brand'
}

export const StatusTimeline = memo(({ events }: StatusTimelineProps) => {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted">No activity recorded yet.</p>
    )
  }

  return (
    <ol className="relative border-l border-default pl-6 space-y-5">
      {events.map((ev) => (
        <li key={ev.id} className="relative">
          <span
            className={`absolute -left-[27.5px] top-1 w-[11px] h-[11px] rounded-full border-2 ring-4 ring-surface ${getDotClass(ev.event)}`}
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
            <p className="text-sm text-secondary mt-1 italic">"{ev.note}"</p>
          )}
        </li>
      ))}
    </ol>
  )
})

StatusTimeline.displayName = 'StatusTimeline'
