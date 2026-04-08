import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import { formatDate } from '../../data/helpers'
import type { Booking, BookingStatus } from '../../types/domain'

type Tab = 'accepted' | 'in_progress' | 'completed'

const TABS: { id: Tab; label: string }[] = [
  { id: 'accepted', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
]

export default function TechnicianJobsPage() {
  const [tab, setTab] = useState<Tab>('accepted')
  const [items, setItems] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (status: Tab) => {
    try {
      setIsLoading(true)
      setError(null)
      const list = await bookingService.listForTechnician({
        status: status as BookingStatus,
      })
      setItems(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load(tab)
  }, [tab, load])

  return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="font-brand text-xl font-bold text-primary">My Jobs</h1>
        <p className="text-muted text-sm mt-1">Tap a job to see details.</p>
      </div>

      <div
        role="tablist"
        aria-label="Job filters"
        className="flex gap-2 overflow-x-auto -mx-1 px-1"
      >
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`btn-base text-xs px-4 py-2 min-h-[40px] whitespace-nowrap ${
                active ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="glass-card p-4 text-center">
          <p className="text-error text-xs mb-2">{error}</p>
          <button
            type="button"
            onClick={() => load(tab)}
            className="btn-base btn-primary text-xs px-4 py-1 min-h-[36px]"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-muted">No jobs in this list.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <Link
              key={b.booking_id}
              to={`/technician/jobs/${b.booking_id}`}
              className="glass-card p-4 block hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-brand text-sm font-bold text-primary truncate">
                    {b.service_name}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{b.customer_name}</p>
                </div>
                <StatusBadge status={b.booking_status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                <p>
                  <span className="text-[10px] uppercase tracking-wider">
                    When
                  </span>
                  <br />
                  <span className="text-secondary font-medium">
                    {formatDate(b.preferred_date)} · {b.time_slot}
                  </span>
                </p>
                <p className="text-right">
                  <span className="text-[10px] uppercase tracking-wider">
                    Amount
                  </span>
                  <br />
                  <span className="font-brand font-bold text-brand">
                    ₹{b.price.toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
              <p className="text-xs text-muted mt-2 truncate">{b.address}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
