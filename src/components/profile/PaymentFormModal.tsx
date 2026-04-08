import { memo, useState } from 'react'
import Modal from '../common/Modal'
import type {
  PaymentBrand,
  PaymentMethod,
  PaymentMethodType,
} from '../../types/domain'

interface PaymentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: Omit<PaymentMethod, 'id'>) => void
}

const detectBrand = (digits: string): PaymentBrand | undefined => {
  if (!digits) return undefined
  const first = digits[0]
  if (first === '4') return 'visa'
  if (first === '5') return 'mastercard'
  if (first === '6') return 'rupay'
  if (first === '3') return 'amex'
  return undefined
}

const UPI_RE = /^[\w.-]+@[\w]+$/

export const PaymentFormModal = memo(
  ({ isOpen, onClose, onSubmit }: PaymentFormModalProps) => {
    const [tab, setTab] = useState<PaymentMethodType>('card')

    const [cardholder, setCardholder] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')
    const [cardLabel, setCardLabel] = useState('')

    const [upiId, setUpiId] = useState('')
    const [upiLabel, setUpiLabel] = useState('')

    const [touched, setTouched] = useState(false)
    const [isDefault, setIsDefault] = useState(false)
    const [wasOpen, setWasOpen] = useState(false)

    if (isOpen && !wasOpen) {
      setWasOpen(true)
      setTab('card')
      setCardholder('')
      setCardNumber('')
      setExpiry('')
      setCvv('')
      setCardLabel('')
      setUpiId('')
      setUpiLabel('')
      setTouched(false)
      setIsDefault(false)
    } else if (!isOpen && wasOpen) {
      setWasOpen(false)
    }

    const cardDigits = cardNumber.replace(/\s+/g, '')
    const cardErrors = {
      cardholder: cardholder.trim().length < 2 ? 'Required' : '',
      cardNumber: /^\d{15,16}$/.test(cardDigits) ? '' : '15–16 digit card',
      expiry: /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) ? '' : 'MM/YY',
      cvv: /^\d{3,4}$/.test(cvv) ? '' : '3–4 digit CVV',
    }
    const upiErrors = {
      upiId: UPI_RE.test(upiId) ? '' : 'Enter a valid UPI id (name@bank)',
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      setTouched(true)
      if (tab === 'card') {
        if (Object.values(cardErrors).some((err) => err.length > 0)) return
        const last4 = cardDigits.slice(-4)
        const brand = detectBrand(cardDigits)
        onSubmit({
          type: 'card',
          label: cardLabel.trim() || `${brand ?? 'Card'} •••• ${last4}`,
          last4,
          brand,
          isDefault,
        })
      } else {
        if (Object.values(upiErrors).some((err) => err.length > 0)) return
        onSubmit({
          type: 'upi',
          label: upiLabel.trim() || upiId,
          upiId,
          isDefault,
        })
      }
    }

    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-brand text-lg font-semibold text-primary">
              Add Payment Method
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-secondary hover:bg-muted"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            className="flex items-center gap-2 p-1 rounded-full bg-muted mb-5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'card'}
              onClick={() => setTab('card')}
              className="flex-1 min-h-[40px] rounded-full text-sm font-semibold transition-all"
              style={
                tab === 'card'
                  ? { background: 'var(--color-card)', color: 'var(--color-primary)' }
                  : { background: 'transparent', color: 'var(--color-text-secondary)' }
              }
            >
              Card
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'upi'}
              onClick={() => setTab('upi')}
              className="flex-1 min-h-[40px] rounded-full text-sm font-semibold transition-all"
              style={
                tab === 'upi'
                  ? { background: 'var(--color-card)', color: 'var(--color-primary)' }
                  : { background: 'transparent', color: 'var(--color-text-secondary)' }
              }
            >
              UPI
            </button>
          </div>

          {tab === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label
                  htmlFor="pm-cardholder"
                  className="text-xs font-semibold text-secondary uppercase"
                >
                  Cardholder Name
                </label>
                <input
                  id="pm-cardholder"
                  type="text"
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value)}
                  className={`input-base w-full px-3 py-2.5 text-sm ${
                    touched && cardErrors.cardholder ? 'field-invalid' : ''
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label
                  htmlFor="pm-number"
                  className="text-xs font-semibold text-secondary uppercase"
                >
                  Card Number
                </label>
                <input
                  id="pm-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={cardNumber}
                  maxLength={19}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
                    const grouped = digits.replace(/(.{4})/g, '$1 ').trim()
                    setCardNumber(grouped)
                  }}
                  placeholder="1234 5678 9012 3456"
                  className={`input-base w-full px-3 py-2.5 text-sm tabular-nums ${
                    touched && cardErrors.cardNumber ? 'field-invalid' : ''
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="pm-expiry"
                  className="text-xs font-semibold text-secondary uppercase"
                >
                  Expiry (MM/YY)
                </label>
                <input
                  id="pm-expiry"
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  maxLength={5}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setExpiry(
                      raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw,
                    )
                  }}
                  placeholder="MM/YY"
                  className={`input-base w-full px-3 py-2.5 text-sm tabular-nums ${
                    touched && cardErrors.expiry ? 'field-invalid' : ''
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="pm-cvv"
                  className="text-xs font-semibold text-secondary uppercase"
                >
                  CVV
                </label>
                <input
                  id="pm-cvv"
                  type="password"
                  inputMode="numeric"
                  value={cvv}
                  maxLength={4}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  className={`input-base w-full px-3 py-2.5 text-sm tabular-nums ${
                    touched && cardErrors.cvv ? 'field-invalid' : ''
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label
                  htmlFor="pm-cardlabel"
                  className="text-xs font-semibold text-secondary uppercase"
                >
                  Label (optional)
                </label>
                <input
                  id="pm-cardlabel"
                  type="text"
                  value={cardLabel}
                  maxLength={30}
                  placeholder="e.g. Personal Visa"
                  onChange={(e) => setCardLabel(e.target.value)}
                  className="input-base w-full px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="pm-upi"
                  className="text-xs font-semibold text-secondary uppercase"
                >
                  UPI ID
                </label>
                <input
                  id="pm-upi"
                  type="text"
                  value={upiId}
                  placeholder="name@bank"
                  onChange={(e) => setUpiId(e.target.value)}
                  className={`input-base w-full px-3 py-2.5 text-sm ${
                    touched && upiErrors.upiId ? 'field-invalid' : ''
                  }`}
                />
                {touched && upiErrors.upiId && (
                  <span className="text-xs text-error">{upiErrors.upiId}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="pm-upilabel"
                  className="text-xs font-semibold text-secondary uppercase"
                >
                  Label (optional)
                </label>
                <input
                  id="pm-upilabel"
                  type="text"
                  value={upiLabel}
                  maxLength={30}
                  placeholder="e.g. Primary UPI"
                  onChange={(e) => setUpiLabel(e.target.value)}
                  className="input-base w-full px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 mt-4 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm text-secondary">
              Set as default payment method
            </span>
          </label>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-base btn-secondary text-sm px-4 py-2 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-base btn-primary text-sm px-4 py-2 min-h-[44px]"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-muted mt-3 text-center">
            Full card details are never stored — only the last 4 digits.
          </p>
        </form>
      </Modal>
    )
  },
)

PaymentFormModal.displayName = 'PaymentFormModal'
