import { useState } from 'react'
import Modal from '../common/Modal'
import { DelayReasonPicker } from './DelayReasonPicker'
import { RescheduleCounter } from './RescheduleCounter'
import { rescheduleService } from '../../services/rescheduleService'
import useStore from '../../store/useStore'
import type { DelayReason } from '../../types/delay'

interface RescheduleSheetProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  bookingName: string
  currentDate: string
  currentSlot: string
  rescheduleCount: number
  maxReschedules?: number
  role: 'customer' | 'vendor' | 'technician' | 'admin'
  onSuccess: () => void
}

const TIME_SLOTS = ['9AM-12PM', '12PM-3PM', '3PM-6PM']

const SLOT_LABELS: Record<string, { time: string; period: string }> = {
  '9AM-12PM': { time: 'Morning', period: '9:00 AM - 12:00 PM' },
  '12PM-3PM': { time: 'Afternoon', period: '12:00 PM - 3:00 PM' },
  '3PM-6PM': { time: 'Evening', period: '3:00 PM - 6:00 PM' },
}

function getTomorrowDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

  const dayDiff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
  if (dayDiff <= 7) {
    return d.toLocaleDateString('en-IN', { weekday: 'long' })
  }
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Customer-facing reschedule (simple, friendly) ─────────────────

function CustomerRescheduleView({
  bookingName,
  bookingId,
  rescheduleCount,
  maxReschedules,
  onClose,
  onSuccess,
}: {
  bookingName: string
  bookingId: string
  rescheduleCount: number
  maxReschedules: number
  onClose: () => void
  onSuccess: () => void
}) {
  const showToast = useStore((s) => s.showToast)
  const [date, setDate] = useState(getTomorrowDate())
  const [slot, setSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = date !== '' && slot !== '' && !submitting
  const isMaxed = rescheduleCount >= maxReschedules

  const handleSubmit = async () => {
    if (!canSubmit || isMaxed) return
    setSubmitting(true)
    try {
      await rescheduleService.propose(bookingId, {
        proposed_date: date,
        proposed_time_slot: slot,
      })
      showToast('Reschedule request sent', 'success')
      onSuccess()
      onClose()
    } catch {
      showToast('Failed to reschedule. Please try again.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="p-6 pb-0 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h2 className="font-brand text-lg font-bold text-primary">Pick a New Time</h2>
        <p className="text-sm text-muted mt-1">{bookingName}</p>
        <div className="mt-2">
          <RescheduleCounter current={rescheduleCount + 1} max={maxReschedules} />
        </div>
      </div>

      {isMaxed ? (
        <div className="p-6">
          <div className="bg-error-soft border border-error/20 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-error">Maximum reschedules reached</p>
            <p className="text-xs text-muted mt-1">This booking cannot be rescheduled further.</p>
          </div>
        </div>
      ) : (
        <div className="p-6 pt-5 space-y-5">
          {/* Date picker */}
          <div>
            <p className="text-sm font-semibold text-primary mb-2">When works for you?</p>
            <input
              type="date"
              value={date}
              min={getTomorrowDate()}
              onChange={(e) => setDate(e.target.value)}
              className="input-base w-full px-3 py-2.5 text-sm font-medium min-h-[44px]"
              aria-label="New date"
            />
            {date && (
              <p className="text-xs text-brand font-semibold mt-1.5">{formatDateDisplay(date)}</p>
            )}
          </div>

          {/* Time slot picker — card-style for customer */}
          <div>
            <p className="text-sm font-semibold text-primary mb-2">Preferred time</p>
            <div className="space-y-2">
              {TIME_SLOTS.map((s) => {
                const label = SLOT_LABELS[s]
                const selected = slot === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] transition-all min-h-[52px] ${
                      selected
                        ? 'border-brand bg-brand-soft ring-brand'
                        : 'border-border bg-card hover:border-text-muted hover:bg-surface'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'border-brand' : 'border-border'
                    }`}>
                      {selected && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${selected ? 'text-brand-dark' : 'text-primary'}`}>
                        {label?.time ?? s}
                      </p>
                      <p className="text-xs text-muted">{label?.period ?? s}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-base btn-primary w-full py-3.5 text-sm font-bold min-h-[48px] disabled:opacity-60"
          >
            {submitting ? 'Requesting...' : 'Request Reschedule'}
          </button>

          <p className="text-[0.7rem] text-muted text-center leading-relaxed">
            Your vendor will be notified and needs to confirm the new time.
          </p>
        </div>
      )}
    </>
  )
}

// ─── Vendor/Admin/Technician operational reschedule ────────────────

function OperationalRescheduleView({
  bookingName,
  bookingId,
  rescheduleCount,
  maxReschedules,
  role,
  onClose,
  onSuccess,
}: {
  bookingName: string
  bookingId: string
  rescheduleCount: number
  maxReschedules: number
  role: 'vendor' | 'technician' | 'admin'
  onClose: () => void
  onSuccess: () => void
}) {
  const showToast = useStore((s) => s.showToast)
  const [date, setDate] = useState(getTomorrowDate())
  const [slot, setSlot] = useState('')
  const [reason, setReason] = useState<DelayReason | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = date !== '' && slot !== '' && !submitting
  const isMaxed = rescheduleCount >= maxReschedules

  const handleSubmit = async () => {
    if (!canSubmit || isMaxed) return
    setSubmitting(true)
    try {
      await rescheduleService.propose(bookingId, {
        proposed_date: date,
        proposed_time_slot: slot,
        reason: reason ?? undefined,
        reason_note: note.trim() || undefined,
      })
      const msg = role === 'admin' ? 'Reschedule sent to client' : 'Reschedule proposed to client'
      showToast(msg, 'success')
      onSuccess()
      onClose()
    } catch {
      showToast('Failed to propose reschedule. Please try again.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-brand text-lg font-bold text-primary">Reschedule Booking</h2>
          <p className="text-sm text-muted mt-0.5">{bookingName} — #{bookingId.slice(0, 8)}</p>
        </div>
        <RescheduleCounter current={rescheduleCount + 1} max={maxReschedules} />
      </div>

      {isMaxed ? (
        <div className="bg-error-soft border border-error/20 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-error">Maximum reschedules reached</p>
          <p className="text-xs text-muted mt-1">This booking cannot be rescheduled further.</p>
        </div>
      ) : (
        <>
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
              New Date <span className="text-error">*</span>
            </p>
            <input
              type="date"
              value={date}
              min={getTomorrowDate()}
              onChange={(e) => setDate(e.target.value)}
              className="input-base w-full px-3 py-2.5 text-sm font-medium min-h-[44px]"
              aria-label="New date"
            />
          </div>

          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
              Time Slot <span className="text-error">*</span>
            </p>
            <div className="flex gap-2">
              {TIME_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`flex-1 py-2.5 rounded-xl text-[0.78rem] font-semibold border-[1.5px] transition-all min-h-[44px] ${
                    slot === s
                      ? 'border-brand bg-brand-soft text-brand-dark ring-brand'
                      : 'border-border bg-card text-text-secondary hover:border-text-muted hover:bg-surface'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">Reason</p>
            <DelayReasonPicker delayType="reschedule" selected={reason} onSelect={setReason} />
          </div>

          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
              Note{' '}
              <span className="text-xs font-normal normal-case tracking-normal text-muted">(optional)</span>
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              className="input-base w-full px-3 py-2 text-sm"
              placeholder="Reason for rescheduling..."
            />
          </div>

          <div className="bg-accent-soft border border-[#D4A017]/20 rounded-xl px-3.5 py-3 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-accent-strong shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-[0.78rem] text-[#92400E] leading-relaxed">
              {role === 'admin'
                ? 'The client will have 24 hours to reject this reschedule.'
                : 'The client will be notified and must accept this new time.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-base btn-primary w-full py-3.5 text-sm font-bold min-h-[48px] disabled:opacity-60"
          >
            {submitting
              ? 'Submitting...'
              : role === 'admin'
                ? 'Reschedule Booking'
                : 'Propose Reschedule'}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Main component (delegates by role) ────────────────────────────

export function RescheduleSheet({
  isOpen,
  onClose,
  bookingId,
  bookingName,
  currentDate: _currentDate,
  currentSlot: _currentSlot,
  rescheduleCount,
  maxReschedules = 3,
  role,
  onSuccess,
}: RescheduleSheetProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {role === 'customer' ? (
        <CustomerRescheduleView
          bookingName={bookingName}
          bookingId={bookingId}
          rescheduleCount={rescheduleCount}
          maxReschedules={maxReschedules}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : (
        <OperationalRescheduleView
          bookingName={bookingName}
          bookingId={bookingId}
          rescheduleCount={rescheduleCount}
          maxReschedules={maxReschedules}
          role={role}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  )
}
