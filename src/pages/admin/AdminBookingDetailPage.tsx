import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { vendorService } from '../../services/vendorService'
import { technicianService } from '../../services/technicianService'
import { StatusTimeline } from '../../components/bookings/StatusTimeline'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import { formatDate } from '../../data/helpers'
import useStore from '../../store/useStore'
import type {
  Booking,
  BookingReview,
  BookingStatusEvent,
  Technician,
  Vendor,
} from '../../types/domain'
import { DelayBanner, RescheduleSheet } from '../../components/delay'
import { delayService } from '../../services/delayService'
import { rescheduleService } from '../../services/rescheduleService'
import type { DelayEvent, RescheduleRequest } from '../../types/delay'

type BusyAction =
  | 'assign-vendor'
  | 'assign-tech'
  | 'accept'
  | 'start'
  | 'complete'
  | 'cancel'

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const showToast = useStore((s) => s.showToast)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [events, setEvents] = useState<BookingStatusEvent[]>([])
  const [review, setReview] = useState<BookingReview | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<BusyAction | null>(null)

  const [selectedVendor, setSelectedVendor] = useState('')
  const [selectedTech, setSelectedTech] = useState('')
  const [activeDelay, setActiveDelay] = useState<DelayEvent | null>(null)
  const [rescheduleCount, setRescheduleCount] = useState(0)
  const [showRescheduleSheet, setShowRescheduleSheet] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const [b, ev, rv, vs, delays, reschedules] = await Promise.all([
        bookingService.getById(id),
        bookingService.getEvents(id),
        bookingService.getReview(id),
        vendorService.listActive().catch(() => []),
        delayService.getDelayEvents(id).catch(() => [] as DelayEvent[]),
        rescheduleService.getRequests(id).catch(() => [] as RescheduleRequest[]),
      ])
      setBooking(b)
      setEvents(ev)
      setReview(rv)
      setVendors(vs)
      setActiveDelay(delays.find((d) => d.is_active) ?? null)
      setRescheduleCount(reschedules.length)
      if (b.vendor_id) {
        try {
          setTechnicians(
            await technicianService.listForVendorAsAdmin(b.vendor_id),
          )
        } catch {
          setTechnicians([])
        }
      } else {
        setTechnicians([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const run = async (
    action: BusyAction,
    fn: () => Promise<Booking>,
    successMsg: string,
  ) => {
    setBusy(action)
    try {
      await fn()
      showToast(successMsg, 'success')
      setSelectedVendor('')
      setSelectedTech('')
      await load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'danger')
    } finally {
      setBusy(null)
    }
  }

  const assignedVendor = useMemo(
    () =>
      booking?.vendor_id
        ? vendors.find((v) => v.id === booking.vendor_id) ?? null
        : null,
    [vendors, booking],
  )

  const assignedTechnician = useMemo(
    () =>
      booking?.technician_id
        ? technicians.find((t) => t.id === booking.technician_id) ?? null
        : null,
    [technicians, booking],
  )

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-5 w-48 bg-surface rounded mb-3" />
        <div className="h-3 w-64 bg-surface rounded" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-error text-sm mb-3">{error ?? 'Booking not found'}</p>
        <Link
          to="/admin/bookings"
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
        >
          Back to bookings
        </Link>
      </div>
    )
  }

  const s = booking.booking_status
  const canAssignVendor = s === 'pending' || s === 'rejected'
  const canAccept = s === 'assigned'
  const canStart = s === 'accepted' && !!booking.technician_id
  const canComplete = s === 'in_progress'
  const canCancel =
    s === 'pending' ||
    s === 'assigned' ||
    s === 'accepted' ||
    s === 'in_progress'
  const canDispatchTech = s === 'accepted' || s === 'in_progress'
  const dispatchLocked = s === 'in_progress'

  return (
    <div className="fade-in space-y-5">
      <div>
        <Link
          to="/admin/bookings"
          className="text-xs text-muted hover:text-primary"
        >
          ← Back to all bookings
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
          <StatusBadge status={s} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
          <div>
            <p className="text-muted text-xs">Customer</p>
            <p className="text-secondary font-medium">{booking.customer_name}</p>
            <a
              href={`tel:${booking.phone}`}
              className="text-xs text-brand font-semibold inline-block mt-1"
            >
              {booking.phone} · Call
            </a>
          </div>
          <div>
            <p className="text-muted text-xs">Schedule</p>
            <p className="text-secondary font-medium">
              {formatDate(booking.preferred_date)} · {booking.time_slot}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-muted text-xs">Address</p>
            <p className="text-secondary">{booking.address}</p>
          </div>
          <div>
            <p className="text-muted text-xs">Amount</p>
            <p className="font-brand font-bold text-brand">
              ₹{booking.price.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-muted text-xs">Payment</p>
            <p className="text-secondary">
              {booking.payment_mode} · {booking.payment_status}
            </p>
          </div>
        </div>
      </div>

      {/* Vendor assignment */}
      <div className="glass-card p-5">
        <h2 className="font-brand text-base font-bold text-primary mb-1">
          Vendor
        </h2>
        {assignedVendor ? (
          <p className="text-sm text-secondary font-medium">
            {assignedVendor.company_name}{' '}
            <span className="text-xs text-muted">({assignedVendor.status})</span>
          </p>
        ) : (
          <p className="text-xs text-muted mb-3">No vendor assigned.</p>
        )}

        {canAssignVendor && (
          <div className="flex gap-2 flex-wrap mt-3">
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              aria-label="Select vendor"
              className="input-base flex-1 min-w-[180px] px-3 py-2 text-sm"
            >
              <option value="">Select vendor…</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.company_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                run(
                  'assign-vendor',
                  () => bookingService.assign(booking.booking_id, selectedVendor),
                  'Vendor assigned',
                )
              }
              disabled={busy !== null || !selectedVendor}
              className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
            >
              {busy === 'assign-vendor' ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        )}
      </div>

      {/* Technician dispatch */}
      {canDispatchTech && (
        <div className="glass-card p-5">
          <h2 className="font-brand text-base font-bold text-primary mb-1">
            Technician
          </h2>
          {assignedTechnician ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm text-secondary font-medium">
                  {assignedTechnician.full_name}
                </p>
                <p className="text-xs text-muted">{assignedTechnician.phone}</p>
              </div>
              {dispatchLocked && (
                <span className="badge badge-warning">Locked — in progress</span>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted mb-3">No technician dispatched.</p>
          )}

          {!dispatchLocked && (
            <div className="flex gap-2 flex-wrap mt-3">
              {technicians.filter((t) => t.status === 'active').length === 0 ? (
                <p className="text-xs text-muted">
                  Vendor has no active technicians.
                </p>
              ) : (
                <>
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    aria-label="Select technician"
                    className="input-base flex-1 min-w-[180px] px-3 py-2 text-sm"
                  >
                    <option value="">
                      {assignedTechnician ? 'Change to…' : 'Select technician…'}
                    </option>
                    {technicians
                      .filter((t) => t.status === 'active')
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      run(
                        'assign-tech',
                        () =>
                          bookingService.assignTechnician(
                            booking.booking_id,
                            selectedTech,
                          ),
                        'Technician dispatched',
                      )
                    }
                    disabled={
                      busy !== null ||
                      !selectedTech ||
                      selectedTech === booking.technician_id
                    }
                    className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
                  >
                    {busy === 'assign-tech' ? 'Dispatching…' : 'Dispatch'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {activeDelay && (
        <DelayBanner
          delay={activeDelay}
          role="admin"
          onReschedule={() => setShowRescheduleSheet(true)}
        />
      )}

      <RescheduleSheet
        isOpen={showRescheduleSheet}
        onClose={() => setShowRescheduleSheet(false)}
        bookingId={booking.booking_id}
        bookingName={booking.service_name}
        currentDate={booking.preferred_date}
        currentSlot={booking.time_slot}
        rescheduleCount={rescheduleCount}
        role="admin"
        onSuccess={load}
      />

      {/* Admin lifecycle overrides */}
      <div className="glass-card p-5">
        <h2 className="font-brand text-base font-bold text-primary mb-1">
          Admin override
        </h2>
        <p className="text-xs text-muted mb-3">
          Force lifecycle transitions when a vendor or technician is stuck.
          Every action is recorded in the audit timeline.
        </p>
        <div className="flex flex-wrap gap-2">
          {canAccept && (
            <button
              type="button"
              onClick={() =>
                run(
                  'accept',
                  () => bookingService.accept(booking.booking_id),
                  'Booking accepted',
                )
              }
              disabled={busy !== null}
              className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px] disabled:opacity-60"
            >
              {busy === 'accept' ? 'Accepting…' : 'Force accept'}
            </button>
          )}
          {canStart && (
            <button
              type="button"
              onClick={() =>
                run(
                  'start',
                  () => bookingService.start(booking.booking_id),
                  'Booking started',
                )
              }
              disabled={busy !== null}
              className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px] disabled:opacity-60"
            >
              {busy === 'start' ? 'Starting…' : 'Force start'}
            </button>
          )}
          {canComplete && (
            <button
              type="button"
              onClick={() =>
                run(
                  'complete',
                  () => bookingService.complete(booking.booking_id),
                  'Booking completed',
                )
              }
              disabled={busy !== null}
              className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px] disabled:opacity-60"
            >
              {busy === 'complete' ? 'Completing…' : 'Force complete (no OTP)'}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() =>
                run(
                  'cancel',
                  () => bookingService.cancel(booking.booking_id),
                  'Booking cancelled',
                )
              }
              disabled={busy !== null}
              className="btn-base btn-danger text-sm px-4 py-2 min-h-[44px] disabled:opacity-60"
            >
              {busy === 'cancel' ? 'Cancelling…' : 'Cancel booking'}
            </button>
          )}
          {!canAccept && !canStart && !canComplete && !canCancel && (
            <p className="text-xs text-muted">
              No overrides available for this state.
            </p>
          )}
        </div>
      </div>

      {/* Review */}
      {review && (
        <div className="glass-card p-5">
          <h2 className="font-brand text-base font-bold text-primary mb-2">
            Customer review
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

      {/* Timeline */}
      <div className="glass-card p-5">
        <h2 className="font-brand text-base font-bold text-primary mb-4">
          Activity
        </h2>
        <StatusTimeline events={events} />
      </div>
    </div>
  )
}
