import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { StatusTimeline } from '../../components/bookings/StatusTimeline'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import { formatDate } from '../../data/helpers'
import useStore from '../../store/useStore'
import { TechnicianContactButtons } from '../../components/common/TechnicianContactButtons'
import type {
  Booking,
  BookingReview,
  BookingStatusEvent,
} from '../../types/domain'
import { ServiceLocationMap } from '../../components/maps'
import { DelayBanner, CriticalDelayModal, RescheduleSheet } from '../../components/delay'
import { delayService } from '../../services/delayService'
import { rescheduleService } from '../../services/rescheduleService'
import type { DelayEvent, RescheduleRequest } from '../../types/delay'

const CANCELLABLE = new Set(['pending', 'assigned', 'accepted'])

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const showToast = useStore((s) => s.showToast)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [events, setEvents] = useState<BookingStatusEvent[]>([])
  const [review, setReview] = useState<BookingReview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cancelling, setCancelling] = useState(false)
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [activeDelay, setActiveDelay] = useState<DelayEvent | null>(null)
  const [activeReschedule, setActiveReschedule] = useState<RescheduleRequest | null>(null)
  const [rescheduleCount, setRescheduleCount] = useState(0)
  const [showRescheduleSheet, setShowRescheduleSheet] = useState(false)
  const [dismissedDelayIds, setDismissedDelayIds] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem('hc_dismissed_delays')
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
    } catch { return new Set() }
  })

  const load = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const [b, ev, rv, delays, reschedules] = await Promise.all([
        bookingService.getById(id),
        bookingService.getEvents(id),
        bookingService.getReview(id),
        delayService.getDelayEvents(id).catch(() => [] as DelayEvent[]),
        rescheduleService.getRequests(id).catch(() => [] as RescheduleRequest[]),
      ])
      setBooking(b)
      setEvents(ev)
      setReview(rv)
      setActiveDelay(delays.find((d) => d.is_active) ?? null)
      const activeRs = reschedules.find((r) =>
        r.status === 'proposed' || r.status === 'counter_proposed'
      ) ?? null
      setActiveReschedule(activeRs)
      setRescheduleCount(reschedules.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleCancel = async () => {
    if (!id) return
    setCancelling(true)
    try {
      await bookingService.cancel(id)
      showToast('Booking cancelled', 'success')
      await load()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to cancel',
        'danger',
      )
    } finally {
      setCancelling(false)
    }
  }

  const handleAcceptEta = async () => {
    if (!id || !activeDelay) return
    try {
      await delayService.respondToDelay(id, activeDelay.id, { response: 'accepted' })
      showToast('Revised ETA accepted', 'success')
      await load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to respond', 'danger')
    }
  }

  const handleRequestDifferentTech = async () => {
    if (!id || !activeDelay) return
    try {
      await delayService.respondToDelay(id, activeDelay.id, { response: 'reschedule_requested' })
      showToast('Request sent to vendor', 'success')
      setActiveDelay(null)
      await load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to request', 'danger')
    }
  }

  const handleAcceptReschedule = async () => {
    if (!id || !activeReschedule) return
    try {
      await rescheduleService.respond(id, activeReschedule.id, { response: 'accepted' })
      showToast('Reschedule confirmed', 'success')
      await load()
    } catch {
      showToast('Failed to accept reschedule', 'danger')
    }
  }

  const handleSubmitReview = async () => {
    if (!id) return
    setSubmittingReview(true)
    try {
      const r = await bookingService.review(id, {
        rating,
        comment: comment.trim() || undefined,
      })
      setReview(r)
      showToast('Thanks for your review!', 'success')
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to submit review',
        'danger',
      )
    } finally {
      setSubmittingReview(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="glass-card p-6 animate-pulse">
            <div className="h-5 w-48 bg-surface rounded mb-3" />
            <div className="h-3 w-64 bg-surface rounded" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="glass-card p-8 text-center">
            <p className="text-error text-sm mb-3">
              {error ?? 'Booking not found'}
            </p>
            <Link
              to="/app/bookings"
              className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
            >
              Back to bookings
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const canCancel = CANCELLABLE.has(booking.booking_status)
  const canReview = booking.booking_status === 'completed' && !review
  const showOtp =
    booking.booking_status === 'in_progress' && !!booking.completion_otp

  const copyOtp = async () => {
    if (!booking.completion_otp) return
    try {
      await navigator.clipboard.writeText(booking.completion_otp)
      showToast('OTP copied', 'success')
    } catch {
      showToast('Could not copy OTP', 'danger')
    }
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div>
          <Link to="/app/bookings" className="text-xs text-muted">
            ← Back to bookings
          </Link>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <h1 className="font-brand text-lg font-bold text-primary">
                {booking.service_name}
              </h1>
              <p className="text-xs text-muted mt-1">#{booking.booking_id}</p>
            </div>
            <StatusBadge status={booking.booking_status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
            <div>
              <p className="text-muted text-xs">Schedule</p>
              <p className="text-secondary font-medium">
                {formatDate(booking.preferred_date)} · {booking.time_slot}
              </p>
            </div>
            <div>
              <p className="text-muted text-xs">Price</p>
              <p className="font-brand font-bold text-brand">
                ₹{booking.price.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted text-xs">Address</p>
              <p className="text-secondary">{booking.address}</p>
              {booking.lat !== undefined && booking.lng !== undefined && (
                <div className="mt-2">
                  <ServiceLocationMap
                    lat={booking.lat}
                    lng={booking.lng}
                    address={booking.address}
                    height="180px"
                    showDirectionsLink
                  />
                </div>
              )}
            </div>
            {booking.technician && (
              <div className="md:col-span-2 mt-1">
                <p className="text-muted text-xs mb-1.5">Technician</p>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-surface)] px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center">
                      <span className="text-sm font-bold text-[var(--color-primary)]">
                        {booking.technician.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-secondary font-semibold truncate">
                      {booking.technician.full_name}
                    </p>
                  </div>
                  <TechnicianContactButtons
                    phone={booking.technician.phone}
                    technicianName={booking.technician.full_name}
                    serviceName={booking.service_name}
                    bookingId={booking.booking_id}
                  />
                </div>
              </div>
            )}
          </div>

          {canCancel && (
            <div className="mt-5">
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-base btn-danger text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
              >
                {cancelling ? 'Cancelling…' : 'Cancel booking'}
              </button>
            </div>
          )}
        </div>

        {/* Delay communication */}
        {activeDelay && activeDelay.delay_type === 'running_late' && (
          <DelayBanner
            delay={activeDelay}
            role="customer"
            onAcceptEta={handleAcceptEta}
            onReschedule={() => setShowRescheduleSheet(true)}
            onCancel={handleCancel}
          />
        )}

        {activeDelay && activeDelay.delay_type === 'cannot_attend' && !dismissedDelayIds.has(activeDelay.id) && (
          <CriticalDelayModal
            mode="cannot_attend"
            isOpen={true}
            onClose={() => {
              if (activeDelay) {
                setDismissedDelayIds(prev => {
                  const next = new Set(prev).add(activeDelay.id)
                  try { sessionStorage.setItem('hc_dismissed_delays', JSON.stringify([...next])) } catch {}
                  return next
                })
              }
              setActiveDelay(null)
            }}
            delay={activeDelay}
            bookingName={booking.service_name}
            bookingId={booking.booking_id}
            onReschedule={() => { setActiveDelay(null); setShowRescheduleSheet(true) }}
            onRequestDifferentTech={handleRequestDifferentTech}
            onCancel={handleCancel}
          />
        )}

        {activeReschedule && activeReschedule.initiated_by_role !== 'client' && (
          <CriticalDelayModal
            mode="reschedule_proposed"
            isOpen={true}
            onClose={() => setActiveReschedule(null)}
            reschedule={activeReschedule}
            bookingName={booking.service_name}
            bookingId={booking.booking_id}
            onAccept={handleAcceptReschedule}
            onSuggestDifferent={() => { setActiveReschedule(null); setShowRescheduleSheet(true) }}
            onCancel={handleCancel}
          />
        )}

        <RescheduleSheet
          isOpen={showRescheduleSheet}
          onClose={() => setShowRescheduleSheet(false)}
          bookingId={booking.booking_id}
          bookingName={booking.service_name}
          currentDate={booking.preferred_date}
          currentSlot={booking.time_slot ?? ''}
          rescheduleCount={rescheduleCount}
          role="customer"
          onSuccess={load}
        />

        {showOtp && (
          <div className="glass-card p-5 border-l-4 border-success">
            <h2 className="font-brand text-base font-bold text-primary">
              Your completion code
            </h2>
            <p className="text-xs text-muted mt-1 mb-3">
              Share this code with the technician when the job is finished.
            </p>
            <p
              className="font-brand text-3xl md:text-4xl font-bold text-primary tracking-widest text-center py-3"
              aria-label={`OTP ${booking.completion_otp}`}
            >
              {booking.completion_otp}
            </p>
            <button
              type="button"
              onClick={copyOtp}
              className="btn-base btn-secondary text-xs px-4 py-2 min-h-[40px] mt-2"
              aria-label="Copy completion code"
            >
              Copy code
            </button>
          </div>
        )}

        <div className="glass-card p-5">
          <h2 className="font-brand text-base font-bold text-primary mb-4">
            Activity
          </h2>
          <StatusTimeline events={events} />
        </div>

        {review && (
          <div className="glass-card p-5">
            <h2 className="font-brand text-base font-bold text-primary mb-2">
              Your review
            </h2>
            <p className="text-sm text-secondary">
              Rating: {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </p>
            {review.comment && (
              <p className="text-sm text-secondary mt-1 italic">
                “{review.comment}”
              </p>
            )}
          </div>
        )}

        {canReview && (
          <div className="glass-card p-5 space-y-3">
            <h2 className="font-brand text-base font-bold text-primary">
              Rate this service
            </h2>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  onClick={() => setRating(n)}
                  className="text-2xl min-h-[44px] min-w-[44px]"
                >
                  <span
                    className={
                      n <= rating ? 'text-warning' : 'text-muted'
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="review-comment" className="label-base">
                Comment (optional)
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                className="input-base w-full px-3 py-2 text-sm"
                placeholder="Share your experience…"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
            >
              {submittingReview ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
