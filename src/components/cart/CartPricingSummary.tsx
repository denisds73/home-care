import { memo } from 'react'

interface CartPricingSummaryProps {
  count: number
  subtotal: number
  convenienceFee: number
  gst: number
  grandTotal: number
  onProceed: () => void
  onClear: () => void
}

export const CartPricingSummary = memo(({
  count,
  subtotal,
  convenienceFee,
  gst,
  grandTotal,
  onProceed,
  onClear,
}: CartPricingSummaryProps) => (
  <div className="cart-footer">
    <div className="space-y-0.5 mb-3">
      <div className="price-row">
        <span className="text-text-secondary">Subtotal ({count} service{count !== 1 ? 's' : ''})</span>
        <span className="font-semibold text-primary">₹{subtotal}</span>
      </div>
      <div className="price-row">
        <span className="text-text-muted">Convenience Fee</span>
        <span className="text-text-secondary">₹{convenienceFee}</span>
      </div>
      <div className="price-row">
        <span className="text-text-muted">GST (18%)</span>
        <span className="text-text-secondary">₹{gst}</span>
      </div>
      <div className="price-row total">
        <span className="text-primary">Total</span>
        <span className="text-brand-dark font-brand">₹{grandTotal}</span>
      </div>
    </div>

    <button
      type="button"
      onClick={onProceed}
      className="btn-base btn-primary w-full py-3 rounded-xl font-semibold text-[.85rem] gap-2"
    >
      Proceed to Book
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>

    <button
      type="button"
      onClick={onClear}
      className="cart-remove-btn w-full text-center mt-2 py-1"
    >
      Clear Cart
    </button>
  </div>
))

CartPricingSummary.displayName = 'CartPricingSummary'
