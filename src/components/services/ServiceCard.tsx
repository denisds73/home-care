import type { MouseEvent, KeyboardEvent } from 'react'
import useStore from '../../store/useStore'
import { getServiceImage } from '../../data/service-images'
import type { Service } from '../../types/domain'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service: s }: ServiceCardProps) {
  const addToCart = useStore(st => st.addToCart)
  const removeFromCart = useStore(st => st.removeFromCart)
  const openDetailSheet = useStore(st => st.openDetailSheet)
  const showToast = useStore(st => st.showToast)
  const qty = useStore(state => state.cart.find(c => c.service.id === s.id)?.qty || 0)
  const img = s.image_url || getServiceImage(s)
  // Use real original_price if available, fallback to 20% markup
  const origPrice = s.original_price ? Number(s.original_price) : Math.round(Number(s.price) * 1.2)
  const discount = Math.round(((origPrice - Number(s.price)) / origPrice) * 100)
  // Use real rating if available, fallback to seed formula
  const seed = ((s.id * 2654435761) >>> 0) / 4294967296
  const hasRealRating = s.rating_average && s.rating_average > 0
  const rating = hasRealRating ? Number(s.rating_average).toFixed(1) : (4.5 + seed * 0.5).toFixed(1)
  const reviews = s.rating_count && s.rating_count > 0 ? s.rating_count : Math.floor(seed * 2000) + 200
  const reviewsK = reviews >= 1000 ? (reviews / 1000).toFixed(1) + 'K' : String(reviews)

  const handleAdd = (e: MouseEvent) => {
    e.stopPropagation()
    addToCart(s.id)
    showToast(`${s.service_name} added to cart`, 'success')
  }

  const openSheet = () => openDetailSheet(s.id)

  return (
    <div
      onClick={openSheet}
      onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') openSheet() }}
      role="button"
      tabIndex={0}
      className={`group bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] overflow-hidden relative cursor-pointer transition hover:shadow-lg active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${s.is_basic ? 'border-2 border-brand' : 'border border-gray-100'}`}
    >
      {s.is_basic && <div className="absolute top-0 right-3 bg-brand text-white text-[.6rem] font-bold px-2 py-1 rounded-b-md uppercase tracking-wider z-10">★ Recommended</div>}
      <div className="relative w-full aspect-[16/9] bg-surface overflow-hidden">
        <img src={img} alt={s.service_name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
      </div>
      <div className="p-2.5 sm:p-4">
        <h4 className="font-bold text-[.75rem] sm:text-sm mb-1 text-primary line-clamp-1">{s.service_name}</h4>
        <div className="flex items-center gap-1 text-[.7rem] text-secondary mb-1">
          <span className="text-accent">★</span>
          <span className="font-bold text-primary">{rating}</span>
          <span>({reviewsK})</span>
        </div>
        <p className="text-secondary text-[.65rem] sm:text-xs mb-2 line-clamp-2 hidden sm:block">{s.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-1">
            <span className="font-extrabold text-sm text-primary" style={{ fontVariant: 'tabular-nums' }}>₹{s.price}</span>
            <span className="text-[.65rem] sm:text-[.75rem] text-muted line-through">₹{origPrice}</span>
            <span className="text-[.55rem] sm:text-[.65rem] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">{discount}% off</span>
          </div>
          {qty === 0 ? (
            <button type="button" onClick={handleAdd} className="bg-brand text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[.7rem] sm:text-sm font-medium hover:bg-brand-dark transition active:scale-95">Add</button>
          ) : (
            <div className="inline-flex items-center border-2 border-brand rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
              <button type="button" onClick={() => removeFromCart(s.id)} className="w-7 h-7 sm:w-8 sm:h-8 bg-brand text-white flex items-center justify-center font-bold">−</button>
              <span className="w-8 sm:w-9 text-center font-bold text-sm text-brand-dark">{qty}</span>
              <button type="button" onClick={handleAdd} className="w-7 h-7 sm:w-8 sm:h-8 bg-brand text-white flex items-center justify-center font-bold">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
