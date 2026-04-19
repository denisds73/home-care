import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { vendorService } from '../../services/vendorService'
import { Pagination } from '../../components/common/Pagination'
import Dropdown from '../../components/common/Dropdown'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import { ListEmptyState } from '../../components/common/ListEmptyState'
import { ClipboardIcon } from '../../components/common/Icons'
import { formatDate } from '../../data/helpers'
import type { BookingStatus, CategoryId, Booking, Vendor } from '../../types/domain'
import { adminBookingDetail, parseBookingStatusQuery } from '../../lib/adminRoutes'

const PAGE_LIMIT = 20

export default function BookingManagementPage() {
  const showToast = useStore(s => s.showToast)
  const [searchParams, setSearchParams] = useSearchParams()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>(() =>
    parseBookingStatusQuery(searchParams.get('status')),
  )
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | ''>('')
  const [activeVendors, setActiveVendors] = useState<Vendor[]>([])

  const activeVendorNameById = useMemo(
    () =>
      Object.fromEntries(
        activeVendors.map((vendor) => [vendor.id, vendor.company_name]),
      ),
    [activeVendors],
  )

  useEffect(() => {
    vendorService
      .listActive()
      .then(setActiveVendors)
      .catch(() => setActiveVendors([]))
  }, [])

  useEffect(() => {
    setStatusFilter(parseBookingStatusQuery(searchParams.get('status')))
  }, [searchParams])

  const handleStatusFilterChange = (value: BookingStatus | '') => {
    setStatusFilter(value)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set('status', value)
        else next.delete('status')
        return next
      },
      { replace: true },
    )
  }

  const handleAssign = async (bookingId: string, vendorId: string) => {
    if (!vendorId) return
    try {
      await bookingService.assign(bookingId, vendorId)
      showToast('Vendor assigned', 'success')
      await loadBookings()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to assign', 'danger')
    }
  }

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await bookingService.listForAdmin({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: search.trim() || undefined,
        page,
        limit: PAGE_LIMIT,
      })
      setBookings(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, categoryFilter, search, page])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, categoryFilter, search])

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Booking Management</h1>
        <p className="text-muted text-sm mt-1">
          Click any row to open the full detail workspace.
        </p>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            className="input-base py-2 px-3 text-sm flex-1 min-w-[200px]"
            placeholder="Search by ID, customer, or service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Dropdown
            id="booking-admin-status-filter"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            value={statusFilter}
            onChange={v => handleStatusFilterChange(v as BookingStatus | '')}
            placeholder="All Statuses"
            className="min-w-[160px]"
          />
          <Dropdown
            id="booking-admin-category-filter"
            options={[
              { value: '', label: 'All Categories' },
              ...CATEGORIES.map(c => ({ value: c.id, label: c.name })),
            ]}
            value={categoryFilter}
            onChange={v => setCategoryFilter(v as CategoryId | '')}
            placeholder="All Categories"
            className="min-w-[170px]"
          />
        </div>
      </div>

      {error && (
        <div className="glass-card p-6 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button
            type="button"
            onClick={loadBookings}
            className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <div className="glass-card overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="h-4 w-16 bg-surface rounded" />
                  <div className="h-4 w-28 bg-surface rounded" />
                  <div className="h-4 w-24 bg-surface rounded" />
                  <div className="h-4 w-20 bg-surface rounded" />
                  <div className="h-4 w-16 bg-surface rounded" />
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <ListEmptyState
              icon={<ClipboardIcon className="w-12 h-12" />}
              title="No bookings to show"
              description={
                search.trim()
                  ? 'Nothing matches your search on this page. Clear the search or adjust filters.'
                  : 'No bookings match your filters yet. Adjust status or category, or wait for new customer bookings.'
              }
              variant="embedded"
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted bg-surface">
                  <th className="p-3">ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assign vendor</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: Booking) => (
                  <tr key={b.booking_id} className="border-t border-gray-50 hover:bg-surface/50">
                    <td className="p-3 font-medium">
                      <Link
                        to={adminBookingDetail(b.booking_id)}
                        className="text-brand hover:underline"
                      >
                        {b.booking_id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="p-3">{b.customer_name}</td>
                    <td className="p-3">{b.service_name}</td>
                    <td className="p-3 text-muted">{formatDate(b.preferred_date)}</td>
                    <td className="p-3">₹{b.price.toLocaleString()}</td>
                    <td className="p-3">
                      <StatusBadge status={b.booking_status} />
                    </td>
                    <td className="p-3">
                      {(b.booking_status === 'pending' || b.booking_status === 'rejected') && (
                        <Dropdown
                          key={`${b.booking_id}-assign`}
                          id={`assign-vendor-${b.booking_id}`}
                          options={[
                            { value: '', label: 'Assign vendor…' },
                            ...activeVendors.map(v => ({
                              value: v.id,
                              label: v.company_name,
                            })),
                          ]}
                          value=""
                          onChange={v => {
                            if (v) void handleAssign(b.booking_id, v)
                          }}
                          placeholder="Assign vendor…"
                          disabled={activeVendors.length === 0}
                          className="max-w-[180px] [&_button]:py-1.5 [&_button]:px-2 [&_button]:text-xs"
                        />
                      )}
                      {b.booking_status !== 'pending' && b.booking_status !== 'rejected' && (
                        <span className="text-xs text-secondary">
                          {b.vendor_id
                            ? activeVendorNameById[b.vendor_id] ?? 'Assigned'
                            : 'Unassigned'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Pagination
        page={page}
        limit={PAGE_LIMIT}
        total={total}
        onPageChange={setPage}
      />
    </div>
  )
}
