import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { useAuthStore } from '../../store/useAuthStore'
import type { Booking, BookingStatus } from '../../types/domain'

interface Kpi {
  label: string
  value: number
  to: string
  border: string
}

export default function VendorDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await bookingService.listForVendor()
        if (alive) setBookings(data)
      } catch (err) {
        if (alive)
          setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        if (alive) setIsLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const counts = useMemo(() => {
    const init: Record<BookingStatus, number> = {
      pending: 0,
      assigned: 0,
      accepted: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
    }
    for (const b of bookings) init[b.booking_status]++
    return init
  }, [bookings])

  const kpis: Kpi[] = [
    { label: 'Assigned', value: counts.assigned, to: '/vendor/requests?status=assigned', border: 'stat-border-warning' },
    { label: 'Accepted', value: counts.accepted, to: '/vendor/requests?status=accepted', border: 'stat-border-info' },
    { label: 'In Progress', value: counts.in_progress, to: '/vendor/requests?status=in_progress', border: 'stat-border-primary' },
    { label: 'Completed', value: counts.completed, to: '/vendor/requests?status=completed', border: 'stat-border-success' },
  ]

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-muted text-sm mt-1">
          Here is a quick snapshot of your service requests.
        </p>
      </div>

      {error && (
        <div className="glass-card p-4 text-sm text-error">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            to={k.to}
            className={`stat-card ${k.border} hover:shadow-md transition-shadow`}
          >
            <p className="text-muted text-xs font-medium uppercase tracking-wide">
              {k.label}
            </p>
            <p className="font-brand text-2xl font-bold text-primary mt-1">
              {isLoading ? '—' : k.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="glass-card p-4 md:p-6">
        <h2 className="font-brand text-base font-bold text-primary mb-3">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/vendor/requests?status=assigned"
            className="btn-base btn-primary text-sm px-4 py-2 min-h-[44px]"
          >
            Review new assignments
          </Link>
          <Link
            to="/vendor/requests?status=in_progress"
            className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px]"
          >
            Jobs in progress
          </Link>
          <Link
            to="/vendor/profile"
            className="btn-base btn-ghost text-sm px-4 py-2 min-h-[44px]"
          >
            Company profile
          </Link>
        </div>
      </div>
    </div>
  )
}
