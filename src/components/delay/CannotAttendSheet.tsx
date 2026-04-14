import { useState } from 'react'
import Modal from '../common/Modal'
import { DelayReasonPicker } from './DelayReasonPicker'
import { delayService } from '../../services/delayService'
import useStore from '../../store/useStore'
import type { DelayReason } from '../../types/delay'

interface CannotAttendSheetProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  onSuccess: () => void
}

export function CannotAttendSheet({ isOpen, onClose, bookingId, onSuccess }: CannotAttendSheetProps) {
  const showToast = useStore((s) => s.showToast)
  const [reason, setReason] = useState<DelayReason | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = reason !== null && note.trim().length > 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await delayService.reportDelay(bookingId, {
        delay_type: 'cannot_attend',
        reason,
        reason_note: note.trim(),
      })
      showToast('Reported — client and vendor will be notified', 'success')
      onSuccess()
      onClose()
    } catch {
      showToast('Failed to report. Please try again.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-5 space-y-5">
        <h2 className="font-brand text-lg font-bold text-primary">Cannot Attend</h2>
        <p className="text-sm text-muted -mt-3">
          The client will be notified and offered reschedule options.
        </p>
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Reason <span className="text-error">*</span>
          </p>
          <DelayReasonPicker delayType="cannot_attend" selected={reason} onSelect={setReason} />
        </div>
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Note <span className="text-error">*</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            className="input-base w-full px-3 py-2 text-sm"
            placeholder="Explain the situation..."
            aria-required="true"
          />
          {note.length === 0 && (
            <p className="text-xs text-muted mt-1">
              A note is required when reporting cannot attend
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-base btn-danger w-full py-3.5 text-sm font-bold min-h-[48px] disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Report Cannot Attend'}
        </button>
      </div>
    </Modal>
  )
}
