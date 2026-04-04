import { useState } from 'react'
import { initialPartners } from '../../data/partners'
import { CATEGORIES } from '../../data/categories'
import useStore from '../../store/useStore'
import type { PartnerStatus } from '../../types/domain'

export default function PartnerManagementPage() {
  const [partners, setPartners] = useState(initialPartners)
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | ''>('')
  const showToast = useStore(s => s.showToast)

  const filtered = statusFilter ? partners.filter(p => p.status === statusFilter) : partners

  const updateStatus = (id: string, status: PartnerStatus) => {
    setPartners(prev => prev.map(p => (p.id === id ? { ...p, status } : p)))
    showToast(
      `Partner ${status === 'approved' ? 'approved' : status === 'suspended' ? 'suspended' : 'set to pending'}`,
      status === 'approved' ? 'success' : 'warning',
    )
  }

  const getCategoryName = (id: string) => CATEGORIES.find(c => c.id === id)?.name || id

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Partner Management</h1>
        <p className="text-muted text-sm mt-1">Approve, monitor, and manage service partners.</p>
      </div>

      <div className="flex gap-3">
        <select
          className="input-base py-2 px-3 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as PartnerStatus | '')}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-sm font-bold text-brand shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{p.name}</p>
                  <p className="text-xs text-muted break-all">
                    {p.email} &middot; {p.phone}
                  </p>
                </div>
              </div>
              <span
                className={`badge shrink-0 ${
                  p.status === 'approved'
                    ? 'badge-confirmed'
                    : p.status === 'pending'
                      ? 'badge-pending'
                      : 'badge-cancelled'
                }`}
              >
                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-secondary mb-3">
              <span>Skills: {p.skills.map(getCategoryName).join(', ')}</span>
              <span>Area: {p.serviceArea}</span>
              {p.rating > 0 && <span>Rating: {p.rating}</span>}
              <span>Jobs: {p.completedJobs}</span>
              <span>Earnings: ₹{p.earnings.toLocaleString()}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {p.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => updateStatus(p.id, 'approved')}
                    className="btn-base btn-primary text-xs px-4 py-1.5 min-h-[44px]"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(p.id, 'suspended')}
                    className="btn-base btn-danger text-xs px-4 py-1.5 min-h-[44px]"
                  >
                    Reject
                  </button>
                </>
              )}
              {p.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => updateStatus(p.id, 'suspended')}
                  className="btn-base btn-danger text-xs px-4 py-1.5 min-h-[44px]"
                >
                  Suspend
                </button>
              )}
              {p.status === 'suspended' && (
                <button
                  type="button"
                  onClick={() => updateStatus(p.id, 'approved')}
                  className="btn-base btn-success text-xs px-4 py-1.5 min-h-[44px]"
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
