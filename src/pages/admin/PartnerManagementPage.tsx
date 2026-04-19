import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import { CATEGORIES } from '../../data/categories'
import useStore from '../../store/useStore'
import type { Partner, PartnerStatus } from '../../types/domain'
import Dropdown from '../../components/common/Dropdown'
import { ListEmptyState } from '../../components/common/ListEmptyState'
import { UsersIcon } from '../../components/common/Icons'

export default function PartnerManagementPage() {
  const showToast = useStore(s => s.showToast)

  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | ''>('')

  const loadPartners = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await adminService.getPartners()
      // API returns nested user object + snake_case — map to Partner interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: Partner[] = (result.data as any[] ?? []).map((p: any) => {
        const user = (p.user ?? {}) as Record<string, unknown>
        return {
          id: String(p.id),
          name: String(user.name ?? ''),
          email: String(user.email ?? ''),
          phone: String(user.phone ?? ''),
          avatar: (user.avatar as string) || undefined,
          skills: (p.skills ?? []) as Partner['skills'],
          rating: Number(p.rating ?? 0),
          completedJobs: Number(p.completed_jobs ?? 0),
          status: String(p.status ?? 'pending') as PartnerStatus,
          serviceArea: String(p.service_area ?? ''),
          isOnline: Boolean(p.is_online),
          joinedAt: String(p.joined_at ?? ''),
          earnings: Number(p.earnings ?? 0),
        }
      })
      setPartners(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partners')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPartners()
  }, [loadPartners])

  const filtered = statusFilter ? partners.filter(p => p.status === statusFilter) : partners

  const updateStatus = async (id: string, status: PartnerStatus) => {
    try {
      await adminService.updatePartnerStatus(id, status)
      showToast(
        `Partner ${status === 'approved' ? 'approved' : status === 'suspended' ? 'suspended' : 'set to pending'}`,
        status === 'approved' ? 'success' : 'warning',
      )
      await loadPartners()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update partner status', 'danger')
    }
  }

  const getCategoryName = (id: string) => CATEGORIES.find(c => c.id === id)?.name || id

  if (error && partners.length === 0) {
    return (
      <div className="fade-in space-y-6">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Partner Management</h1>
        </div>
        <div className="glass-card p-8 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button type="button" onClick={loadPartners} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Partner Management</h1>
        <p className="text-muted text-sm mt-1">Approve, monitor, and manage service partners.</p>
      </div>

      <div className="flex gap-3">
        <Dropdown
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'suspended', label: 'Suspended' },
          ]}
          value={statusFilter}
          onChange={v => setStatusFilter(v as PartnerStatus | '')}
          placeholder="All Statuses"
          className="min-w-[160px]"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-surface" />
                <div>
                  <div className="h-4 w-28 bg-surface rounded mb-1" />
                  <div className="h-3 w-40 bg-surface rounded" />
                </div>
              </div>
              <div className="h-3 w-48 bg-surface rounded" />
            </div>
          ))}
        </div>
      ) : (
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
          {filtered.length === 0 && (
            <ListEmptyState
              icon={<UsersIcon className="w-12 h-12" />}
              title={partners.length === 0 ? 'No partners yet' : 'No partners in this status'}
              description={
                partners.length === 0
                  ? 'Partners who register will appear here for approval.'
                  : 'Try selecting a different status filter.'
              }
            />
          )}
        </div>
      )}
    </div>
  )
}
