import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Dropdown, { type DropdownOption } from '../../components/common/Dropdown'
import { vendorService } from '../../services/vendorService'
import useStore from '../../store/useStore'
import type { Vendor, VendorStatus } from '../../types/domain'
import { vendorStatusBadgeClass } from '../../utils/vendorStatus'
import {
  adminVendorDetail,
  ADMIN_VENDORS_NEW,
  parseVendorStatusQuery,
} from '../../lib/adminRoutes'

const STATUS_TABS: Array<{ key: VendorStatus | ''; label: string }> = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'rejected', label: 'Rejected' },
]

const VENDOR_STATUS_OPTIONS: DropdownOption[] = STATUS_TABS.map((tab) => ({
  value: tab.key,
  label: tab.label,
}))

const PAGE_SIZE = 20

export default function VendorListPage() {
  const showToast = useStore((s) => s.showToast)
  const [searchParams, setSearchParams] = useSearchParams()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<VendorStatus | ''>(() =>
    parseVendorStatusQuery(searchParams.get('status')),
  )
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

  useEffect(() => {
    setStatusFilter(parseVendorStatusQuery(searchParams.get('status')))
  }, [searchParams])

  const setStatusTab = (key: VendorStatus | '') => {
    setStatusFilter(key)
    setPage(1)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (key) next.set('status', key)
        else next.delete('status')
        return next
      },
      { replace: true },
    )
  }

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
          to={ADMIN_VENDORS_NEW}
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
        >
          + Onboard New Vendor
        </Link>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by company name or email"
            className="input-base py-2 px-3 text-sm flex-1 min-w-[200px]"
            aria-label="Search vendors"
          />
          <Dropdown
            id="vendor-status-filter"
            options={VENDOR_STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => setStatusTab(v as VendorStatus | '')}
            placeholder="Status"
            className="min-w-[160px] w-full sm:w-auto sm:min-w-[180px]"
          />
        </div>
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
      ) : (
        <>
          <div className="glass-card overflow-x-auto rounded-xl border border-gray-100/80 shadow-sm">
            {isLoading ? (
              <div className="p-6 space-y-3 min-w-[min(100%,1180px)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex gap-4 justify-center items-center"
                  >
                    <div className="h-4 w-28 bg-surface rounded shrink-0" />
                    <div className="h-4 w-40 bg-surface rounded shrink-0" />
                    <div className="h-4 w-24 bg-surface rounded shrink-0" />
                    <div className="h-4 w-32 bg-surface rounded shrink-0" />
                    <div className="h-4 w-16 bg-surface rounded shrink-0" />
                    <div className="h-4 w-20 bg-surface rounded shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full min-w-[1180px] table-fixed border-collapse text-sm">
                <colgroup>
                  <col className="w-[13%]" />
                  <col className="w-[17%]" />
                  <col className="w-[13%]" />
                  <col className="w-[24%]" />
                  <col className="w-[9%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200 bg-surface text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-3 py-3 text-center align-middle">
                      Company
                    </th>
                    <th className="px-3 py-3 text-center align-middle">
                      Contact
                    </th>
                    <th className="px-3 py-3 text-center align-middle whitespace-nowrap">
                      GSTIN
                    </th>
                    <th className="px-3 py-3 text-center align-middle">
                      Categories
                    </th>
                    <th className="px-3 py-3 text-center align-middle">
                      Status
                    </th>
                    <th className="px-3 py-3 text-center align-middle whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendors.map((v) => {
                    const categoryLabel =
                      v.categories.length > 0
                        ? v.categories.map((c) => c.name).join(', ')
                        : '—'
                    return (
                      <tr
                        key={v.id}
                        className="hover:bg-surface/50 transition-colors"
                      >
                        <td className="px-3 py-4 align-middle text-center">
                          <Link
                            to={adminVendorDetail(v.id)}
                            className="font-medium text-primary hover:underline inline-block max-w-full break-words"
                          >
                            {v.company_name}
                          </Link>
                        </td>
                        <td className="px-3 py-4 align-middle text-center text-secondary text-xs">
                          <div className="mx-auto space-y-1 max-w-full">
                            <div className="break-all">{v.email}</div>
                            <div className="tabular-nums">{v.contact_number}</div>
                            <div>{v.city}</div>
                          </div>
                        </td>
                        <td className="px-3 py-4 align-middle text-center font-mono text-xs whitespace-nowrap">
                          {v.gst_number}
                          {v.gst_verified ? (
                            <span
                              className="text-success ml-0.5"
                              title="Verified"
                            >
                              ✓
                            </span>
                          ) : null}
                        </td>
                        <td
                          className="px-3 py-4 align-middle text-center text-xs text-secondary"
                          title={categoryLabel !== '—' ? categoryLabel : undefined}
                        >
                          <p className="line-clamp-3 break-words hyphens-auto">
                            {categoryLabel}
                          </p>
                        </td>
                        <td className="px-3 py-4 align-middle text-center">
                          <span className={vendorStatusBadgeClass(v.status)}>
                            {v.status.charAt(0).toUpperCase() +
                              v.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-4 align-middle text-center whitespace-nowrap">
                          <div className="inline-flex flex-nowrap items-center justify-center gap-2">
                            {v.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    quickStatusUpdate(v.id, 'active')
                                  }
                                  className="badge badge-completed cursor-pointer border-0 transition-opacity hover:opacity-90"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    quickStatusUpdate(v.id, 'rejected')
                                  }
                                  className="badge badge-cancelled cursor-pointer border-0 transition-opacity hover:opacity-90"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {v.status === 'active' && (
                              <button
                                type="button"
                                onClick={() =>
                                  quickStatusUpdate(v.id, 'suspended')
                                }
                                className="badge badge-cancelled cursor-pointer border-0 transition-opacity hover:opacity-90"
                              >
                                Suspend
                              </button>
                            )}
                            {v.status === 'suspended' && (
                              <button
                                type="button"
                                onClick={() =>
                                  quickStatusUpdate(v.id, 'active')
                                }
                                className="badge badge-completed cursor-pointer border-0 transition-opacity hover:opacity-90"
                              >
                                Reactivate
                              </button>
                            )}
                            <Link
                              to={adminVendorDetail(v.id)}
                              className="badge badge-completed no-underline transition-opacity hover:opacity-90"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {vendors.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-sm text-muted"
                      >
                        No vendors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {!isLoading && vendors.length > 0 && (
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
          )}
        </>
      )}
    </div>
  )
}
