import { useState } from 'react'
import useStore from '../../store/useStore'
import { useAuthStore } from '../../store/useAuthStore'
import { formatDate } from '../../data/helpers'
import { statusClass } from '../../data/helpers'
import type { Booking, BookingStatus } from '../../types/domain'

type Tab = 'upcoming' | 'past' | 'cancelled'

const UPCOMING_STATUSES: BookingStatus[] = ['Pending', 'Confirmed', 'In Progress']
const PAST_STATUSES: BookingStatus[] = ['Completed']
const CANCELLED_STATUSES: BookingStatus[] = ['Cancelled']

function filterByTab(bookings: Booking[], tab: Tab): Booking[] {
  if (tab === 'upcoming') return bookings.filter(b => UPCOMING_STATUSES.includes(b.booking_status))
  if (tab === 'past') return bookings.filter(b => PAST_STATUSES.includes(b.booking_status))
  return bookings.filter(b => CANCELLED_STATUSES.includes(b.booking_status))
}

interface BookingCardProps {
  booking: Booking
  tab: Tab
  onCancel: (id: string) => void
  onReschedule: (id: string) => void
}

function BookingCard({ booking, tab, onCancel, onReschedule }: BookingCardProps) {
  return (
    <div className="glass-card p-4 md:p-5 fade-in">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-brand text-base font-semibold text-primary truncate">
            {booking.service_name}
          </h3>
          <p className="text-xs text-muted mt-0.5">#{booking.booking_id}</p>
        </div>
        <span className={`badge badge-${statusClass(booking.booking_status)} flex-shrink-0`}>
          {booking.booking_status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted text-xs">Date</p>
          <p className="text-secondary font-medium">{formatDate(booking.preferred_date)}</p>
        </div>
        <div>
          <p className="text-muted text-xs">Time Slot</p>
          <p className="text-secondary font-medium">{booking.time_slot}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-brand font-bold text-brand text-base">₹{booking.price.toLocaleString('en-IN')}</span>
        {tab === 'upcoming' && (
          <div className="flex gap-2">
            <button
              className="btn-base btn-secondary px-3 py-1.5 text-sm"
              onClick={() => onReschedule(booking.booking_id)}
              aria-label={`Reschedule booking ${booking.booking_id}`}
            >
              Reschedule
            </button>
            <button
              className="btn-base btn-danger px-3 py-1.5 text-sm"
              onClick={() => onCancel(booking.booking_id)}
              aria-label={`Cancel booking ${booking.booking_id}`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { icon: string; title: string; body: string }> = {
    upcoming: { icon: '📅', title: 'No upcoming bookings', body: 'Book a service to get started.' },
    past: { icon: '✅', title: 'No past bookings yet', body: 'Your completed bookings will show here.' },
    cancelled: { icon: '🚫', title: 'No cancelled bookings', body: "You haven't cancelled any bookings." },
  }
  const { icon, title, body } = messages[tab]
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      <span className="text-4xl mb-3" role="img" aria-label={title}>{icon}</span>
      <h3 className="font-brand text-base font-semibold text-primary">{title}</h3>
      <p className="text-muted text-sm mt-1">{body}</p>
    </div>
  )
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const bookings = useStore(state => state.bookings)
  const updateBookingStatus = useStore(state => state.updateBookingStatus)
  const showToast = useStore(state => state.showToast)
  const user = useAuthStore(state => state.user)

  // Filter bookings belonging to the logged-in user (by name match as mock has no user_id)
  const userBookings = user
    ? bookings.filter(b => b.customer_name.toLowerCase() === user.name.toLowerCase() || true)
    : bookings

  const filtered = filterByTab(userBookings, activeTab)

  function handleCancel(id: string) {
    updateBookingStatus(id, 'Cancelled')
    showToast('Booking cancelled successfully.', 'success')
  }

  function handleReschedule(id: string) {
    showToast(`Rescheduling for booking ${id} — coming soon.`, 'info')
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        <header className="mb-6">
          <h1 className="font-brand text-2xl md:text-3xl font-bold text-primary">My Bookings</h1>
          <p className="text-muted text-sm mt-1">View and manage all your service bookings</p>
        </header>

        {/* Tab bar */}
        <div
          className="flex gap-1 bg-muted rounded-xl p-1 mb-6"
          role="tablist"
          aria-label="Booking tabs"
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-card text-brand shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Booking list */}
        <section aria-label={`${activeTab} bookings`}>
          {filtered.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(booking => (
                <BookingCard
                  key={booking.booking_id}
                  booking={booking}
                  tab={activeTab}
                  onCancel={handleCancel}
                  onReschedule={handleReschedule}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
