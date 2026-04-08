import { useState, useEffect, type ComponentType } from 'react'
import useStore from '../../store/useStore'
import { formatDate } from '../../data/helpers'
import { statusClass, bookingStatusLabel } from '../../data/helpers'
import { CalendarDaysIcon, CheckCircleIcon, BanIcon } from '../../components/common/Icons'
import type { Booking, BookingStatus } from '../../types/domain'

type Tab = 'upcoming' | 'past' | 'cancelled'

const UPCOMING_STATUSES: BookingStatus[] = ['pending', 'assigned', 'accepted', 'in_progress']
const PAST_STATUSES: BookingStatus[] = ['completed']
const CANCELLED_STATUSES: BookingStatus[] = ['cancelled', 'rejected']

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
  isCancelling: boolean
}

function BookingCard({ booking, tab, onCancel, onReschedule, isCancelling }: BookingCardProps) {
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
          {bookingStatusLabel(booking.booking_status)}
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
              disabled={isCancelling}
              aria-label={`Cancel booking ${booking.booking_id}`}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { Icon: ComponentType<{ className?: string }>; title: string; body: string }> = {
    upcoming: { Icon: CalendarDaysIcon, title: 'No upcoming bookings', body: 'Book a service to get started.' },
    past: { Icon: CheckCircleIcon, title: 'No past bookings yet', body: 'Your completed bookings will show here.' },
    cancelled: { Icon: BanIcon, title: 'No cancelled bookings', body: "You haven't cancelled any bookings." },
  }
  const { Icon, title, body } = messages[tab]
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      <Icon className="w-10 h-10 text-muted mx-auto mb-3" />
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
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const bookings = useStore(s => s.bookings)
  const bookingsLoading = useStore(s => s.bookingsLoading)
  const bookingsError = useStore(s => s.bookingsError)
  const fetchBookings = useStore(s => s.fetchBookings)
  const updateBookingStatus = useStore(s => s.updateBookingStatus)
  const showToast = useStore(s => s.showToast)

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const filtered = filterByTab(bookings, activeTab)

  async function handleCancel(id: string) {
    setCancellingId(id)
    try {
      const { cancelBooking } = await import('../../services/bookingService').then(m => m.bookingService)
      await cancelBooking(id)
      updateBookingStatus(id, 'cancelled')
      showToast('Booking cancelled successfully.', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel booking'
      showToast(message, 'danger')
    } finally {
      setCancellingId(null)
    }
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

        {/* Content states */}
        {bookingsLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-muted border-t-brand rounded-full animate-spin" />
            <p className="text-muted text-sm mt-3">Loading bookings...</p>
          </div>
        ) : bookingsError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
            <p className="text-error text-sm font-medium">{bookingsError}</p>
            <button
              className="btn-base btn-secondary px-4 py-2 text-sm mt-4"
              onClick={fetchBookings}
              aria-label="Retry loading bookings"
            >
              Retry
            </button>
          </div>
        ) : (
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
                    isCancelling={cancellingId === booking.booking_id}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
