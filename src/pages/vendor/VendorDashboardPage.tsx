import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { useAuthStore } from '../../store/useAuthStore'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import { VendorKpiCard, EmptyState } from '../../components/vendor'
import { ListEmptyState } from '../../components/common/ListEmptyState'
import { formatDate } from '../../data/helpers'
import {
  CalendarIcon,
  ClipboardIcon,
  WrenchIcon,
  PackageIcon,
  BriefcaseIcon,
} from '../../components/common/Icons'
import type { Booking, BookingStatus } from '../../types/domain'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function todayFormatted(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const CHEVRON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="opacity-40" aria-hidden>
    <path d="M9 18l6-6-6-6" />
  </svg>
)

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
        if (alive) setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        if (alive) setIsLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const counts = useMemo(() => {
    const init: Record<BookingStatus, number> = {
      pending: 0, assigned: 0, accepted: 0, in_progress: 0,
      completed: 0, cancelled: 0, rejected: 0,
    }
    for (const b of bookings) init[b.booking_status]++
    return init
  }, [bookings])

  const recentWorks = useMemo(
    () =>
      bookings
        .filter((b) => b.booking_status === 'assigned' || b.booking_status === 'accepted' || b.booking_status === 'in_progress')
        .sort((a, b) => new Date(b.assigned_at ?? b.updated_at).getTime() - new Date(a.assigned_at ?? a.updated_at).getTime())
        .slice(0, 6),
    [bookings],
  )

  const quickActions = [
    { label: 'Review new assignments', to: '/vendor/requests?status=assigned', emphasis: true, count: counts.assigned || null },
    { label: 'Jobs in progress', to: '/vendor/requests?status=in_progress', emphasis: false, count: null },
    { label: 'Manage technicians', to: '/vendor/technicians', emphasis: false, count: null },
    { label: 'Company profile', to: '/vendor/profile', emphasis: false, count: null },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="animate-pulse"><div className="h-7 w-64 bg-surface rounded mb-2" /><div className="h-4 w-48 bg-surface rounded" /></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse"><div className="flex gap-3"><div className="w-10 h-10 bg-surface rounded-[10px]" /><div className="flex-1 space-y-2"><div className="h-3 w-16 bg-surface rounded" /><div className="h-6 w-10 bg-surface rounded" /></div></div></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 glass-card no-hover p-5 animate-pulse"><div className="h-4 w-28 bg-surface rounded mb-4" /><div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-surface rounded-lg" />)}</div></div>
          <div className="lg:col-span-3 glass-card no-hover p-5 animate-pulse"><div className="h-4 w-36 bg-surface rounded mb-4" /><div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-surface rounded-xl" />)}</div></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
            {getGreeting()}{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-muted text-sm mt-0.5">{todayFormatted()}</p>
        </div>
        {counts.assigned > 0 && (
          <Link to="/vendor/requests?status=assigned" className="btn-base btn-primary text-xs px-4 py-1.5 min-h-[44px]">
            {counts.assigned} pending assignment{counts.assigned > 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {error && <div className="glass-card p-4 text-sm text-error">{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <VendorKpiCard icon={<CalendarIcon className="w-5 h-5" />} label="Assigned" value={counts.assigned} sub="Pending review" to="/vendor/requests?status=assigned" accentBg="bg-[var(--color-accent-soft)]" accentColor="text-[var(--color-accent)]" index={0} />
        <VendorKpiCard icon={<ClipboardIcon className="w-5 h-5" />} label="Accepted" value={counts.accepted} sub="Ready to dispatch" to="/vendor/requests?status=accepted" accentBg="bg-[var(--color-primary-soft)]" accentColor="text-brand" index={1} />
        <VendorKpiCard icon={<WrenchIcon className="w-5 h-5" />} label="In Progress" value={counts.in_progress} sub="Currently active" to="/vendor/requests?status=in_progress" accentBg="bg-[var(--color-primary-soft)]" accentColor="text-brand" index={2} />
        <VendorKpiCard icon={<PackageIcon className="w-5 h-5" />} label="Completed" value={counts.completed} sub="Delivered" to="/vendor/requests?status=completed" accentBg="bg-[#DCFCE7]" accentColor="text-success" index={3} />
      </div>

      {/* Two-column: Quick Actions + Recent Works */}
      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Quick Actions */}
          <div className="lg:col-span-2 glass-card no-hover p-4 md:p-5">
            <h2 className="font-brand text-sm font-bold text-primary uppercase tracking-wide mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 min-h-[44px] text-sm transition-colors ${
                    a.emphasis
                      ? 'bg-[var(--color-primary-soft)] text-brand font-semibold hover:bg-[color-mix(in_srgb,var(--color-primary-soft)_80%,var(--color-primary)_20%)]'
                      : 'text-secondary hover:bg-surface'
                  }`}
                >
                  <span>{a.label}</span>
                  <span className="flex items-center gap-1.5">
                    {a.count != null && (
                      <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-brand text-white text-xs font-bold px-1.5">
                        {a.count}
                      </span>
                    )}
                    {CHEVRON}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Works */}
          <div className="lg:col-span-3 glass-card no-hover overflow-hidden">
            <div className="flex items-center justify-between p-4 md:px-6 md:py-4 border-b border-default">
              <h2 className="font-brand text-sm font-bold text-primary uppercase tracking-wide">
                Recently Assigned
              </h2>
              <Link to="/vendor/requests?status=assigned" className="text-xs text-brand font-semibold hover:underline">
                View all
              </Link>
            </div>
            {recentWorks.length === 0 ? (
              <ListEmptyState
                icon={<BriefcaseIcon className="w-12 h-12" />}
                title="No recent assignments"
                description="Assigned and in-progress jobs will list here for quick access."
                variant="embedded"
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {recentWorks.map((b, i) => (
                  <Link
                    key={b.booking_id}
                    to={`/vendor/requests/${b.booking_id}`}
                    className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 hover:bg-surface/40 transition-colors slide-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">{b.service_name}</p>
                      <p className="text-xs text-muted truncate">{b.customer_name} · {formatDate(b.preferred_date)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={b.booking_status} />
                      <span className="text-xs font-semibold text-brand tabular-nums">₹{b.price.toLocaleString('en-IN')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : !error ? (
        <EmptyState
          icon={<BriefcaseIcon className="w-12 h-12" />}
          title="No requests yet"
          description="Once an admin assigns bookings to your team they will appear here."
        />
      ) : null}
    </div>
  )
}
