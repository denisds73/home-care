import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import { bookingService } from '../../services/bookingService'
import { vendorService } from '../../services/vendorService'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import { formatDate, statusClass, getValidTransitions, bookingStatusLabel } from '../../data/helpers'
import type { BookingStatus, CategoryId, Booking, Vendor } from '../../types/domain'

export default function BookingManagementPage() {
  const showToast = useStore(s => s.showToast)

  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | ''>('')
  const [activeVendors, setActiveVendors] = useState<Vendor[]>([])

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
      const filters: Record<string, string> = {}
      if (statusFilter) filters.status = statusFilter
      if (categoryFilter) filters.category = categoryFilter
      if (search) filters.search = search
      const result = await adminService.getBookings(filters)
      setBookings(result.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, categoryFilter, search])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      await adminService.updateBookingStatus(bookingId, status)
      showToast(`Booking ${bookingId} → ${status}`, 'success')
      await loadBookings()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'danger')
    }
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Booking Management</h1>
        <p className="text-muted text-sm mt-1">View, filter, and manage all bookings.</p>
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
          <button type="button" onClick={loadBookings} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
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
                    <th className="p-3">Action</th>
                    <th className="p-3">Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b: Booking) => (
                    <tr key={b.booking_id} className="border-t border-gray-50 hover:bg-surface/50">
                      <td className="p-3 font-medium">{b.booking_id}</td>
                      <td className="p-3">{b.customer_name}</td>
                      <td className="p-3">{b.service_name}</td>
                      <td className="p-3 text-muted">{formatDate(b.preferred_date)}</td>
                      <td className="p-3">₹{b.price.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`badge badge-${statusClass(b.booking_status)}`}>{bookingStatusLabel(b.booking_status)}</span>
                      </td>
                      <td className="p-3">
                        {getValidTransitions(b.booking_status).length > 0 && (
                          <select
                            key={`${b.booking_id}-${b.booking_status}`}
                            className="input-base py-1 px-2 text-xs max-w-[140px]"
                            defaultValue=""
                            aria-label={`Change status for ${b.booking_id}`}
                            onChange={e => {
                              if (e.target.value) handleStatusChange(b.booking_id, e.target.value as BookingStatus)
                            }}
                          >
                            <option value="">Change...</option>
                            {getValidTransitions(b.booking_status).map(s => (
                              <option key={s} value={s}>
                                {bookingStatusLabel(s)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-3">
                        {(b.booking_status === 'pending' || b.booking_status === 'rejected') && (
                          <select
                            key={`${b.booking_id}-assign`}
                            className="input-base py-1 px-2 text-xs max-w-[160px]"
                            defaultValue=""
                            aria-label={`Assign vendor for ${b.booking_id}`}
                            onChange={e => handleAssign(b.booking_id, e.target.value)}
                          >
                            <option value="">Assign vendor…</option>
                            {activeVendors
                              .filter(v =>
                                v.categories.length === 0 ||
                                v.categories.some(c => c.name.toLowerCase() === String(b.category).toLowerCase()) ||
                                true,
                              )
                              .map(v => (
                                <option key={v.id} value={v.id}>
                                  {v.company_name}
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <p className="text-center py-8 text-sm text-muted">No bookings found</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
