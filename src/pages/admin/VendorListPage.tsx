import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { VendorCreateForm } from '../../components/admin/VendorCreateForm'
import { VendorEditForm } from '../../components/admin/VendorEditForm'
import Dropdown, { type DropdownOption } from '../../components/common/Dropdown'
import Modal from '../../components/common/Modal'
import { vendorService } from '../../services/vendorService'
import useStore from '../../store/useStore'
import type { Vendor, VendorStatus } from '../../types/domain'
import { vendorStatusBadgeClass } from '../../utils/vendorStatus'
import { adminVendorDetail, parseVendorStatusQuery } from '../../lib/adminRoutes'
import { ListEmptyState } from '../../components/common/ListEmptyState'
import { BriefcaseIcon } from '../../components/common/Icons'

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

function formatVendorDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const VENDOR_VIEW_FIELD_LABEL =
  'text-[0.65rem] font-bold uppercase tracking-wide text-black'

function VendorViewDialogContent({ vendor }: { vendor: Vendor }) {
  const categoryLabel =
    vendor.categories.length > 0
      ? vendor.categories.map((c) => c.name).join(', ')
      : '—'

  return (
    <>
      <p className="text-xs font-bold text-secondary -mt-1 mb-1">
        Read-only details
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-1">
        <div>
          <p className={VENDOR_VIEW_FIELD_LABEL}>Status</p>
          <p className="mt-1">
            <span className={vendorStatusBadgeClass(vendor.status)}>
              {vendor.status.charAt(0).toUpperCase() +
                vendor.status.slice(1)}
            </span>
          </p>
        </div>
        <div>
          <p className={VENDOR_VIEW_FIELD_LABEL}>Contact</p>
          <p className="text-sm text-primary mt-1 tabular-nums">
            {vendor.contact_number}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className={VENDOR_VIEW_FIELD_LABEL}>Email</p>
          <p className="text-sm text-primary break-all mt-1">{vendor.email}</p>
        </div>
        <div>
          <p className={VENDOR_VIEW_FIELD_LABEL}>City</p>
          <p className="text-sm text-primary mt-1">{vendor.city}</p>
        </div>
        <div>
          <p className={VENDOR_VIEW_FIELD_LABEL}>GSTIN</p>
          <p className="text-sm font-mono text-primary mt-1">
            {vendor.gst_number}
            {vendor.gst_verified ? (
              <span className="text-success ml-1 text-xs" title="Verified">
                ✓ Verified
              </span>
            ) : null}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className={VENDOR_VIEW_FIELD_LABEL}>PIN codes</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {(vendor.pin_codes ?? []).length === 0 ? (
              <span className="text-sm text-muted">—</span>
            ) : (
              vendor.pin_codes.map((pin) => (
                <span
                  key={pin}
                  className="badge badge-confirmed text-[0.7rem] py-0.5"
                >
                  {pin}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <p className={VENDOR_VIEW_FIELD_LABEL}>Categories</p>
          <p className="text-sm text-secondary mt-1">{categoryLabel}</p>
        </div>
        {vendor.notes?.trim() ? (
          <div className="sm:col-span-2">
            <p className={VENDOR_VIEW_FIELD_LABEL}>Admin notes</p>
            <p className="text-sm text-secondary mt-1 whitespace-pre-wrap">
              {vendor.notes}
            </p>
          </div>
        ) : null}
        <div className="sm:col-span-2 border-t border-default pt-4 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className={VENDOR_VIEW_FIELD_LABEL}>Onboarded</p>
            <p className="text-sm text-muted mt-1">
              {formatVendorDate(vendor.created_at)}
            </p>
          </div>
          <div>
            <p className={VENDOR_VIEW_FIELD_LABEL}>Last updated</p>
            <p className="text-sm text-muted mt-1">
              {formatVendorDate(vendor.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

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
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    company_name: string
  } | null>(null)
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null)
  const [addVendorOpen, setAddVendorOpen] = useState(false)
  const [editVendor, setEditVendor] = useState<{
    id: string
    company_name: string
  } | null>(null)

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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await vendorService.remove(deleteTarget.id)
      showToast('Vendor deleted', 'success')
      setDeleteTarget(null)
      await load()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete vendor',
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
        <button
          type="button"
          onClick={() => setAddVendorOpen(true)}
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
        >
          + Onboard New Vendor
        </button>
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
              <div className="p-6 space-y-3 min-w-[min(100%,1280px)]">
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
              <table className="w-full min-w-[1280px] table-fixed border-collapse text-sm">
                <colgroup>
                  <col className="w-[12%]" />
                  <col className="w-[16%]" />
                  <col className="w-[12%]" />
                  <col className="w-[22%]" />
                  <col className="w-[8%]" />
                  <col className="w-[30%]" />
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
                        <td className="px-3 py-4 align-middle text-center">
                          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2">
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
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(null)
                                setViewVendor(v)
                              }}
                              className="badge badge-confirmed cursor-pointer border-0 transition-opacity hover:opacity-90"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditVendor({
                                  id: v.id,
                                  company_name: v.company_name,
                                })
                              }
                              className="badge badge-completed cursor-pointer border-0 transition-opacity hover:opacity-90"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setViewVendor(null)
                                setDeleteTarget({
                                  id: v.id,
                                  company_name: v.company_name,
                                })
                              }}
                              className="badge badge-cancelled cursor-pointer border-0 transition-opacity hover:opacity-90"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {vendors.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <ListEmptyState
                          icon={<BriefcaseIcon className="w-12 h-12" />}
                          title={
                            total === 0 && !search.trim() && !statusFilter
                              ? 'No vendors yet'
                              : 'No vendors found'
                          }
                          description={
                            total === 0 && !search.trim() && !statusFilter
                              ? 'Onboard a vendor to have them appear in this list.'
                              : 'Try another search or clear the status filter.'
                          }
                          variant="embedded"
                        />
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

      <Modal
        isOpen={viewVendor !== null}
        onClose={() => setViewVendor(null)}
        title={viewVendor?.company_name ?? 'Vendor'}
        maxWidth="max-w-xl"
        overlay="layout"
      >
        {viewVendor ? <VendorViewDialogContent vendor={viewVendor} /> : null}
      </Modal>

      <Modal
        isOpen={addVendorOpen}
        onClose={() => setAddVendorOpen(false)}
        title="Onboard New Vendor"
        maxWidth="max-w-3xl"
        overlay="layout"
      >
        <VendorCreateForm
          variant="dialog"
          onCancelDialog={() => setAddVendorOpen(false)}
          onCreated={() => {
            setAddVendorOpen(false)
            void load()
          }}
        />
      </Modal>

      <Modal
        isOpen={editVendor !== null}
        onClose={() => setEditVendor(null)}
        title={
          editVendor
            ? `Edit · ${editVendor.company_name}`
            : 'Edit vendor'
        }
        maxWidth="max-w-3xl"
        overlay="layout"
      >
        {editVendor ? (
          <VendorEditForm
            key={editVendor.id}
            vendorId={editVendor.id}
            variant="dialog"
            onCloseDialog={() => setEditVendor(null)}
            onSavedDialog={() => {
              setEditVendor(null)
              void load()
            }}
          />
        ) : null}
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        overlay="layout"
      >
        <div className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-primary">
            Delete vendor?
          </h3>
          <p className="text-sm text-muted">
            {deleteTarget
              ? `"${deleteTarget.company_name}" will be permanently removed. This cannot be undone.`
              : null}
          </p>
          <div className="flex gap-3 justify-end flex-wrap">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="btn-base btn-ghost text-sm px-4 py-2 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmDelete()}
              className="btn-base btn-danger text-sm px-4 py-2 min-h-[44px]"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
