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
  // Use real original_price if available, fallback to 20% markup
  const origPrice = svc.original_price ? Number(svc.original_price) : Math.round(Number(svc.price) * 1.2)
  const discount = Math.round(((origPrice - Number(svc.price)) / origPrice) * 100)
  const seed = ((svc.id * 2654435761) >>> 0) / 4294967296
  // Use real rating if available, fallback to seed formula
  const hasRealRating = svc.rating_average && svc.rating_average > 0
  const rating = hasRealRating ? Number(svc.rating_average).toFixed(1) : (4.5 + seed * 0.5).toFixed(1)
  const reviews = svc.rating_count && svc.rating_count > 0 ? svc.rating_count : Math.floor(seed * 2000) + 200

  // Rating distribution: use real data if available, fallback to seed-based breakdown
  const star5 = Math.round(60 + seed * 20)
  const star4 = Math.round(15 + seed * 10)
  const star3 = Math.round(5 + seed * 8)
  const star2 = Math.round(2 + seed * 3)
  const star1 = 100 - star5 - star4 - star3 - star2
  const dist = svc.rating_distribution && svc.rating_distribution.some(v => v > 0)
    ? svc.rating_distribution
    : [star5, star4, star3, star2, star1]

  const handleAdd = () => { addToCart(svc.id); showToast(`${svc.service_name} added`, 'success') }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[54] bg-black/40 transition-opacity" onClick={closeDetailSheet} role="presentation" />

      {/* Sheet — bottom sheet on mobile, centered modal on desktop */}
      <div
        className="fixed z-[56] bg-white overflow-y-auto transition-transform
          bottom-0 left-0 right-0 max-h-[88vh] rounded-t-2xl
          md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:w-[640px] md:max-w-[90vw] md:max-h-[85vh] md:rounded-2xl"
        style={{
          animation: 'slideUp .3s ease-out',
          boxShadow: '0 -8px 40px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.04)',
        }}
      >
        {/* Mobile drag handle — hidden on desktop */}
        <div className="md:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mt-3 mb-1" />

        {/* Close button */}
        <button
          type="button"
          onClick={closeDetailSheet}
          className="absolute top-3 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition z-10"
          aria-label="Close details"
        >
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-5 md:px-8 pb-6 md:pb-8 pt-2 md:pt-6">
          {/* Header: image + title + price */}
          <div
            className="flex items-center gap-4 mb-5 rounded-2xl p-4"
            style={{ background: cat ? cat.color + '10' : 'var(--color-muted)' }}
          >
            <img
              src={svc.image_url || getServiceImage(svc)}
              alt=""
              className="w-24 h-24 md:w-36 md:h-36 object-cover rounded-xl shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted font-medium">{cat?.name} Service</p>
              <h3 className="text-lg md:text-xl font-extrabold text-primary mt-0.5">{svc.service_name}</h3>
              <div className="flex items-center gap-2 mt-2.5">
                <span className="font-extrabold text-lg text-primary">₹{svc.price}</span>
                <span className="text-sm text-muted line-through">₹{origPrice}</span>
                <span className="text-[.65rem] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">{discount}% off</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-secondary mb-6 leading-relaxed">{svc.long_description || svc.description}</p>

          {/* Two-column layout on desktop */}
          <div className="md:grid md:grid-cols-2 md:gap-6">
            {/* Left column */}
            <div>
              {/* What's Included */}
              <div className="mb-5">
                <h4 className="text-sm font-bold mb-2.5 text-primary">What&apos;s Included</h4>
                <ul className="space-y-2">
                  {(svc.inclusions && svc.inclusions.length > 0
                    ? svc.inclusions
                    : [
                        `Professional ${cat?.name || ''} technician`,
                        svc.description.split(',')[0] || 'Complete service',
                        'Post-service cleanup',
                        '30-day service warranty',
                      ]
                  ).map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[.8rem] text-secondary">
                      <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Included */}
              <div className="mb-5">
                <h4 className="text-sm font-bold mb-2.5 text-primary">Not Included</h4>
                <ul className="space-y-2">
                  {(svc.exclusions && svc.exclusions.length > 0
                    ? svc.exclusions
                    : ['Spare parts (charged separately if needed)', 'Additional units beyond first one']
                  ).map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[.8rem] text-secondary">
                      <span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Ratings breakdown */}
              <div className="mb-5 bg-surface rounded-xl p-4">
                <h4 className="text-sm font-bold mb-3 text-primary">Customer Reviews</h4>
                <div className="flex items-start gap-4">
                  {/* Score */}
                  <div className="text-center shrink-0">
                    <p className="text-3xl font-extrabold text-primary">{rating}</p>
                    <div className="flex justify-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(Number(rating)) ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-[.65rem] text-muted mt-1">{reviews} reviews</p>
                  </div>
                  {/* Bars */}
                  <div className="flex-1 space-y-1.5">
                    {[
                      { label: '5', pct: dist[0] },
                      { label: '4', pct: dist[1] },
                      { label: '3', pct: dist[2] },
                      { label: '2', pct: dist[3] },
                      { label: '1', pct: dist[4] },
                    ].map(bar => (
                      <div key={bar.label} className="flex items-center gap-2">
                        <span className="text-[.65rem] font-semibold text-muted w-3 text-right">{bar.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${bar.pct}%` }}
                          />
                        </div>
                        <span className="text-[.6rem] text-muted w-7 text-right">{bar.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-surface rounded-xl p-4">
                <h4 className="text-sm font-bold mb-3 text-primary">Frequently Asked</h4>
                <div className="space-y-3">
                  {(svc.faqs && svc.faqs.length > 0
                    ? svc.faqs
                    : [
                        { question: 'How long does it take?', answer: svc.estimated_duration ? `Typically ${svc.estimated_duration} depending on the service.` : 'Typically 45-90 minutes depending on the service.' },
                        { question: 'What if I\'m not satisfied?', answer: 'We offer a 30-day warranty. We\'ll fix it for free.' },
                        { question: 'Do I need to provide any tools?', answer: 'No, our technician brings all required equipment.' },
                      ]
                  ).map((faq, i) => (
                    <div key={i}>
                      <p className="text-[.8rem] font-semibold text-primary">{faq.question}</p>
                      <p className="text-[.75rem] text-secondary mt-0.5 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky add-to-cart footer */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-5 md:-mx-8 px-5 md:px-8 mt-4" style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.04), 0 -4px 12px rgba(0,0,0,0.03)' }}>
            {qty === 0 ? (
              <button type="button" onClick={handleAdd} className="btn-base btn-primary w-full py-3.5 font-bold text-sm">
                Add to Cart — ₹{svc.price}
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center border-2 border-brand rounded-xl overflow-hidden">
                  <button type="button" onClick={() => removeFromCart(svc.id)} className="w-10 h-10 bg-brand text-white flex items-center justify-center font-bold text-lg">−</button>
                  <span className="w-10 text-center font-bold text-sm text-brand-dark">{qty}</span>
                  <button type="button" onClick={handleAdd} className="w-10 h-10 bg-brand text-white flex items-center justify-center font-bold text-lg">+</button>
                </div>
                <button type="button" onClick={() => { closeDetailSheet(); toggleCartDrawer() }} className="btn-base btn-primary px-6 py-3 font-bold text-sm">
                  View Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
