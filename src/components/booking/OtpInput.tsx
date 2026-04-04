import { useState, useRef, useEffect, useCallback, memo } from 'react'

interface OtpInputProps {
  length?: number
  onComplete: (code: string) => void
  onClear?: () => void
  disabled?: boolean
  error?: string
}

export const OtpInput = memo(function OtpInput({
  length = 6,
  onComplete,
  onClear,
  disabled = false,
  error,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
  const [shake, setShake] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first box on mount
  useEffect(() => {
    if (!disabled) refs.current[0]?.focus()
  }, [disabled])

  // Trigger shake on new error
  useEffect(() => {
    if (error) {
      setShake(true)
      const timer = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(timer)
    }
  }, [error])

  const clearAll = useCallback(() => {
    setDigits(Array(length).fill(''))
    refs.current[0]?.focus()
    onClear?.()
  }, [length, onClear])

  // Expose clearAll when error changes (parent signals wrong code)
  useEffect(() => {
    if (error) {
      setDigits(Array(length).fill(''))
      setTimeout(() => refs.current[0]?.focus(), 100)
    }
  }, [error, length])

  const handleChange = (idx: number, val: string) => {
    if (disabled) return
    // Handle paste of full code
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, '').slice(0, length)
      if (pasted.length > 0) {
        const next = Array(length).fill('')
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
        setDigits(next)
        const focusIdx = Math.min(pasted.length, length - 1)
        refs.current[focusIdx]?.focus()
        if (pasted.length === length) onComplete(pasted)
        return
      }
    }
    // Single digit
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = digit
    setDigits(next)
    if (digit && idx < length - 1) {
      refs.current[idx + 1]?.focus()
    }
    // Auto-submit when all filled
    if (digit && next.every(d => d !== '')) {
      onComplete(next.join(''))
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        const next = [...digits]
        next[idx - 1] = ''
        setDigits(next)
        refs.current[idx - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0) refs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < length - 1) refs.current[idx + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = Array(length).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    const focusIdx = Math.min(pasted.length, length - 1)
    refs.current[focusIdx]?.focus()
    if (pasted.length === length) onComplete(pasted)
  }

  return (
    <div>
      <div
        className={`flex justify-center gap-1.5 sm:gap-2 ${shake ? 'animate-shake' : ''}`}
        onPaste={handlePaste}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={disabled}
            className={`w-10 h-12 sm:w-12 sm:h-14 border-2 rounded-lg text-center text-lg sm:text-xl font-bold transition-colors focus:outline-none ${
              disabled
                ? 'border-gray-200 bg-gray-50 text-muted cursor-not-allowed'
                : error
                  ? 'border-red-400 bg-red-50'
                  : d
                    ? 'border-brand bg-brand-soft/20'
                    : 'border-gray-300 focus:border-brand'
            }`}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={!!error}
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-error text-center mt-2 fade-in" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {!error && !disabled && (
        <button
          type="button"
          onClick={clearAll}
          className="block mx-auto mt-2 text-xs text-muted hover:text-secondary transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
})
