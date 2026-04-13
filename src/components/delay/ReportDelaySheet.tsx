import { useState } from 'react'
import Modal from '../common/Modal'
import { DelayReasonPicker } from './DelayReasonPicker'
import { RevisedEtaPicker } from './RevisedEtaPicker'
import { delayService } from '../../services/delayService'
import useStore from '../../store/useStore'
import type { DelayReason } from '../../types/delay'

interface ReportDelaySheetProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  onSuccess: () => void
}

export function ReportDelaySheet({ isOpen, onClose, bookingId, onSuccess }: ReportDelaySheetProps) {
  const showToast = useStore((s) => s.showToast)
  const [reason, setReason] = useState<DelayReason | null>(null)
  const [eta, setEta] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = reason !== null && eta !== '' && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await delayService.reportDelay(bookingId, {
        delay_type: 'running_late',
        reason,
        revised_eta: eta,
        reason_note: note.trim() || undefined,
      })
      showToast('Delay reported — client will be notified', 'success')
      onSuccess()
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to report delay', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-5 space-y-5">
        <h2 className="font-brand text-lg font-bold text-primary">Report Delay</h2>
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Reason <span className="text-error">*</span>
          </p>
          <DelayReasonPicker delayType="running_late" selected={reason} onSelect={setReason} />
        </div>
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Revised ETA <span className="text-error">*</span>
          </p>
          <RevisedEtaPicker value={eta} onChange={setEta} />
        </div>
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted mb-2">
            Note{' '}
            <span className="text-xs font-normal normal-case tracking-normal text-muted">
              (optional)
            </span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={2}
            className="input-base w-full px-3 py-2 text-sm"
            placeholder="Additional context for the client..."
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-base w-full py-3.5 text-sm font-bold min-h-[48px] disabled:opacity-60 bg-warning text-white hover:bg-accent-strong"
        >
          {submitting ? 'Submitting...' : 'Submit Delay Report'}
        </button>
      </div>
    </Modal>
  )
}
