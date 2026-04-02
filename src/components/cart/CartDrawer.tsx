import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { SERVICE_IMAGES, CATEGORIES } from '../../data/categories'
import { CONVENIENCE_FEE, GST_RATE } from '../../data/services'

export default function CartDrawer() {
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
  const gst = Math.round(total * GST_RATE)
  const grandTotal = total > 0 ? total + CONVENIENCE_FEE + gst : 0
  const navigate = useNavigate()

  const proceedToBooking = () => {
    if (cart.length === 0) { showToast('Add services to your cart first', 'warning'); return }
    toggleCartDrawer()
    navigate('/booking')
  }

  return (
    <>
      {cartDrawerOpen && <div className="fixed inset-0 z-[54] bg-black/40 transition-opacity" onClick={toggleCartDrawer} role="presentation" />}
      <div className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] z-[55] bg-white shadow-[-8px_0_30px_rgba(0,0,0,.15)] transition-transform duration-300 ${cartDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-bold text-primary">Your Cart</h3>
            <button type="button" onClick={toggleCartDrawer} className="p-1 rounded-lg hover:bg-gray-100" aria-label="Close cart"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <svg className="w-16 h-16 mb-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
              <p className="text-muted font-medium">Your cart is empty</p>
              <p className="text-muted text-sm mt-1">Browse services and add them to your cart</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map(c => {
                const catName = CATEGORIES.find(cat => cat.id === c.service.category)?.name || ''
                return (
                  <div key={c.service.id} className="flex gap-3 bg-gray-50 rounded-xl p-3 items-center">
                    <img src={SERVICE_IMAGES[c.service.category]} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-primary">{c.service.service_name}</p>
                      <p className="text-xs text-muted">{catName}</p>
                      <p className="font-bold text-sm mt-0.5 text-brand-dark">₹{c.service.price}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="inline-flex items-center border-2 border-brand rounded-lg overflow-hidden">
                        <button type="button" onClick={() => removeFromCart(c.service.id)} className="w-7 h-7 bg-brand text-white flex items-center justify-center font-bold text-sm">−</button>
                        <span className="w-8 text-center font-bold text-sm text-brand-dark">{c.qty}</span>
                        <button type="button" onClick={() => addToCart(c.service.id)} className="w-7 h-7 bg-brand text-white flex items-center justify-center font-bold text-sm">+</button>
                      </div>
                      <button type="button" onClick={() => removeItemFromCart(c.service.id)} className="text-xs text-red-400 hover:text-red-600 mt-1">Remove</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {cart.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm"><span className="text-secondary">Subtotal ({count} services)</span><span className="font-semibold">₹{total}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted">Convenience Fee</span><span className="text-secondary">₹{CONVENIENCE_FEE}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted">GST (18%)</span><span className="text-secondary">₹{gst}</span></div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t mt-1 text-primary"><span>Total</span><span className="text-brand-dark">₹{grandTotal}</span></div>
              </div>
              <button type="button" onClick={proceedToBooking} className="btn-base btn-primary w-full py-3 rounded-xl font-semibold text-sm">Proceed to Book</button>
              <button type="button" onClick={clearCart} className="w-full py-2 text-xs text-muted hover:text-red-500 mt-1 transition">Clear Cart</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
