import useStore from '../../store/useStore'
import { CATEGORIES, CATEGORY_SVGS } from '../../data/categories'
import Reveal from '../common/Reveal'

export default function CategoryGrid() {
  const services = useStore(s => s.services)
  const setView = useStore(s => s.setView)

  return (
    <div id="categorySection" className="max-w-7xl mx-auto px-4 py-10 sm:py-14" style={{ scrollMarginTop: '120px' }}>
      <Reveal><h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--color-secondary)' }}>Service Categories</h2></Reveal>
      <Reveal><p className="text-secondary text-sm mb-8">Choose a category to explore available services</p></Reveal>
      <Reveal>
        <div id="categoryGrid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-5">
          {CATEGORIES.map(cat => {
            const count = services.filter(s => s.category === cat.id && s.is_active).length
            const prices = services.filter(s => s.category === cat.id && s.is_active).map(s => s.price)
            const minPrice = prices.length ? Math.min(...prices) : 0
            return (
              <button key={cat.id} onClick={() => setView('services', cat.id)}
                className="category-card bg-white rounded-2xl border border-gray-100 overflow-hidden text-center p-3 sm:p-4"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 rounded-2xl flex items-center justify-center p-2"
                  style={{ background: cat.color + '10' }}
                  dangerouslySetInnerHTML={{ __html: CATEGORY_SVGS[cat.id] || '' }} />
                <h3 className="font-bold text-xs sm:text-sm" style={{ color: 'var(--color-secondary)' }}>{cat.name}</h3>
                <p className="text-xs text-muted mt-0.5">{count} services</p>
                <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-primary)' }}>From ₹{minPrice}</p>
              </button>
            )
          })}
        </div>
      </Reveal>
    </div>
  )
}
