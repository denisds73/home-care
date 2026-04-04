import { useState } from 'react'
import { monthlyRevenue, mockPayoutRequests } from '../../data/mockData'
import useStore from '../../store/useStore'
import type { PayoutRequest } from '../../types/domain'

export default function FinancePage() {
  const [payouts, setPayouts] = useState(mockPayoutRequests)
  const showToast = useStore(s => s.showToast)
  const maxVal = Math.max(...monthlyRevenue.map(m => Math.max(m.revenue, m.payouts)))

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0)
  const totalPayouts = monthlyRevenue.reduce((s, m) => s + m.payouts, 0)

  const processPayoutRequest = (id: string, status: PayoutRequest['status']) => {
    setPayouts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status, processedAt: new Date().toISOString().split('T')[0] } : p,
      ),
    )
    showToast(`Payout ${status}`, status === 'processed' ? 'success' : 'warning')
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs text-secondary font-medium">Total Revenue (6mo)</p>
          <p className="text-2xl font-bold text-primary mt-1">₹{(totalRevenue / 1000).toFixed(0)}k</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-secondary font-medium">Total Payouts</p>
          <p className="text-2xl font-bold text-primary mt-1">₹{(totalPayouts / 1000).toFixed(0)}k</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-secondary font-medium">Commission (20%)</p>
          <p className="text-2xl font-bold text-success mt-1">₹{((totalRevenue - totalPayouts) / 1000).toFixed(0)}k</p>
        </div>
      </div>

      <div className="glass-card p-5 mb-6">
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
                  <td className="py-2.5 pr-4 text-muted">{p.requestedAt}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`text-xs font-semibold ${
                        p.status === 'processed'
                          ? 'text-success'
                          : p.status === 'pending'
                            ? 'text-amber-600'
                            : 'text-error'
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
