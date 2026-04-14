import { memo } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../bookings/StatusBadge'
import { formatDate } from '../../data/helpers'
import type { Booking } from '../../types/domain'

interface VendorRequestCardProps {
  booking: Booking
  onAccept: (bookingId: string) => void
  onReject: (bookingId: string) => void
  isAccepting: boolean
  isRejecting: boolean
  index?: number
}

export const VendorRequestCard = memo(function VendorRequestCard({
  booking,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
  index = 0,
}: VendorRequestCardProps) {
  const showInlineActions = booking.booking_status === 'assigned'

  return (
    <div
      className="glass-card stat-border-primary p-4 hover:shadow-md transition-shadow slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link
        to={`/vendor/requests/${booking.booking_id}`}
        className="block"
        aria-label={`Open request ${booking.booking_id.slice(0, 8)}`}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="font-brand text-sm font-semibold text-primary truncate">
              {booking.service_name}
            </p>
            <p className="text-xs text-muted mt-0.5">
              <span className="badge text-[10px] px-1.5 py-0.5 mr-1.5">
                #{booking.booking_id.slice(0, 8)}
              </span>
              {booking.customer_name}
            </p>
            <p className="text-xs text-secondary mt-1.5 truncate">
              {booking.address}
            </p>
            <p className="text-xs text-secondary mt-1">
              {formatDate(booking.preferred_date)} · {booking.time_slot}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={booking.booking_status} />
            <span className="font-brand text-lg font-bold text-brand">
              ₹{booking.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </Link>

      {showInlineActions && (
        <div className="mt-3 pt-3 border-t border-default flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onReject(booking.booking_id)}
            disabled={isAccepting || isRejecting}
            className="btn-base btn-secondary text-xs px-3 py-2 min-h-[44px] disabled:opacity-60"
          >
            {isRejecting ? 'Rejecting…' : 'Reject'}
          </button>
          <button
            type="button"
            onClick={() => onAccept(booking.booking_id)}
            disabled={isAccepting || isRejecting}
            className="btn-base btn-success text-xs px-3 py-2 min-h-[44px] disabled:opacity-60"
          >
            {isAccepting ? 'Accepting…' : 'Accept'}
          </button>
        </div>
      )}
    </div>
  )
})
