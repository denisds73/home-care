import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { technicianService } from '../../services/technicianService'
import { StatusTimeline } from '../../components/bookings/StatusTimeline'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import { formatDate } from '../../data/helpers'
import useStore from '../../store/useStore'
import type {
  Booking,
  BookingStatusEvent,
  Technician,
} from '../../types/domain'
import { DelayBanner, RescheduleSheet } from '../../components/delay'
import { delayService } from '../../services/delayService'
import { rescheduleService } from '../../services/rescheduleService'
import type { DelayEvent, RescheduleRequest } from '../../types/delay'

type Action = 'accept' | 'reject' | 'start' | 'complete' | 'dispatch'

export default function VendorRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const showToast = useStore((s) => s.showToast)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [events, setEvents] = useState<BookingStatusEvent[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selectedTech, setSelectedTech] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<Action | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [activeDelay, setActiveDelay] = useState<DelayEvent | null>(null)
  const [rescheduleCount, setRescheduleCount] = useState(0)
  const [showRescheduleSheet, setShowRescheduleSheet] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const [b, ev, techs, delays, reschedules] = await Promise.all([
        bookingService.getById(id),
        bookingService.getEvents(id),
        technicianService.listMine().catch(() => []),
        delayService.getDelayEvents(id).catch(() => [] as DelayEvent[]),
        rescheduleService.getRequests(id).catch(() => [] as RescheduleRequest[]),
      ])
      setBooking(b)
      setEvents(ev)
      setTechnicians(techs)
      setActiveDelay(delays.find((d) => d.is_active) ?? null)
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

  const run = async (action: Action) => {
    if (!id) return
    setBusy(action)
    try {
      if (action === 'accept') await bookingService.accept(id)
      else if (action === 'reject') await bookingService.reject(id, rejectNote.trim() || undefined)
      else if (action === 'start') await bookingService.start(id)
      else if (action === 'complete') await bookingService.complete(id)
      showToast(`Request ${action}ed`, 'success')
      setShowReject(false)
      setRejectNote('')
      await load()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : `Failed to ${action}`,
        'danger',
      )
    } finally {
      setBusy(null)
    }
  }

  const handleDispatch = async () => {
    if (!id || !selectedTech) return
    setBusy('dispatch')
    try {
      await bookingService.assignTechnician(id, selectedTech)
      showToast('Technician dispatched', 'success')
      setSelectedTech('')
      await load()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to dispatch technician',
        'danger',
      )
    } finally {
      setBusy(null)
    }
  }

  const eligibleTechnicians = useMemo(() => {
    if (!booking) return [] as Technician[]
    const active = technicians.filter((t) => t.status === 'active')
    const matched = active.filter((t) =>
      t.skills.some((s) => String(s) === String(booking.category)),
    )
    return matched.length > 0 ? matched : active
  }, [technicians, booking])

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
        <Link to="/vendor/requests" className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
          Back to requests
        </Link>
      </div>
    )
  }

  const s = booking.booking_status
  const canAcceptReject = s === 'assigned'
  const canStart = s === 'accepted'
  const canComplete = s === 'in_progress'
  const showDispatch = s === 'accepted' || s === 'in_progress'
  const dispatchLocked = s === 'in_progress'

  return (
    <div className="fade-in space-y-5">
      <div>
        <Link to="/vendor/requests" className="text-xs text-muted hover:text-primary">
          ← Back to requests
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
            <p className="text-xs text-muted">{booking.phone}</p>
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
            <p className="text-muted text-xs">Price</p>
            <p className="font-brand font-bold text-brand">
              ₹{booking.price.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {canAcceptReject && (
            <>
              <button
                type="button"
                onClick={() => run('accept')}
                disabled={busy !== null}
                className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
              >
                {busy === 'accept' ? 'Accepting…' : 'Accept'}
              </button>
              <button
                type="button"
                onClick={() => setShowReject((v) => !v)}
                disabled={busy !== null}
                className="btn-base btn-danger text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
              >
                Reject
              </button>
            </>
          )}
          {canStart && (
            <button
              type="button"
              onClick={() => run('start')}
              disabled={busy !== null || !booking.technician_id}
              title={!booking.technician_id ? 'Dispatch a technician first' : undefined}
              className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
            >
              {busy === 'start' ? 'Starting…' : 'Start service'}
            </button>
          )}
          {canComplete && (
            <button
              type="button"
              onClick={() => run('complete')}
              disabled={busy !== null}
              className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
            >
              {busy === 'complete' ? 'Completing…' : 'Mark complete'}
            </button>
          )}
        </div>

        {showReject && (
          <div className="mt-4 space-y-2">
            <label htmlFor="reject-note" className="label-base">
              Reason for rejection (optional)
            </label>
            <textarea
              id="reject-note"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              maxLength={500}
              rows={3}
              className="input-base w-full px-3 py-2 text-sm"
              placeholder="Tell the customer/admin why you are rejecting…"
            />
            <button
              type="button"
              onClick={() => run('reject')}
              disabled={busy !== null}
              className="btn-base btn-danger text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
            >
              {busy === 'reject' ? 'Rejecting…' : 'Confirm rejection'}
            </button>
          </div>
        )}
      </div>

      {activeDelay && (
        <DelayBanner
          delay={activeDelay}
          role="vendor"
          onReschedule={() => setShowRescheduleSheet(true)}
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
        role="vendor"
        onSuccess={load}
      />

      {showDispatch && (
        <div className="glass-card p-5">
          <h2 className="font-brand text-base font-bold text-primary mb-1">
            Dispatch technician
          </h2>
          <p className="text-xs text-muted mb-4">
            {dispatchLocked
              ? 'Locked — job is already in progress.'
              : 'Pick a technician to send to the customer.'}
          </p>

          {assignedTechnician ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm text-secondary font-medium">
                  {assignedTechnician.full_name}
                </p>
                <p className="text-xs text-muted">{assignedTechnician.phone}</p>
              </div>
              {dispatchLocked && (
                <span className="badge badge-warning">Locked</span>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted mb-3">No technician assigned yet.</p>
          )}

          {!dispatchLocked && (
            <div className="mt-4 space-y-2">
              {eligibleTechnicians.length === 0 ? (
                <p className="text-xs text-muted">
                  No active technicians.{' '}
                  <Link to="/vendor/technicians/new" className="text-brand font-semibold">
                    Add one →
                  </Link>
                </p>
              ) : (
                <>
                  {technicians.length > 0 &&
                    eligibleTechnicians.length > 0 &&
                    !eligibleTechnicians.some((t) =>
                      t.skills.some(
                        (s) => String(s) === String(booking.category),
                      ),
                    ) && (
                      <p className="text-[11px] text-muted">
                        No exact skill match — showing all active technicians.
                      </p>
                    )}
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={selectedTech}
                      onChange={(e) => setSelectedTech(e.target.value)}
                      aria-label="Select technician"
                      className="input-base flex-1 min-w-[180px] px-3 py-2 text-sm"
                    >
                      <option value="">
                        {assignedTechnician ? 'Change to…' : 'Select technician…'}
                      </option>
                      {eligibleTechnicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleDispatch}
                      disabled={
                        busy !== null ||
                        !selectedTech ||
                        selectedTech === booking.technician_id
                      }
                      className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
                    >
                      {busy === 'dispatch' ? 'Dispatching…' : 'Dispatch'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-5">
        <h2 className="font-brand text-base font-bold text-primary mb-4">
          Activity
        </h2>
        <StatusTimeline events={events} />
      </div>
    </div>
  )
}
