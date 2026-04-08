import { memo, useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import { formatDate } from '../../data/helpers'
import type { Booking, BookingStatus } from '../../types/domain'

type TabKey = BookingStatus

const TABS: { key: TabKey; label: string }[] = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
]

const VendorRequestCard = memo(function VendorRequestCard({
  booking,
}: {
  booking: Booking
}) {
  return (
    <Link
      to={`/vendor/requests/${booking.booking_id}`}
      className="glass-card p-4 block hover:shadow-md transition-shadow"
      aria-label={`Open request ${booking.booking_id.slice(0, 8)}`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary truncate">
            {booking.service_name}
          </p>
          <p className="text-xs text-muted mt-0.5">
            #{booking.booking_id.slice(0, 8)} · {booking.customer_name}
          </p>
          <p className="text-xs text-secondary mt-1 truncate">
            {booking.address}
          </p>
          <p className="text-xs text-secondary mt-1">
            {formatDate(booking.preferred_date)} · {booking.time_slot}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={booking.booking_status} />
          <span className="font-brand font-bold text-brand text-base">
            ₹{booking.price.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </Link>
  )
})

export default function VendorRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = (searchParams.get('status') as TabKey | null) ?? 'assigned'
  const [tab, setTab] = useState<TabKey>(initial)
  const [items, setItems] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await bookingService.listForVendor({ status: tab })
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  const changeTab = (next: TabKey) => {
    setTab(next)
    setSearchParams({ status: next }, { replace: true })
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => changeTab(t.key)}
              className={`btn-base text-xs px-4 py-1.5 min-h-[44px] ${
                active ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {error ? (
        <div className="glass-card p-6 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button
            type="button"
            onClick={load}
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 w-40 bg-surface rounded mb-2" />
              <div className="h-3 w-64 bg-surface rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-muted">
            No requests in this category.
            {tab === 'assigned' && (
              <>
                {' '}
                New assignments from admin will appear here.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <VendorRequestCard key={b.booking_id} booking={b} />
          ))}
        </div>
      )}
    </div>
  )
}
