import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../../store/useStore'

export function CartBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const toggleCartDrawer = useStore(s => s.toggleCartDrawer)
  const count = useStore(s => s.getCartCount())
  const total = useStore(s => s.getCartTotal())

  const isServicePage = location.pathname.startsWith('/services') || location.pathname.startsWith('/app/services')
  if (count === 0 || !isServicePage) return null

  return (
    <div className="hidden sm:block fixed left-0 right-0 z-40 sm:bottom-0 cart-bar">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left — icon + info */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-error text-white text-[.55rem] font-extrabold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-[1.5px] border-white">
              {count}
            </span>
          </div>
          <div>
            <p className="text-[.82rem] font-semibold text-primary leading-tight">
              {count} service{count !== 1 ? 's' : ''} added
            </p>
            <p className="text-[.72rem] font-bold text-brand-dark">₹{total}</p>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleCartDrawer}
            className="btn-base btn-secondary border border-brand text-brand px-3 sm:px-4 py-2 rounded-xl text-[.75rem] sm:text-[.8rem] font-semibold"
          >
            View Cart
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/booking')}
            className="btn-base btn-primary px-3.5 sm:px-5 py-2 rounded-xl text-[.75rem] sm:text-[.8rem] font-semibold"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}
