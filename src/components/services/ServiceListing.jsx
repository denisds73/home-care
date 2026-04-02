import useStore from '../../store/useStore'
import { CATEGORIES, STORYSET_IMGS } from '../../data/categories'
import ServiceCard from './ServiceCard'

export default function ServiceListing() {
  const { selectedCategory, services, setView } = useStore()
  const cat = CATEGORIES.find(c => c.id === selectedCategory)
  if (!cat) return null

  const list = services.filter(s => s.category === selectedCategory && s.is_active).sort((a, b) => (b.is_basic ? 1 : 0) - (a.is_basic ? 1 : 0))

  return (
    <div className="fade-in">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-[100px]">
        <button onClick={() => setView('home')} className="btn-base btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium mb-5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Categories
        </button>

        {/* Banner with Storyset illustration */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ background: cat.color + '10' }}>
          <div className="flex items-center p-5 sm:p-8 gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-3xl font-extrabold text-primary">{cat.name} Services</h2>
              <p className="text-sm text-secondary mt-1">{cat.desc}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-muted text-brand">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  30-Day Warranty
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Same Day Service
                </span>
              </div>
            </div>
            <img src={STORYSET_IMGS[selectedCategory]} alt={cat.name} className="w-20 h-20 sm:w-40 sm:h-40 object-contain shrink-0" />
          </div>
        </div>

        {list.length === 0 ? (
          <p className="text-muted text-center py-10">No active services in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {list.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}
