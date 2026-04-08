import { memo, useEffect, useRef, useState } from 'react'
import Modal from '../common/Modal'
import { otpService } from '../../services/otpService'
import useStore from '../../store/useStore'
import { ResendTimer } from '../booking/ResendTimer'

interface PhoneVerifyModalProps {
  isOpen: boolean
  phone: string
  onClose: () => void
  onVerified: (phone: string) => void
}

const OTP_LENGTH = 6

export const PhoneVerifyModal = memo(
  ({ isOpen, phone, onClose, onVerified }: PhoneVerifyModalProps) => {
    const showToast = useStore((s) => s.showToast)
    const [digits, setDigits] = useState<string[]>(() =>
      Array(OTP_LENGTH).fill(''),
    )
    const [sending, setSending] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState('')
    const inputsRef = useRef<Array<HTMLInputElement | null>>([])
    const sentRef = useRef(false)

    useEffect(() => {
      if (!isOpen) {
        setDigits(Array(OTP_LENGTH).fill(''))
        setError('')
        sentRef.current = false
        return
      }
      if (sentRef.current) return
      sentRef.current = true
      void sendCode()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const sendCode = async () => {
      setSending(true)
      setError('')
      try {
        await otpService.sendOtp(phone)
        showToast('Verification code sent', 'success')
      } catch (err) {
        if (import.meta.env.DEV) {
          showToast(
            'DEV: backend OTP unavailable, accepting any 6-digit code',
            'warning',
          )
        } else {
          const message =
            err instanceof Error ? err.message : 'Failed to send code'
          setError(message)
        }
      } finally {
        setSending(false)
      }
    }

    const handleResend = async () => {
      setDigits(Array(OTP_LENGTH).fill(''))
      await sendCode()
    }

    const handleChange = (index: number, value: string) => {
      const clean = value.replace(/\D/g, '')
      if (!clean) {
        setDigits((prev) => {
          const next = [...prev]
          next[index] = ''
          return next
        })
        return
      }
      // Paste handling: distribute characters
      if (clean.length > 1) {
        const chars = clean.slice(0, OTP_LENGTH - index).split('')
        setDigits((prev) => {
          const next = [...prev]
          chars.forEach((c, i) => {
            next[index + i] = c
          })
          return next
        })
        const nextFocus = Math.min(index + chars.length, OTP_LENGTH - 1)
        inputsRef.current[nextFocus]?.focus()
        return
      }
      setDigits((prev) => {
        const next = [...prev]
        next[index] = clean
        return next
      })
      if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus()
    }

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus()
      }
    }

    const code = digits.join('')
    const canVerify = code.length === OTP_LENGTH && !verifying && !sending

    const handleVerify = async () => {
      if (!canVerify) return
      setVerifying(true)
      setError('')
      try {
        await otpService.verifyOtp(phone, code)
        showToast('Phone verified', 'success')
        onVerified(phone)
      } catch (err) {
        if (import.meta.env.DEV) {
          // Dev fallback: accept any 6-digit code
          showToast('DEV: accepting code without backend', 'warning')
          onVerified(phone)
          return
        }
        const message = err instanceof Error ? err.message : 'Invalid code'
        setError(message)
      } finally {
        setVerifying(false)
      }
    }

    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
        <div className="p-6 md:p-8">
          <h2 className="font-brand text-2xl font-bold text-primary">
            Verify your number
          </h2>
          <p className="text-sm text-secondary mt-1">
            We sent a 6-digit code to{' '}
            <span className="font-semibold text-primary">+91 {phone}</span>
          </p>

          <div className="mt-6 flex items-center justify-between gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={OTP_LENGTH}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                aria-label={`Digit ${i + 1}`}
                className={`input-base w-11 h-12 md:w-12 md:h-14 text-center text-lg font-bold tabular-nums ${
                  error ? 'field-invalid' : ''
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-error mt-3 fade-in" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={!canVerify}
            className="btn-base btn-primary w-full mt-6 min-h-[48px]"
          >
            {verifying ? 'Verifying…' : 'Verify'}
          </button>

          <ResendTimer onResend={handleResend} durationSeconds={30} maxResends={3} />

          <button
            type="button"
            onClick={onClose}
            className="block mx-auto mt-2 text-xs text-muted hover:text-secondary transition-colors min-h-[32px]"
          >
            Cancel
          </button>
        </div>
      </Modal>
    )
  },
)

PhoneVerifyModal.displayName = 'PhoneVerifyModal'
