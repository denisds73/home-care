import { useState, useEffect, useCallback, memo } from 'react'

interface ResendTimerProps {
  durationSeconds?: number
  onResend: () => void
  maxResends?: number
}

export const ResendTimer = memo(function ResendTimer({
  durationSeconds = 30,
  onResend,
  maxResends = 3,
}: ResendTimerProps) {
  const [timer, setTimer] = useState(durationSeconds)
  const [resendCount, setResendCount] = useState(0)
  const maxReached = resendCount >= maxResends
  const canResend = timer === 0 && !maxReached

  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleResend = useCallback(() => {
    if (!canResend) return
    setResendCount(c => c + 1)
    setTimer(durationSeconds)
    onResend()
  }, [canResend, durationSeconds, onResend])

  const mm = String(Math.floor(timer / 60)).padStart(2, '0')
  const ss = String(timer % 60).padStart(2, '0')

  if (maxReached) {
    return (
      <p className="text-xs text-error text-center mt-3">
        Maximum resend attempts reached. Please try again later.
      </p>
    )
  }

  return (
    <div className="text-center mt-3">
      {timer > 0 ? (
        <p className="text-sm">
          <span className="text-muted">Resend in </span>
          <span className={`font-mono font-bold ${timer <= 10 ? 'text-error' : 'text-brand'}`}>
            {mm}:{ss}
          </span>
        </p>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          className="text-sm text-brand font-semibold hover:text-brand-dark transition-colors"
        >
          Resend code
        </button>
      )}
      <p className="text-xs text-muted mt-1">
        {maxResends - resendCount} resend{maxResends - resendCount !== 1 ? 's' : ''} remaining
      </p>
    </div>
  )
})
