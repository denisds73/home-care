import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { vendorService } from '../../services/vendorService'
import useStore from '../../store/useStore'
import type { Vendor, VendorStatus } from '../../types/domain'
import { vendorStatusBadgeClass } from '../../utils/vendorStatus'

const STATUS_TABS: Array<{ key: VendorStatus | ''; label: string }> = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'rejected', label: 'Rejected' },
]

const PAGE_SIZE = 20

export default function VendorListPage() {
  const navigate = useNavigate()
  const showToast = useStore((s) => s.showToast)

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<VendorStatus | ''>('')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await vendorService.list({
        status: statusFilter || undefined,
        search: search.trim() || undefined,
        page,
        limit: PAGE_SIZE,
      })
      setVendors(res.items ?? [])
      setTotal(res.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendors')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, search, page])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  )

  const quickStatusUpdate = async (id: string, status: VendorStatus) => {
    try {
      await vendorService.updateStatus(id, status)
      showToast(`Vendor ${status}`, status === 'active' ? 'success' : 'warning')
      await load()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update vendor',
        'danger',
      )
    }
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
            Vendor Onboarding
          </h1>
          <p className="text-muted text-sm mt-1">
            Manage vendor companies providing services on the platform.
          </p>
        </div>
        <Link
          to="/admin/vendors/new"
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
        >
          + Onboard New Vendor
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.key
          return (
            <button
              key={tab.key || 'all'}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key)
                setPage(1)
              }}
              className={`btn-base text-xs px-4 py-1.5 min-h-[44px] ${
                active ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search by company name or email"
          className="input-base py-2 px-3 text-sm flex-1 min-w-[240px]"
          aria-label="Search vendors"
        />
      </div>

      {error && vendors.length === 0 ? (
        <div className="glass-card p-8 text-center">
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 w-40 bg-surface rounded mb-2" />
              <div className="h-3 w-64 bg-surface rounded" />
            </div>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-muted">No vendors found</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {vendors.map((v) => (
              <div key={v.id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/vendors/${v.id}`)}
                    className="text-left min-w-0 flex-1"
                  >
                    <p className="text-sm font-semibold text-primary truncate">
                      {v.company_name}
                    </p>
                    <p className="text-xs text-muted break-all mt-0.5">
                      {v.email} · {v.contact_number} · {v.city}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      GSTIN: {v.gst_number}
                      {v.gst_verified ? ' ✓' : ''}
                    </p>
                    {v.categories.length > 0 && (
                      <p className="text-xs text-secondary mt-1">
                        Categories:{' '}
                        {v.categories.map((c) => c.name).join(', ')}
                      </p>
                    )}
                  </button>
                  <span className={vendorStatusBadgeClass(v.status)}>
                    {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  {v.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => quickStatusUpdate(v.id, 'active')}
                        className="btn-base btn-primary text-xs px-4 py-1.5 min-h-[44px]"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => quickStatusUpdate(v.id, 'rejected')}
                        className="btn-base btn-danger text-xs px-4 py-1.5 min-h-[44px]"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {v.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => quickStatusUpdate(v.id, 'suspended')}
                      className="btn-base btn-danger text-xs px-4 py-1.5 min-h-[44px]"
                    >
                      Suspend
                    </button>
                  )}
                  {v.status === 'suspended' && (
                    <button
                      type="button"
                      onClick={() => quickStatusUpdate(v.id, 'active')}
                      className="btn-base btn-success text-xs px-4 py-1.5 min-h-[44px]"
                    >
                      Reactivate
                    </button>
                  )}
                  <Link
                    to={`/admin/vendors/${v.id}`}
                    className="btn-base btn-ghost text-xs px-4 py-1.5 min-h-[44px]"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Page {page} of {totalPages} · {total} vendors
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-base btn-ghost px-4 py-1.5 min-h-[44px] disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn-base btn-ghost px-4 py-1.5 min-h-[44px] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
