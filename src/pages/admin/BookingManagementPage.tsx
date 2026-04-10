import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { vendorService } from '../../services/vendorService'
import { Pagination } from '../../components/common/Pagination'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import { formatDate } from '../../data/helpers'
import type { BookingStatus, CategoryId, Booking, Vendor } from '../../types/domain'

const PAGE_LIMIT = 20

export default function BookingManagementPage() {
  const showToast = useStore(s => s.showToast)

  const [bookings, setBookings] = useState<Booking[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
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
        search: search || undefined,
        page,
        limit: PAGE_LIMIT,
      })
      const term = search.trim().toLowerCase()
      const filtered = term
        ? result.items.filter(
            b =>
              b.booking_id.toLowerCase().includes(term) ||
              b.customer_name.toLowerCase().includes(term) ||
              b.service_name.toLowerCase().includes(term),
          )
        : result.items
      setBookings(filtered)
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

  // Reset to page 1 whenever filters change
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
          <select
            className="input-base py-2 px-3 text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as BookingStatus | '')}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="input-base py-2 px-3 text-sm"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as CategoryId | '')}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
          ) : (
            <>
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
                          to={`/admin/bookings/${b.booking_id}`}
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
                          <select
                            key={`${b.booking_id}-assign`}
                            className="input-base py-1 px-2 text-xs max-w-[180px]"
                            defaultValue=""
                            aria-label={`Assign vendor for booking ${b.booking_id}`}
                            onChange={e => handleAssign(b.booking_id, e.target.value)}
                          >
                            <option value="">Assign vendor…</option>
                            {activeVendors.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.company_name}
                              </option>
                            ))}
                          </select>
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
              {bookings.length === 0 && (
                <p className="text-center py-8 text-sm text-muted">No bookings found</p>
              )}
            </>
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
