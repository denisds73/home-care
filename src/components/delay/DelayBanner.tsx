import { memo, useMemo } from 'react'
import type { DelayEvent } from '../../types/delay'
import { getReasonLabel } from '../../utils/delayReasons'

interface DelayBannerProps {
  delay: DelayEvent
  role: 'customer' | 'vendor' | 'technician' | 'admin'
  onAcceptEta?: () => void
  onReschedule?: () => void
  onCancel?: () => void
  onReassign?: () => void
}

function formatTime(iso: string | null): string {
  if (!iso) return '--'
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return iso
  }
}

function timeAgo(iso: string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff} min ago`
  const hrs = Math.floor(diff / 60)
  return `${hrs}h ${diff % 60}m ago`
}

export const DelayBanner = memo(
  ({ delay, role, onAcceptEta, onReschedule, onCancel, onReassign }: DelayBannerProps) => {
    const isCannotAttend = delay.delay_type === 'cannot_attend'
    const gradientClass = isCannotAttend
      ? 'from-error to-error/50'
      : 'from-warning to-accent-strong/50'
    const iconColor = isCannotAttend ? 'text-error' : 'text-warning'
    const titleColor = isCannotAttend ? 'text-[#991B1B]' : 'text-[#92400E]'
    const iconBg = isCannotAttend ? 'bg-error-soft' : 'bg-accent-soft'
    const ago = useMemo(() => timeAgo(delay.created_at), [delay.created_at])

    return (
      <div className="relative glass-card no-hover overflow-hidden" role="alert">
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradientClass}`}
          style={{ maskImage: 'linear-gradient(to right, black 80%, transparent)' }}
        />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}
            >
              {isCannotAttend ? (
                <svg
                  className={`w-[18px] h-[18px] ${iconColor}`}
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
              ) : (
                <svg
                  className={`w-[18px] h-[18px] ${iconColor}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-brand text-sm font-bold ${titleColor}`}>
                {isCannotAttend ? 'Technician Cannot Attend' : 'Technician Running Late'}
              </p>
              <p className="text-[0.8rem] text-secondary mt-0.5">
                {getReasonLabel(delay.reason)}
                {delay.reason_note ? ` — ${delay.reason_note}` : ''}
              </p>
              {!isCannotAttend && delay.revised_eta && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-surface border border-border rounded-[10px] text-xs">
                  <span className="line-through text-muted tabular-nums">
                    {formatTime(delay.original_eta)}
                  </span>
                  <span className="text-border">&rarr;</span>
                  <span className="font-extrabold text-warning tabular-nums text-sm">
                    {formatTime(delay.revised_eta)}
                  </span>
                </div>
              )}
              <p className="text-[0.65rem] text-muted mt-2 tracking-wide">
                Reported {ago} by {delay.reported_by_role}
              </p>
              {(role === 'vendor' || role === 'admin') && delay.client_response && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[0.7rem] text-muted">Client:</span>
                  <span
                    className={`badge text-[0.65rem] ${
                      delay.client_response === 'accepted'
                        ? 'badge-success'
                        : delay.client_response === 'cancelled'
                          ? 'badge-cancelled'
                          : 'badge-warning'
                    }`}
                  >
                    {delay.client_response === 'pending' ? 'Awaiting' : delay.client_response}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-border">
            {role === 'customer' && !isCannotAttend && onAcceptEta && (
              <button
                type="button"
                onClick={onAcceptEta}
                className="btn-base flex-1 py-2.5 text-[0.8rem] font-bold bg-[#D97706] text-white hover:bg-[#B45309] active:scale-[0.97] transition-all min-h-[44px]"
              >
                Accept ETA
              </button>
            )}
            {role === 'customer' && onReschedule && (
              <button
                type="button"
                onClick={onReschedule}
                className="btn-base btn-secondary flex-1 py-2.5 text-[0.8rem] font-bold min-h-[44px]"
              >
                Reschedule
              </button>
            )}
            {role === 'customer' && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn-base py-2.5 text-[0.8rem] font-semibold text-error hover:bg-error-soft min-h-[44px] px-4"
              >
                Cancel
              </button>
            )}
            {(role === 'vendor' || role === 'admin') && onReassign && (
              <button
                type="button"
                onClick={onReassign}
                className="btn-base btn-primary flex-1 py-2.5 text-[0.8rem] font-bold min-h-[44px]"
              >
                Reassign Technician
              </button>
            )}
            {(role === 'vendor' || role === 'admin') && onReschedule && (
              <button
                type="button"
                onClick={onReschedule}
                className="btn-base btn-secondary flex-1 py-2.5 text-[0.8rem] font-bold min-h-[44px]"
              >
                Reschedule
              </button>
            )}
          </div>
        </div>
      </div>
    )
  },
)

DelayBanner.displayName = 'DelayBanner'
