import { useState } from 'react'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import { formatDate, statusClass, getValidTransitions } from '../../data/helpers'
import type { BookingStatus, CategoryId, Booking } from '../../types/domain'

export default function BookingManagementPage() {
  const bookings = useStore(s => s.bookings)
  const updateBookingStatus = useStore(s => s.updateBookingStatus)
  const showToast = useStore(s => s.showToast)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | ''>('')

  const filtered = bookings.filter((b: Booking) => {
    if (statusFilter && b.booking_status !== statusFilter) return false
    if (categoryFilter && b.category !== categoryFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        b.booking_id.toLowerCase().includes(q) ||
        b.customer_name.toLowerCase().includes(q) ||
        b.service_name.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status)
    showToast(`Booking ${bookingId} → ${status}`, 'success')
  }

  return (
    <div>
      <div className="glass-card p-4 mb-6">
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
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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

      <div className="glass-card overflow-x-auto">
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((b: Booking) => (
              <tr key={b.booking_id} className="border-t border-gray-50 hover:bg-surface/50">
                <td className="p-3 font-medium">{b.booking_id}</td>
                <td className="p-3">{b.customer_name}</td>
                <td className="p-3">{b.service_name}</td>
                <td className="p-3 text-muted">{formatDate(b.preferred_date)}</td>
                <td className="p-3">₹{b.price.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`badge badge-${statusClass(b.booking_status)}`}>{b.booking_status}</span>
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
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted">No bookings found</p>}
      </div>
    </div>
  )
}
