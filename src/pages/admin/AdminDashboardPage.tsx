import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import type { AdminStats } from '../../services/adminService'
import type { Booking } from '../../types/domain'
import { monthlyRevenue } from '../../data/mockData'
import { formatDate, statusClass, bookingStatusLabel } from '../../data/helpers'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Keep chart mock — backend doesn't return time-series data yet
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue))

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [statsRes, bookingsRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getBookings(),
      ])
      setStats(statsRes.data)
      setRecentBookings((bookingsRes.data ?? []).slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div className="fade-in space-y-6">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Dashboard Overview</h1>
          <p className="text-muted text-sm mt-1">Welcome back, Admin</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
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

  if (error) {
    return (
      <div className="fade-in space-y-6">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Dashboard Overview</h1>
        </div>
        <div className="glass-card p-8 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button type="button" onClick={loadData} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const kpis = stats
    ? [
        { label: 'Total Revenue', value: `₹${(stats.totalRevenue / 100000).toFixed(2)}L`, sub: 'All time', border: 'stat-border-success' },
        { label: 'Total Bookings', value: stats.totalBookings.toLocaleString(), sub: 'All time', border: 'stat-border-primary' },
        { label: 'Active Vendors', value: String(stats.activeVendors), sub: 'Currently active', border: 'stat-border-info' },
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), sub: 'Registered', border: 'stat-border-warning' },
        { label: 'Avg Rating', value: String(stats.avgRating), sub: 'Platform average', border: 'stat-border-success' },
        { label: 'Pending Approvals', value: String(stats.pendingApprovals), sub: 'Vendors awaiting review', border: 'stat-border-warning' },
      ]
    : []

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Dashboard Overview</h1>
        <p className="text-muted text-sm mt-1">Welcome back, Admin</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`stat-card ${k.border}`}>
            <p className="text-muted text-xs font-medium uppercase tracking-wide">{k.label}</p>
            <p className="font-brand text-2xl font-bold text-primary mt-1">{k.value}</p>
            <p className="text-muted text-xs mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart — uses mock data; backend does not yet provide time-series */}
      <div className="glass-card p-4 md:p-6">
        <h2 className="font-brand text-base font-bold text-primary mb-4">Monthly Revenue Trend</h2>
        <div className="flex items-end gap-3 h-40">
          {monthlyRevenue.map(m => {
            const heightPct = (m.revenue / maxRevenue) * 100
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted font-medium">
                  ₹{(m.revenue / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full rounded-t-md bg-brand"
                  style={{ height: `${heightPct}%` }}
                  title={`${m.month}: ₹${m.revenue.toLocaleString()}`}
                />
                <span className="text-xs text-secondary font-medium">{m.month}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 md:p-6 border-b border-default">
          <h2 className="font-brand text-base font-bold text-primary">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Service</th>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-muted font-semibold text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.map(b => (
                <tr key={b.booking_id} className="table-row">
                  <td className="px-4 py-3 font-mono text-xs text-secondary">{b.booking_id}</td>
                  <td className="px-4 py-3 font-medium text-primary">{b.customer_name}</td>
                  <td className="px-4 py-3 text-secondary hidden md:table-cell">{b.service_name}</td>
                  <td className="px-4 py-3 text-secondary hidden md:table-cell">{formatDate(b.preferred_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge badge-${statusClass(b.booking_status)}`}>
                      {bookingStatusLabel(b.booking_status)}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
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
