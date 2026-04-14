import {
  memo,
  useCallback,
  useEffect,
  useState,
  type ComponentType,
} from 'react'
import { Link } from 'react-router-dom'
import useStore from '../../store/useStore'
import { bookingService } from '../../services/bookingService'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import { formatDate } from '../../data/helpers'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  BanIcon,
} from '../../components/common/Icons'
import { TechnicianContactButtons } from '../../components/common/TechnicianContactButtons'
import type { Booking, BookingStatus } from '../../types/domain'

type Tab = 'upcoming' | 'past' | 'cancelled'

const UPCOMING_STATUSES: BookingStatus[] = [
  'pending',
  'assigned',
  'accepted',
  'in_progress',
]
const PAST_STATUSES: BookingStatus[] = ['completed']
const CANCELLED_STATUSES: BookingStatus[] = ['cancelled', 'rejected']

const CANCELLABLE: BookingStatus[] = ['pending', 'assigned', 'accepted']

function filterByTab(bookings: Booking[], tab: Tab): Booking[] {
  if (tab === 'upcoming')
    return bookings.filter((b) => UPCOMING_STATUSES.includes(b.booking_status))
  if (tab === 'past')
    return bookings.filter((b) => PAST_STATUSES.includes(b.booking_status))
  return bookings.filter((b) => CANCELLED_STATUSES.includes(b.booking_status))
}

interface BookingCardProps {
  booking: Booking
  onCancel: (id: string) => void
  isCancelling: boolean
}

const BookingCard = memo(function BookingCard({
  booking,
  onCancel,
  isCancelling,
}: BookingCardProps) {
  const canCancel = CANCELLABLE.includes(booking.booking_status)
  return (
    <div className="glass-card p-4 md:p-5 fade-in">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <Link
          to={`/app/bookings/${booking.booking_id}`}
          className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <h3 className="font-brand text-base font-semibold text-primary truncate">
            {booking.service_name}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            #{booking.booking_id.slice(0, 8)}
          </p>
        </Link>
        <StatusBadge status={booking.booking_status} />
      </div>

      <div className="mt-3 text-sm">
        <div>
          <p className="text-muted text-xs">Date</p>
          <p className="text-secondary font-medium">
            {formatDate(booking.preferred_date)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <span className="font-brand font-bold text-brand text-base">
          ₹{booking.price.toLocaleString('en-IN')}
        </span>
        <div className="flex items-center gap-2">
          {booking.technician && (
            <TechnicianContactButtons
              phone={booking.technician.phone}
              technicianName={booking.technician.full_name}
              serviceName={booking.service_name}
              bookingId={booking.booking_id}
              compact
            />
          )}
          <Link
            to={`/app/bookings/${booking.booking_id}`}
            className="btn-base btn-secondary px-3 py-1.5 text-sm min-h-[44px] inline-flex items-center"
          >
            Details
          </Link>
          {canCancel && (
            <button
              type="button"
              className="btn-base btn-danger px-3 py-1.5 text-sm min-h-[44px]"
              onClick={() => onCancel(booking.booking_id)}
              disabled={isCancelling}
              aria-label={`Cancel booking ${booking.booking_id}`}
            >
              {isCancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<
    Tab,
    { Icon: ComponentType<{ className?: string }>; title: string; body: string }
  > = {
    upcoming: {
      Icon: CalendarDaysIcon,
      title: 'No upcoming bookings',
      body: 'Book a service to get started.',
    },
    past: {
      Icon: CheckCircleIcon,
      title: 'No past bookings yet',
      body: 'Your completed bookings will show here.',
    },
    cancelled: {
      Icon: BanIcon,
      title: 'No cancelled bookings',
      body: "You haven't cancelled any bookings.",
    },
  }
  const { Icon, title, body } = messages[tab]
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      <Icon className="w-10 h-10 text-muted mx-auto mb-3" />
      <h3 className="font-brand text-base font-semibold text-primary">
        {title}
      </h3>
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
  const showToast = useStore((s) => s.showToast)

  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const list = await bookingService.listForCustomer()
      setBookings(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCancel = useCallback(
    async (id: string) => {
      setCancellingId(id)
      try {
        await bookingService.cancel(id)
        showToast('Booking cancelled successfully.', 'success')
        await load()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to cancel booking'
        showToast(message, 'danger')
      } finally {
        setCancellingId(null)
      }
    },
    [load, showToast],
  )

  const filtered = filterByTab(bookings, activeTab)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        <header className="mb-6">
          <h1 className="font-brand text-2xl md:text-3xl font-bold text-primary">
            My Bookings
          </h1>
          <p className="text-muted text-sm mt-1">
            View and manage all your service bookings
          </p>
        </header>

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
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                activeTab === key
                  ? 'bg-card text-brand shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-muted border-t-brand rounded-full animate-spin" />
            <p className="text-muted text-sm mt-3">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
            <p className="text-error text-sm font-medium">{error}</p>
            <button
              type="button"
              className="btn-base btn-secondary px-4 py-2 text-sm mt-4 min-h-[44px]"
              onClick={load}
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
                {filtered.map((booking) => (
                  <BookingCard
                    key={booking.booking_id}
                    booking={booking}
                    onCancel={handleCancel}
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
