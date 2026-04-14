import { memo } from 'react'
import { StatusBadge } from '../bookings/StatusBadge'
import { formatDate } from '../../data/helpers'
import type { Booking } from '../../types/domain'

type Action = 'accept' | 'reject' | 'start' | 'complete'

interface BookingInfoCardProps {
  booking: Booking
  busy: Action | 'dispatch' | null
  onAction: (action: Action) => void
  onToggleReject: () => void
  showReject: boolean
}

export const BookingInfoCard = memo(function BookingInfoCard({
  booking,
  busy,
  onAction,
  onToggleReject,
  showReject,
}: BookingInfoCardProps) {
  const s = booking.booking_status
  const canAcceptReject = s === 'assigned'
  const canStart = s === 'accepted'
  const canComplete = s === 'in_progress'

  return (
    <div className="glass-card no-hover p-5 md:p-6 slide-up">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className="font-brand text-lg font-bold text-primary">
            {booking.service_name}
          </h1>
          <p className="text-xs text-muted mt-1">
            <span className="badge text-[10px] px-1.5 py-0.5">#{booking.booking_id.slice(0, 8)}</span>
          </p>
        </div>
        <StatusBadge status={s} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-sm">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide font-semibold">Customer</p>
          <p className="text-primary font-medium mt-0.5">{booking.customer_name}</p>
          <p className="text-xs text-muted">{booking.phone}</p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide font-semibold">Schedule</p>
          <p className="text-primary font-medium mt-0.5">
            {formatDate(booking.preferred_date)} · {booking.time_slot}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs text-muted uppercase tracking-wide font-semibold">Address</p>
          <p className="text-secondary mt-0.5">{booking.address}</p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide font-semibold">Price</p>
          <p className="font-brand text-lg font-bold text-brand mt-0.5">
            ₹{booking.price.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-default">
        {canAcceptReject && (
          <>
            <button
              type="button"
              onClick={() => onAction('accept')}
              disabled={busy !== null}
              className="btn-base btn-success text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
            >
              {busy === 'accept' ? 'Accepting…' : 'Accept'}
            </button>
            <button
              type="button"
              onClick={onToggleReject}
              disabled={busy !== null}
              className="btn-base btn-danger text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
            >
              {showReject ? 'Cancel' : 'Reject'}
            </button>
          </>
        )}
        {canStart && (
          <button
            type="button"
            onClick={() => onAction('start')}
            disabled={busy !== null || !booking.technician_id}
            title={!booking.technician_id ? 'Dispatch a technician first' : undefined}
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
          >
            {busy === 'start' ? 'Starting…' : 'Start service'}
          </button>
        )}
        {canComplete && (
          <button
            type="button"
            onClick={() => onAction('complete')}
            disabled={busy !== null}
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
          >
            {busy === 'complete' ? 'Completing…' : 'Mark complete'}
          </button>
        )}
      </div>
    </div>
  )
})
