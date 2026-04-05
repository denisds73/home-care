import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import { getServiceImage } from '../../data/service-images'

export default function DetailSheet() {
  const detailSheetOpen = useStore(s => s.detailSheetOpen)
  const detailServiceId = useStore(s => s.detailServiceId)
  const closeDetailSheet = useStore(s => s.closeDetailSheet)
  const services = useStore(s => s.services)
  const addToCart = useStore(s => s.addToCart)
  const removeFromCart = useStore(s => s.removeFromCart)
  const showToast = useStore(s => s.showToast)
  const toggleCartDrawer = useStore(s => s.toggleCartDrawer)
  const qty = useStore(state => state.cart.find(c => c.service.id === state.detailServiceId)?.qty || 0)

  if (!detailSheetOpen || !detailServiceId) return null
  const svc = services.find(s => s.id === detailServiceId)
  if (!svc) return null

  const cat = CATEGORIES.find(c => c.id === svc.category)
  const origPrice = Math.round(svc.price * 1.2)
  const discount = Math.round(((origPrice - svc.price) / origPrice) * 100)
  const seed = ((svc.id * 2654435761) >>> 0) / 4294967296
  const rating = (4.5 + seed * 0.5).toFixed(1)
  const reviews = Math.floor(seed * 2000) + 200

  const handleAdd = () => { addToCart(svc.id); showToast(`${svc.service_name} added`, 'success') }

  return (
    <>
      <div className="fixed inset-0 z-[54] bg-black/40 transition-opacity" onClick={closeDetailSheet} role="presentation" />
      <div className="fixed bottom-0 left-0 right-0 z-[56] bg-white rounded-t-2xl shadow-[0_-8px_40px_rgba(0,0,0,.15)] max-h-[85vh] overflow-y-auto transition-transform" style={{ animation: 'slideUp .35s ease-out' }}>
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mt-3 mb-2" />
        <button type="button" onClick={closeDetailSheet} className="absolute top-3 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition z-10" aria-label="Close details">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div className="px-5 pb-6">
          <div className="flex items-center gap-4 mb-4 rounded-2xl p-4" style={{ background: cat ? cat.color + '10' : 'var(--color-muted)' }}>
            <img src={getServiceImage(svc)} alt="" className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-extrabold text-primary">{svc.service_name}</h3>
              <p className="text-xs text-muted">{cat?.name} Service</p>
              <div className="flex items-center gap-1 mt-2 text-[.75rem] text-secondary"><span className="text-accent">★</span><span className="font-bold text-primary">{rating}</span><span>({reviews} reviews)</span></div>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-extrabold text-lg text-primary">₹{svc.price}</span>
                <span className="text-sm text-muted line-through">₹{origPrice}</span>
                <span className="text-[.65rem] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">{discount}% off</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-secondary mb-5 leading-relaxed">{svc.description}</p>

          <div className="mb-5">
            <h4 className="text-sm font-bold mb-2 text-primary">What&apos;s Included</h4>
            <ul className="space-y-1.5">
              {[`Professional ${cat?.name || ''} technician`, svc.description.split(',')[0] || 'Complete service', 'Post-service cleanup', '30-day service warranty'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[.8rem] text-secondary"><span className="w-2.5 h-2.5 rounded-full border-2 border-green-600 bg-green-100 shrink-0" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="mb-5">
            <h4 className="text-sm font-bold mb-2 text-primary">Not Included</h4>
            <ul className="space-y-1.5">
              {['Spare parts (charged separately if needed)', 'Additional units beyond first one'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[.8rem] text-secondary"><span className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-100 shrink-0" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="mb-5 bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-bold mb-2 text-primary">Frequently Asked</h4>
            <div className="text-xs text-secondary space-y-2">
              <div><strong>How long does it take?</strong><br/>Typically 45-90 minutes depending on the service.</div>
              <div><strong>What if I&apos;m not satisfied?</strong><br/>We offer a 30-day warranty. We&apos;ll fix it for free.</div>
              <div><strong>Do I need to provide any tools?</strong><br/>No, our technician brings all required equipment.</div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-3 pb-2 border-t -mx-5 px-5">
            {qty === 0 ? (
              <button type="button" onClick={handleAdd} className="bg-brand text-white w-full py-3.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition">
                Add to Cart — ₹{svc.price}
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center border-2 border-brand rounded-lg overflow-hidden scale-110">
                  <button type="button" onClick={() => removeFromCart(svc.id)} className="w-8 h-8 bg-brand text-white flex items-center justify-center font-bold">−</button>
                  <span className="w-9 text-center font-bold text-sm text-brand-dark">{qty}</span>
                  <button type="button" onClick={handleAdd} className="w-8 h-8 bg-brand text-white flex items-center justify-center font-bold">+</button>
                </div>
                <button type="button" onClick={() => { closeDetailSheet(); toggleCartDrawer() }} className="bg-brand text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-dark transition">View Cart</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
