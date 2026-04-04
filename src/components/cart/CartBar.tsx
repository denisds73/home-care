import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../../store/useStore'

export default function CartBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const toggleCartDrawer = useStore(s => s.toggleCartDrawer)
  const count = useStore(s => s.getCartCount())
  const total = useStore(s => s.getCartTotal())

  // Only show on category/service pages
  const isServicePage = location.pathname.startsWith('/services')
  if (count === 0 || !isServicePage) return null

  return (
    <div className="fixed left-0 right-0 z-40 bg-white/75 backdrop-blur-xl border-t border-white/40 shadow-[0_-4px_20px_rgba(0,0,0,.08)] bottom-14 sm:bottom-0">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
          <div>
            <p className="text-sm font-bold text-primary">{count} service{count !== 1 ? 's' : ''} added</p>
            <p className="text-xs font-semibold text-brand-dark">₹{total}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={toggleCartDrawer} className="btn-base btn-secondary border-2 border-brand text-brand px-4 py-2 rounded-lg text-sm font-semibold">View Cart</button>
          <button type="button" onClick={() => navigate('/app/booking')} className="btn-base btn-primary bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold">Book Now</button>
        </div>
      </div>
    </div>
  )
}
