import { useState, useCallback, memo } from 'react'
import { PhoneInput } from './PhoneInput'
import { OtpInput } from './OtpInput'
import { ResendTimer } from './ResendTimer'

type Phase = 'phone' | 'otp' | 'verified'

interface PhoneVerificationFlowProps {
  phone: string
  onPhoneChange: (phone: string) => void
  onVerified: () => void
}

const DEMO_OTP = '123456'
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN = 30

function maskPhone(phone: string): string {
  if (phone.length < 4) return phone
  return '••••••' + phone.slice(-4)
}

export const PhoneVerificationFlow = memo(function PhoneVerificationFlow({
  phone,
  onPhoneChange,
  onVerified,
}: PhoneVerificationFlowProps) {
  const [phase, setPhase] = useState<Phase>('phone')
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS)
  const [resendKey, setResendKey] = useState(0)
  const locked = attemptsLeft <= 0

  const handleSendOtp = useCallback(async () => {
    setSendError(null)
    setSending(true)
    try {
      // TODO: Replace with real API call: POST /api/otp/send { phone }
      // For now, simulate a 1s network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Simulate success
      setPhase('otp')
      setAttemptsLeft(MAX_ATTEMPTS)
      setOtpError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('rate')) {
        setSendError('Too many attempts. Try again in a few minutes.')
      } else if (message.includes('invalid')) {
        setSendError("This number isn't valid. Check and try again.")
      } else {
        setSendError("Couldn't send the code — check your connection and try again.")
      }
    } finally {
      setSending(false)
    }
  }, [])

  const handleVerifyOtp = useCallback(async (code: string) => {
    if (locked) return
    setOtpError(null)
    setVerifying(true)
    try {
      // TODO: Replace with real API call: POST /api/otp/verify { phone, code }
      // For now, simulate with demo OTP
      await new Promise(resolve => setTimeout(resolve, 800))
      if (code !== DEMO_OTP) {
        const remaining = attemptsLeft - 1
        setAttemptsLeft(remaining)
        if (remaining <= 0) {
          setOtpError('Too many incorrect attempts. Request a new code.')
        } else {
          setOtpError(`Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`)
        }
        setVerifying(false)
        return
      }
      // Success
      setPhase('verified')
      setVerifying(false)
      // Brief success delay before proceeding
      setTimeout(() => onVerified(), 600)
    } catch {
      setOtpError("Couldn't verify — check your connection and try again.")
      setVerifying(false)
    }
  }, [attemptsLeft, locked, onVerified])

  const handleResend = useCallback(() => {
    setOtpError(null)
    setAttemptsLeft(MAX_ATTEMPTS)
    setResendKey(k => k + 1)
    // Simulate resend
    // TODO: Replace with real API call: POST /api/otp/send { phone }
  }, [])

  const handleChangeNumber = useCallback(() => {
    setPhase('phone')
    setSendError(null)
    setOtpError(null)
    setAttemptsLeft(MAX_ATTEMPTS)
  }, [])

  // Phase: Phone input
  if (phase === 'phone') {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 slide-up">
        <h3 className="text-xl font-bold mb-1 text-primary">Verify Phone Number</h3>
        <p className="text-secondary text-sm mb-6">
          We&apos;ll send a 6-digit verification code to confirm your number
        </p>

        <PhoneInput
          value={phone}
          onChange={onPhoneChange}
          onValidChange={setIsPhoneValid}
          disabled={sending}
          error={sendError ?? undefined}
        />

        <button
          type="button"
          onClick={handleSendOtp}
          disabled={!isPhoneValid || sending}
          className="btn-base btn-primary w-full py-3 font-semibold text-sm mt-5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending…
            </>
          ) : (
            'Send Verification Code'
          )}
        </button>
      </div>
    )
  }

  // Phase: OTP verification
  if (phase === 'otp') {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 slide-up">
        <h3 className="text-xl font-bold mb-1 text-primary">Enter Verification Code</h3>
        <p className="text-secondary text-sm mb-1">
          We sent a 6-digit code to <span className="font-semibold text-primary">{maskPhone(phone)}</span>
        </p>
        <button
          type="button"
          onClick={handleChangeNumber}
          className="text-xs text-brand font-semibold hover:text-brand-dark transition-colors mb-6"
        >
          Change number
        </button>

        {/* Demo hint */}
        <div className="flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs bg-muted text-brand">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Demo Mode — OTP is <strong>{DEMO_OTP}</strong></span>
        </div>

        <OtpInput
          onComplete={handleVerifyOtp}
          disabled={verifying || locked}
          error={otpError ?? undefined}
        />

        {/* Verify button as accessible fallback */}
        {!verifying && !locked && (
          <button
            type="button"
            onClick={() => {
              // The OTP input auto-submits, but this is a fallback
              const inputs = document.querySelectorAll<HTMLInputElement>('[aria-label^="Digit"]')
              const code = Array.from(inputs).map(i => i.value).join('')
              if (code.length === 6) handleVerifyOtp(code)
            }}
            className="btn-base btn-primary w-full py-3 font-semibold text-sm mt-4"
          >
            Verify Code
          </button>
        )}

        {verifying && (
          <div className="flex items-center justify-center gap-2 mt-4 py-3">
            <span className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-secondary font-medium">Verifying…</span>
          </div>
        )}

        <ResendTimer
          key={resendKey}
          durationSeconds={RESEND_COOLDOWN}
          onResend={handleResend}
          maxResends={3}
        />
      </div>
    )
  }

  // Phase: Verified (brief success)
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 slide-up text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-100 scale-in">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-primary mb-1">Phone Verified</h3>
      <p className="text-sm text-secondary">Proceeding to payment…</p>
    </div>
  )
})
