import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { technicianService } from '../../services/technicianService'
import { delayService } from '../../services/delayService'
import { rescheduleService } from '../../services/rescheduleService'
import { StatusTimeline } from '../../components/bookings/StatusTimeline'
import { BookingInfoCard, DispatchSection } from '../../components/vendor'
import { DelayBanner, RescheduleSheet } from '../../components/delay'
import useStore from '../../store/useStore'
import type { Booking, BookingStatusEvent, Technician } from '../../types/domain'
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

  useEffect(() => { load() }, [load])

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
      showToast(err instanceof Error ? err.message : `Failed to ${action}`, 'danger')
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
      showToast(err instanceof Error ? err.message : 'Failed to dispatch technician', 'danger')
    } finally {
      setBusy(null)
    }
  }

  const eligibleTechnicians = useMemo(() => {
    if (!booking) return [] as Technician[]
    const active = technicians.filter((t) => t.status === 'active')
    const matched = active.filter((t) => t.skills.some((s) => String(s) === String(booking.category)))
    return matched.length > 0 ? matched : active
  }, [technicians, booking])

  const assignedTechnician = useMemo(
    () => booking?.technician_id ? technicians.find((t) => t.id === booking.technician_id) ?? null : null,
    [technicians, booking],
  )

  const noSkillMatch = useMemo(() => {
    if (!booking || technicians.length === 0 || eligibleTechnicians.length === 0) return false
    return !eligibleTechnicians.some((t) => t.skills.some((s) => String(s) === String(booking.category)))
  }, [booking, technicians, eligibleTechnicians])

  if (isLoading) {
    return (
      <div className="space-y-4 fade-in">
        <div className="glass-card no-hover p-6 animate-pulse">
          <div className="h-5 w-48 bg-surface rounded mb-3" />
          <div className="h-3 w-64 bg-surface rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i}><div className="h-3 w-16 bg-surface rounded mb-1" /><div className="h-4 w-36 bg-surface rounded" /></div>)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-error text-sm mb-3">{error ?? 'Booking not found'}</p>
        <Link to="/vendor/requests" className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">Back to requests</Link>
      </div>
    )
  }

  const s = booking.booking_status
  const showDispatch = s === 'accepted' || s === 'in_progress'
  const dispatchLocked = s === 'in_progress'

  return (
    <div className="fade-in space-y-5">
      <Link to="/vendor/requests" className="btn-base btn-ghost text-xs px-3 py-1.5 min-h-[36px] inline-flex items-center gap-1">
        ← Back to requests
      </Link>

      <BookingInfoCard
        booking={booking}
        busy={busy}
        onAction={run}
        onToggleReject={() => setShowReject((v) => !v)}
        showReject={showReject}
      />

      {showReject && (
        <div className="glass-card no-hover p-5 slide-up space-y-3">
          <label htmlFor="reject-note" className="label-base">Reason for rejection (optional)</label>
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

      {activeDelay && (
        <DelayBanner
          delay={activeDelay}
          role="vendor"
          onReschedule={() => setShowRescheduleSheet(true)}
          onReassign={() => {
            document.getElementById('dispatch-section')?.scrollIntoView({ behavior: 'smooth' })
            showToast('Use the dispatch section below to reassign', 'info')
          }}
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
        <DispatchSection
          booking={booking}
          eligibleTechnicians={eligibleTechnicians}
          assignedTechnician={assignedTechnician}
          selectedTech={selectedTech}
          onSelectTech={setSelectedTech}
          onDispatch={handleDispatch}
          busy={busy}
          dispatchLocked={dispatchLocked}
          noSkillMatch={noSkillMatch}
        />
      )}

      <div className="glass-card no-hover p-5 md:p-6 slide-up" style={{ animationDelay: '150ms' }}>
        <h2 className="font-brand text-sm font-bold text-primary uppercase tracking-wide mb-4">
          Activity
        </h2>
        <StatusTimeline events={events} />
      </div>
    </div>
  )
}
