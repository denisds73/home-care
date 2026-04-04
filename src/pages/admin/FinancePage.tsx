import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import type { FinanceSummary } from '../../services/adminService'
import { monthlyRevenue } from '../../data/mockData'
import { formatDate } from '../../data/helpers'
import useStore from '../../store/useStore'
import type { PayoutRequest } from '../../types/domain'

export default function FinancePage() {
  const showToast = useStore(s => s.showToast)

  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Chart mock — backend does not yet provide time-series revenue data
  const maxVal = Math.max(...monthlyRevenue.map(m => Math.max(m.revenue, m.payouts)))

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [summaryRes, payoutsRes] = await Promise.all([
        adminService.getFinanceSummary(),
        adminService.getPayoutRequests(),
      ])
      setSummary(summaryRes.data)
      setPayouts(payoutsRes.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load finance data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const processPayoutRequest = async (id: string, status: 'processed' | 'rejected') => {
    try {
      await adminService.processPayoutRequest(id, status)
      showToast(`Payout ${status}`, status === 'processed' ? 'success' : 'warning')
      await loadData()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to process payout', 'danger')
    }
  }

  if (isLoading) {
    return (
      <div className="fade-in space-y-6">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Finance & Payouts</h1>
          <p className="text-muted text-sm mt-1">Revenue, commissions, and partner payout management.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-3 w-24 bg-surface rounded mb-2" />
              <div className="h-7 w-20 bg-surface rounded" />
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
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Finance & Payouts</h1>
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

  const totalRevenue = summary?.totalRevenue ?? 0
  const totalPayouts = summary?.totalPayouts ?? 0
  const net = summary?.net ?? totalRevenue - totalPayouts

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Finance & Payouts</h1>
        <p className="text-muted text-sm mt-1">Revenue, commissions, and partner payout management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card stat-border-primary">
          <p className="text-xs text-secondary font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-primary mt-1">₹{(totalRevenue / 1000).toFixed(0)}k</p>
        </div>
        <div className="stat-card stat-border-warning">
          <p className="text-xs text-secondary font-medium">Total Payouts</p>
          <p className="text-2xl font-bold text-primary mt-1">₹{(totalPayouts / 1000).toFixed(0)}k</p>
        </div>
        <div className="stat-card stat-border-success">
          <p className="text-xs text-secondary font-medium">Net Revenue</p>
          <p className="text-2xl font-bold text-success mt-1">₹{(net / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Chart — uses mock time-series data; backend does not yet provide this */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Revenue vs Payouts</h2>
        <div className="flex items-end gap-4 h-40">
          {monthlyRevenue.map(m => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="w-full flex gap-1 items-end" style={{ height: '100%' }}>
                <div
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${(m.revenue / maxVal) * 100}%`,
                    background: 'var(--color-primary)',
                    opacity: 0.8,
                    minHeight: 4,
                  }}
                />
                <div
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${(m.payouts / maxVal) * 100}%`,
                    background: 'var(--color-accent)',
                    opacity: 0.7,
                    minHeight: 4,
                  }}
                />
              </div>
              <span className="text-xs text-muted">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'var(--color-primary)', opacity: 0.8 }} />
            Revenue
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'var(--color-accent)', opacity: 0.7 }} />
            Payouts
          </span>
        </div>
      </div>

      {/* Payout Requests */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Payout Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-2 pr-4">Partner</th>
                <th className="pb-2 pr-4">Amount</th>
                <th className="pb-2 pr-4">Requested</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className="border-t border-gray-50">
                  <td className="py-2.5 pr-4 font-medium">{p.partnerName}</td>
                  <td className="py-2.5 pr-4">₹{p.amount.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-muted">{formatDate(p.requestedAt)}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`badge ${
                        p.status === 'processed'
                          ? 'badge-confirmed'
                          : p.status === 'pending'
                            ? 'badge-pending'
                            : 'badge-cancelled'
                      }`}
                    >
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-2.5">
                    {p.status === 'pending' && (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => processPayoutRequest(p.id, 'processed')}
                          className="text-xs text-success font-semibold min-h-[44px]"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => processPayoutRequest(p.id, 'rejected')}
                          className="text-xs text-error font-semibold min-h-[44px]"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted">
                    No payout requests
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
