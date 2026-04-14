import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { bookingService } from '../../services/bookingService'
import { vendorService } from '../../services/vendorService'
import useStore from '../../store/useStore'
import type { AdminStats } from '../../services/adminService'
import type { Booking, Vendor } from '../../types/domain'
import { monthlyRevenue } from '../../data/mockData'
import { formatDate } from '../../data/helpers'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import Dropdown from '../../components/common/Dropdown'
import {
  buildAdminBookingsUrl,
  buildAdminVendorsUrl,
  adminBookingDetail,
  ADMIN_BOOKINGS,
  ADMIN_FINANCE,
  ADMIN_USERS,
  ADMIN_VENDORS,
  ADMIN_VENDORS_NEW,
} from '../../lib/adminRoutes'
import {
  WalletIcon,
  ClipboardIcon,
  CalendarIcon,
  BriefcaseIcon,
  UsersIcon,
  WrenchIcon,
  PackageIcon,
} from '../../components/common/Icons'

/* ── Helpers ── */

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

function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`
  return `₹${value.toLocaleString()}`
}

/* ── KPI definition ── */

type KpiCategory = 'financial' | 'neutral' | 'urgent' | 'onboarding'

interface KpiDef {
  label: string
  value: string
  sub: string
  to: string
  category: KpiCategory
  icon: ReactNode
}

/* ── Chart constant ── */
const CHART_BAR_MAX_H = 96

/* ── Component ── */

export default function AdminDashboardPage() {
  const showToast = useStore((s) => s.showToast)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [activeVendors, setActiveVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue))

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [statsRes, page, vendors] = await Promise.all([
        adminService.getDashboardStats(),
        bookingService.listForAdmin({ page: 1, limit: 5 }),
        vendorService.listActive().catch(() => [] as Vendor[]),
      ])
      setStats(statsRes.data)
      setRecentBookings(page.items)
      setActiveVendors(vendors)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
    const tick = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadData()
    }, 30_000)
    return () => window.clearInterval(tick)
  }, [loadData])

  const handleAssign = async (bookingId: string, vendorId: string) => {
    if (!vendorId) return
    try {
      await bookingService.assign(bookingId, vendorId)
      showToast('Vendor assigned successfully', 'success')
      await loadData()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to assign vendor', 'danger')
    }
  }

  const activeVendorNameById = useMemo(
    () => Object.fromEntries(activeVendors.map((v) => [v.id, v.company_name])),
    [activeVendors],
  )

  /* ── KPI cards ── */

  const primaryKpis: KpiDef[] = useMemo(() => {
    if (!stats) return []
    return [
      {
        label: 'Total Revenue',
        value: formatCurrency(stats.totalRevenue ?? 0),
        sub: 'All time',
        to: ADMIN_FINANCE,
        category: 'financial',
        icon: <WalletIcon className="w-5 h-5" aria-hidden />,
      },
      {
        label: 'Total Bookings',
        value: (stats.totalBookings ?? 0).toLocaleString(),
        sub: 'All time',
        to: ADMIN_BOOKINGS,
        category: 'neutral',
        icon: <ClipboardIcon className="w-5 h-5" aria-hidden />,
      },
      {
        label: 'Active Vendors',
        value: String(stats.activeVendors ?? 0),
        sub: 'Currently active',
        to: ADMIN_VENDORS,
        category: 'neutral',
        icon: <BriefcaseIcon className="w-5 h-5" aria-hidden />,
      },
      {
        label: 'Total Users',
        value: (stats.totalUsers ?? 0).toLocaleString(),
        sub: 'Registered',
        to: ADMIN_USERS,
        category: 'neutral',
        icon: <UsersIcon className="w-5 h-5" aria-hidden />,
      },
    ]
  }, [stats])

  const actionKpis: KpiDef[] = useMemo(() => {
    if (!stats) return []
    return [
      {
        label: 'Avg Rating',
        value: (stats.avgRating ?? 0).toFixed(1),
        sub: 'From completed reviews',
        to: ADMIN_BOOKINGS,
        category: 'neutral',
        icon: <WrenchIcon className="w-5 h-5" aria-hidden />,
      },
      {
        label: 'Pending Bookings',
        value: String(stats.pendingApprovals ?? 0),
        sub: 'Awaiting vendor assignment',
        to: buildAdminBookingsUrl({ status: 'pending' }),
        category: 'urgent',
        icon: <CalendarIcon className="w-5 h-5" aria-hidden />,
      },
      {
        label: 'Vendor Onboarding',
        value: String(stats.pendingVendorApprovals ?? 0),
        sub: 'Applications pending review',
        to: buildAdminVendorsUrl({ status: 'pending' }),
        category: 'onboarding',
        icon: <PackageIcon className="w-5 h-5" aria-hidden />,
      },
    ]
  }, [stats])

  /* ── Quick actions ── */

  const quickActions = useMemo(() => {
    const items: Array<{ label: string; to: string; emphasis: boolean; count?: number }> = []
    if (stats?.pendingApprovals) {
      items.push({
        label: 'Assign vendors to pending bookings',
        to: buildAdminBookingsUrl({ status: 'pending' }),
        emphasis: true,
        count: stats.pendingApprovals,
      })
    }
    if (stats?.pendingVendorApprovals) {
      items.push({
        label: 'Review vendor applications',
        to: buildAdminVendorsUrl({ status: 'pending' }),
        emphasis: true,
        count: stats.pendingVendorApprovals,
      })
    }
    items.push(
      { label: 'Onboard a new vendor', to: ADMIN_VENDORS_NEW, emphasis: false },
      { label: 'View all bookings', to: ADMIN_BOOKINGS, emphasis: false },
      { label: 'Finance & payouts', to: ADMIN_FINANCE, emphasis: false },
    )
    return items
  }, [stats])

  /* ── Loading state ── */

  if (isLoading) {
    return (
      <div className="fade-in space-y-6">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Dashboard Overview</h1>
          <p className="text-muted text-sm mt-1">{todayFormatted()}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-3 w-20 bg-surface rounded mb-2" />
              <div className="h-7 w-16 bg-surface rounded mb-1" />
              <div className="h-3 w-24 bg-surface rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-3 w-20 bg-surface rounded mb-2" />
              <div className="h-7 w-16 bg-surface rounded mb-1" />
              <div className="h-3 w-24 bg-surface rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── Error state ── */

  if (error) {
    return (
      <div className="fade-in space-y-6">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Dashboard Overview</h1>
        </div>
        <div className="glass-card no-hover p-8 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button type="button" onClick={loadData} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
            Retry
          </button>
        </div>
      </div>
    )
  }

  /* ── Main render ── */

  return (
    <div className="fade-in space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
            {getGreeting()}, Admin
          </h1>
          <p className="text-muted text-sm mt-0.5">{todayFormatted()}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(stats?.pendingApprovals ?? 0) > 0 && (
            <Link
              to={buildAdminBookingsUrl({ status: 'pending' })}
              className="btn-base btn-primary text-xs px-4 py-1.5 min-h-[44px]"
            >
              {stats!.pendingApprovals} pending bookings
            </Link>
          )}
          {(stats?.pendingVendorApprovals ?? 0) > 0 && (
            <Link
              to={buildAdminVendorsUrl({ status: 'pending' })}
              className="btn-base btn-secondary text-xs px-4 py-1.5 min-h-[44px]"
            >
              {stats!.pendingVendorApprovals} vendor applications
            </Link>
          )}
        </div>
      </div>

      {/* ── Primary KPI row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {primaryKpis.map((k) => (
          <Link
            key={k.label}
            to={k.to}
            className={`stat-card dashboard-kpi-link dashboard-kpi--${k.category}`}
          >
            <div className="flex gap-3 items-start">
              <div className="dashboard-kpi-icon-wrap">{k.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-muted text-xs font-medium uppercase tracking-wide">{k.label}</p>
                <p className="font-brand text-2xl font-bold text-primary mt-1">{k.value}</p>
                <p className="text-muted text-xs mt-1">{k.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Action KPI row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {actionKpis.map((k) => (
          <Link
            key={k.label}
            to={k.to}
            className={`stat-card dashboard-kpi-link dashboard-kpi--${k.category}`}
          >
            <div className="flex gap-3 items-start">
              <div className="dashboard-kpi-icon-wrap">{k.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-muted text-xs font-medium uppercase tracking-wide">{k.label}</p>
                <p className="font-brand text-2xl font-bold text-primary mt-1">{k.value}</p>
                <p className="text-muted text-xs mt-1">{k.sub}</p>
              </div>
            </div>
            {(k.category === 'urgent' || k.category === 'onboarding') &&
              Number(k.value) > 0 && (
                <span className="mt-2 inline-flex items-center text-xs font-semibold text-brand gap-1">
                  Review now
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              )}
          </Link>
        ))}
      </div>

      {/* ── Two-column: Quick Actions + Revenue chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Quick Actions */}
        <div className="lg:col-span-2 glass-card no-hover p-4 md:p-5">
          <h2 className="font-brand text-sm font-bold text-primary uppercase tracking-wide mb-3">
            Quick Actions
          </h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 min-h-[44px] text-sm transition-colors ${
                  action.emphasis
                    ? 'bg-[var(--color-primary-soft)] text-brand font-semibold hover:bg-[color-mix(in_srgb,var(--color-primary-soft)_80%,var(--color-primary)_20%)]'
                    : 'text-secondary hover:bg-surface'
                }`}
              >
                <span>{action.label}</span>
                <span className="flex items-center gap-1.5">
                  {action.count != null && (
                    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-brand text-white text-xs font-bold px-1.5">
                      {action.count}
                    </span>
                  )}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-40"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="lg:col-span-3 glass-card no-hover p-4 md:p-5">
          <h2 className="font-brand text-sm font-bold text-primary uppercase tracking-wide mb-1">
            Revenue Trend
          </h2>
          <p className="text-xs text-muted mb-4">
            Illustrative data — API time-series not wired yet.
          </p>
          <div className="flex items-end gap-2 sm:gap-3" style={{ height: CHART_BAR_MAX_H + 32 }}>
            {monthlyRevenue.map((m) => {
              const ratio = maxRevenue > 0 ? m.revenue / maxRevenue : 0
              const barH = Math.max(4, Math.round(ratio * CHART_BAR_MAX_H))
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center min-w-0 gap-1"
                >
                  <span className="text-xs text-muted font-medium tabular-nums">
                    {formatCurrency(m.revenue)}
                  </span>
                  <div
                    className="w-full max-w-[48px] rounded-t-md bg-brand transition-[height] duration-300"
                    style={{ height: barH }}
                    title={`${m.month}: ₹${m.revenue.toLocaleString()}`}
                  />
                  <span className="text-xs text-secondary font-medium">{m.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Bookings ── */}
      <div className="glass-card no-hover overflow-hidden">
        <div className="flex items-center justify-between p-4 md:px-6 md:py-4 border-b border-default">
          <h2 className="font-brand text-sm font-bold text-primary uppercase tracking-wide">
            Recent Bookings
          </h2>
          <Link
            to={ADMIN_BOOKINGS}
            className="text-xs text-brand font-semibold hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">
                  ID
                </th>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                  Service
                </th>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">
                  Vendor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.map((b) => (
                <tr key={b.booking_id} className="table-row hover:bg-surface/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      to={adminBookingDetail(b.booking_id)}
                      className="text-brand hover:underline font-medium"
                    >
                      {b.booking_id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">
                    {b.customer_name}
                  </td>
                  <td className="px-4 py-3 text-secondary hidden md:table-cell">
                    {b.service_name}
                  </td>
                  <td className="px-4 py-3 text-secondary hidden md:table-cell">
                    {formatDate(b.preferred_date)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.booking_status} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {(b.booking_status === 'pending' || b.booking_status === 'rejected') ? (
                      <Dropdown
                        key={`${b.booking_id}-assign-vendor`}
                        id={`dashboard-assign-vendor-${b.booking_id}`}
                        options={[
                          { value: '', label: 'Assign vendor…' },
                          ...activeVendors.map((v) => ({
                            value: v.id,
                            label: v.company_name,
                          })),
                        ]}
                        value=""
                        onChange={(v) => {
                          if (v) void handleAssign(b.booking_id, v)
                        }}
                        placeholder="Assign vendor…"
                        disabled={activeVendors.length === 0}
                        className="max-w-[160px] [&_button]:py-1.5 [&_button]:px-2 [&_button]:text-xs"
                      />
                    ) : (
                      <span className="text-xs text-secondary">
                        {b.vendor_id
                          ? activeVendorNameById[b.vendor_id] ?? 'Assigned'
                          : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                    No recent bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
