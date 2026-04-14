import Modal from '../common/Modal'
import type { DelayEvent, RescheduleRequest } from '../../types/delay'
import { getReasonLabel } from '../../utils/delayReasons'
import { formatDate } from '../../data/helpers'

interface CannotAttendProps {
  mode: 'cannot_attend'
  isOpen: boolean
  onClose: () => void
  delay: DelayEvent
  bookingName: string
  bookingId: string
  onReschedule: () => void
  onRequestDifferentTech: () => void
  onCancel: () => void
}

interface RescheduleProposedProps {
  mode: 'reschedule_proposed'
  isOpen: boolean
  onClose: () => void
  reschedule: RescheduleRequest
  bookingName: string
  bookingId: string
  onAccept: () => void
  onSuggestDifferent: () => void
  onCancel: () => void
}

type CriticalDelayModalProps = CannotAttendProps | RescheduleProposedProps

export function CriticalDelayModal(props: CriticalDelayModalProps) {
  const { isOpen, onClose, bookingName, bookingId } = props

  if (props.mode === 'reschedule_proposed') {
    const { reschedule, onAccept, onSuggestDifferent, onCancel } = props
    const displayDate = reschedule.counter_date ?? reschedule.proposed_date
    const displaySlot = reschedule.counter_time_slot ?? reschedule.proposed_time_slot

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-6 text-center">
          <div className="w-[52px] h-[52px] rounded-[14px] bg-brand-soft flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-6 h-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2 className="font-brand text-lg font-bold text-primary">
            {reschedule.status === 'counter_proposed' ? 'Counter-Proposal' : 'Reschedule Proposed'}
          </h2>
          <p className="text-sm text-muted mt-1">{bookingName} — #{bookingId.slice(0, 8)}</p>
        </div>

        <div className="mx-5 mb-5 bg-surface border border-border rounded-[14px] p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex-1">
              <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted mb-1">Original</p>
              <p className="text-sm text-muted line-through tabular-nums">
                {formatDate(reschedule.original_date)} &middot; {reschedule.original_time_slot}
              </p>
            </div>
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <div className="flex-1 text-right">
              <p className="text-[0.6rem] font-bold uppercase tracking-wider text-brand mb-1">Proposed</p>
              <p className="text-sm font-bold text-brand tabular-nums">
                {formatDate(displayDate)} &middot; {displaySlot}
              </p>
            </div>
          </div>

          {reschedule.reason_note && (
            <>
              <div className="h-px bg-border my-3" />
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted mb-1">Reason</p>
              <p className="text-sm text-secondary italic leading-relaxed">"{reschedule.reason_note}"</p>
            </>
          )}
        </div>

        <div className="px-5 pb-6 space-y-2">
          <button type="button" onClick={onAccept}
            className="btn-base btn-primary w-full py-3.5 text-sm font-bold min-h-[48px]">
            Accept New Time
          </button>
          <button type="button" onClick={onSuggestDifferent}
            className="btn-base btn-secondary w-full py-3.5 text-sm font-bold min-h-[48px]">
            Suggest Different Time
          </button>
          <button type="button" onClick={onCancel}
            className="btn-base w-full py-3 text-[0.82rem] font-semibold text-error hover:bg-error-soft min-h-[44px]">
            Cancel Booking
          </button>
        </div>
      </Modal>
    )
  }

  // cannot_attend mode (original)
  const { delay, onReschedule, onRequestDifferentTech, onCancel } = props as CannotAttendProps

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-[52px] h-[52px] rounded-[14px] bg-error-soft flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg className="w-6 h-6 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="font-brand text-lg font-bold text-primary">Technician Cannot Attend</h2>
        <p className="text-sm text-muted mt-1">{bookingName} — #{bookingId.slice(0, 8)}</p>
      </div>

      <div className="mx-5 mb-5 bg-surface border border-border rounded-[14px] p-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted mb-1">Reason</p>
        <p className="text-sm text-primary font-medium">{getReasonLabel(delay.reason)}</p>
        {delay.reason_note && (
          <>
            <div className="h-px bg-border my-3" />
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted mb-1">Note from technician</p>
            <p className="text-sm text-secondary italic leading-relaxed">"{delay.reason_note}"</p>
          </>
        )}
      </div>

      <div className="px-5 pb-6 space-y-2">
        <button type="button" onClick={onReschedule}
          className="btn-base btn-primary w-full py-3.5 text-sm font-bold min-h-[48px]">
          Reschedule Booking
        </button>
        <button type="button" onClick={onRequestDifferentTech}
          className="btn-base btn-secondary w-full py-3.5 text-sm font-bold min-h-[48px]">
          Request Different Technician
        </button>
        <button type="button" onClick={onCancel}
          className="btn-base w-full py-3 text-[0.82rem] font-semibold text-error hover:bg-error-soft min-h-[44px]">
          Cancel Booking
        </button>
      </div>
    </Modal>
  )
}
