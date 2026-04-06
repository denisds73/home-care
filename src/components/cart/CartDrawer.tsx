import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import { CONVENIENCE_FEE, GST_RATE } from '../../data/services'
import { CartItem } from './CartItem'
import { CartPricingSummary } from './CartPricingSummary'

export function CartDrawer() {
  const cartDrawerOpen = useStore(s => s.cartDrawerOpen)
  const toggleCartDrawer = useStore(s => s.toggleCartDrawer)
  const cart = useStore(s => s.cart)
  const addToCart = useStore(s => s.addToCart)
  const removeFromCart = useStore(s => s.removeFromCart)
  const removeItemFromCart = useStore(s => s.removeItemFromCart)
  const clearCart = useStore(s => s.clearCart)
  const showToast = useStore(s => s.showToast)
  const total = useStore(s => s.getCartTotal())
  const count = useStore(s => s.getCartCount())
  const navigate = useNavigate()
  const closeRef = useRef<HTMLButtonElement>(null)

  const gst = Math.round(total * GST_RATE)
  const grandTotal = total > 0 ? total + CONVENIENCE_FEE + gst : 0

  /* Focus close button on open + Escape to close */
  useEffect(() => {
    if (!cartDrawerOpen) return
    closeRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleCartDrawer()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [cartDrawerOpen, toggleCartDrawer])

  const proceedToBooking = useCallback(() => {
    if (cart.length === 0) { showToast('Add services to your cart first', 'warning'); return }
    toggleCartDrawer()
    navigate('/app/booking')
  }, [cart.length, showToast, toggleCartDrawer, navigate])

  const getCategoryName = (categoryId: string) =>
    CATEGORIES.find(c => c.id === categoryId)?.name ?? ''

  return (
    <>
      {/* Backdrop */}
      {cartDrawerOpen && (
        <div
          className="fixed inset-0 z-[54] bg-black/40"
          style={{ animation: 'cartBackdropIn 0.2s ease-out' }}
          onClick={toggleCartDrawer}
          role="presentation"
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] z-[55] bg-white transition-transform duration-300 ${
          cartDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: cartDrawerOpen ? '-8px 0 30px rgba(0,0,0,.12)' : 'none' }}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-default">
            <div className="flex items-center gap-2.5">
              <h3 className="font-brand text-lg font-bold text-primary">Your Cart</h3>
              {count > 0 && (
                <span className="badge bg-brand text-white text-[.65rem] min-w-[22px] text-center" aria-live="polite">
                  {count}
                </span>
              )}
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={toggleCartDrawer}
              className="w-9 h-9 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-colors duration-150"
              aria-label="Close cart"
            >
              <svg className="w-4.5 h-4.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Empty state */}
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="cart-empty-icon mb-4">
                <svg className="w-9 h-9 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h4 className="font-brand text-base font-semibold text-primary">Your cart is empty</h4>
              <p className="text-[.8rem] text-text-muted mt-1 max-w-[220px]">
                Browse services and add them to get started
              </p>
              <button
                type="button"
                onClick={() => { toggleCartDrawer(); navigate('/app') }}
                className="btn-base btn-secondary border border-default text-text-secondary px-5 py-2 rounded-xl text-[.8rem] mt-5"
              >
                Browse Services
              </button>
            </div>
          ) : (
            /* Item list */
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((line, i) => (
                <CartItem
                  key={line.service.id}
                  line={line}
                  categoryName={getCategoryName(line.service.category)}
                  index={i}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  onRemoveAll={removeItemFromCart}
                />
              ))}
            </div>
          )}

          {/* Pricing footer */}
          {cart.length > 0 && (
            <CartPricingSummary
              count={count}
              subtotal={total}
              convenienceFee={CONVENIENCE_FEE}
              gst={gst}
              grandTotal={grandTotal}
              onProceed={proceedToBooking}
              onClear={clearCart}
            />
          )}
        </div>
      </div>
    </>
  )
}
