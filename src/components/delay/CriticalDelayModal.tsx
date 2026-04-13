import Modal from '../common/Modal'
import type { DelayEvent } from '../../types/delay'
import { getReasonLabel } from '../../utils/delayReasons'

interface CriticalDelayModalProps {
  isOpen: boolean
  onClose: () => void
  delay: DelayEvent
  bookingName: string
  bookingId: string
  onReschedule: () => void
  onRequestDifferentTech: () => void
  onCancel: () => void
}

export function CriticalDelayModal({
  isOpen,
  onClose,
  delay,
  bookingName,
  bookingId,
  onReschedule,
  onRequestDifferentTech,
  onCancel,
}: CriticalDelayModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-[52px] h-[52px] rounded-[14px] bg-error-soft flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg
            className="w-6 h-6 text-error"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="font-brand text-lg font-bold text-primary">Technician Cannot Attend</h2>
        <p className="text-sm text-muted mt-1">
          {bookingName} — #{bookingId}
        </p>
      </div>
      <div className="mx-5 mb-5 bg-surface border border-border rounded-[14px] p-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted mb-1">Reason</p>
        <p className="text-sm text-primary font-medium">{getReasonLabel(delay.reason)}</p>
        {delay.reason_note && (
          <>
            <div className="h-px bg-border my-3" />
            <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted mb-1">
              Note from technician
            </p>
            <p className="text-sm text-secondary italic leading-relaxed">
              "{delay.reason_note}"
            </p>
          </>
        )}
      </div>
      <div className="px-5 pb-6 space-y-2">
        <button
          type="button"
          onClick={onReschedule}
          className="btn-base btn-primary w-full py-3.5 text-sm font-bold min-h-[48px]"
        >
          Reschedule Booking
        </button>
        <button
          type="button"
          onClick={onRequestDifferentTech}
          className="btn-base btn-secondary w-full py-3.5 text-sm font-bold min-h-[48px]"
        >
          Request Different Technician
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-base w-full py-3 text-[0.82rem] font-semibold text-error hover:bg-error-soft min-h-[44px]"
        >
          Cancel Booking
        </button>
      </div>
    </Modal>
  )
}
