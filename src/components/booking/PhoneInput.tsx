import { useState, memo } from 'react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onValidChange: (isValid: boolean) => void
  disabled?: boolean
  error?: string
}

function stripNonDigits(s: string): string {
  return s.replace(/\D/g, '')
}

function formatPreview(digits: string): string {
  if (!digits) return ''
  const d = digits.slice(0, 10)
  if (d.length <= 5) return `+91 ${d}`
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`
}

function validate(digits: string): string | null {
  if (!digits) return 'Mobile number is required'
  if (/\D/.test(digits)) return 'Only digits are allowed'
  if (digits.length !== 10) return 'Enter a valid 10-digit mobile number'
  if (!/^[6-9]/.test(digits)) return 'Enter a valid 10-digit mobile number'
  return null
}

export const PhoneInput = memo(function PhoneInput({
  value,
  onChange,
  onValidChange,
  disabled = false,
  error: externalError,
}: PhoneInputProps) {
  const [touched, setTouched] = useState(false)
  const digits = stripNonDigits(value)
  const validationError = validate(digits)
  const isValid = validationError === null
  const showError = touched && !isValid && validationError
  const displayError = externalError || (showError ? validationError : null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = stripNonDigits(e.target.value).slice(0, 10)
    onChange(raw)
    onValidChange(validate(raw) === null)
    if (touched && validate(raw) === null) {
      setTouched(false)
    }
  }

  const handleBlur = () => {
    setTouched(true)
  }

  return (
    <div>
      <label htmlFor="phone-input" className="block text-sm font-medium text-secondary mb-1">
        Phone Number <span className="text-error">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted select-none text-sm font-medium" aria-hidden="true">
          +91
        </span>
        <input
          id="phone-input"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={digits}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="XXXXX XXXXX"
          className={`input-base w-full pl-12 pr-4 py-2.5 text-sm ${displayError ? 'border-red-400 ring-2 ring-red-100' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          autoComplete="tel-national"
          aria-describedby={displayError ? 'phone-error' : undefined}
          aria-invalid={!!displayError}
        />
      </div>
      {digits.length > 0 && !displayError && (
        <p className="text-xs text-muted mt-1">{formatPreview(digits)}</p>
      )}
      {displayError && (
        <p id="phone-error" className="text-xs text-error mt-1 fade-in" role="alert" aria-live="polite">
          {displayError}
        </p>
      )}
      {!displayError && !digits && (
        <p className="text-xs text-muted mt-1">Enter 10-digit mobile number</p>
      )}
    </div>
  )
})
