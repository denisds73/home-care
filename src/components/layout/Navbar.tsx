import { useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import { CATEGORIES, CATEGORY_IMAGES } from '../../data/categories'

export default function Navbar() {
  const setView = useStore(s => s.setView)
  const currentView = useStore(s => s.currentView)
  const selectedCategory = useStore(s => s.selectedCategory)
  const toggleCartDrawer = useStore(s => s.toggleCartDrawer)
  const showToast = useStore(s => s.showToast)
  const services = useStore(s => s.services)
  const cartCount = useStore(s => s.getCartCount())
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return
    const cat = CATEGORIES.find(c => c.name.toLowerCase().includes(q) || c.id.includes(q))
    if (cat) { setView('services', cat.id); setSearchQuery(''); return }
    const svc = services.find(s => s.service_name.toLowerCase().includes(q) && s.is_active)
    if (svc) { setView('services', svc.category); setSearchQuery(''); return }
    showToast('No matching service found', 'warning')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white transition-shadow" role="navigation" aria-label="Main navigation" style={{ boxShadow: scrolled ? '0 4px 16px rgba(0,0,0,.1)' : '0 2px 4px rgba(0,0,0,.06)' }}>
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-3 sm:gap-4">
          <button type="button" onClick={() => setView('home')} className="flex items-center gap-2 shrink-0" aria-label="HomeCare home">
            <svg className="w-7 h-7 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>
            <span className="text-base sm:text-lg font-bold font-brand text-primary">Home<span className="text-brand">Care</span></span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer">
            <svg className="w-5 h-5 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <div><p className="text-[.85rem] font-bold text-primary">Bangalore</p><p className="text-[.75rem] text-secondary max-w-[180px] truncate">Koramangala, 5th Block</p></div>
            <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </div>

          <div className="flex-1 max-w-md relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
              className="input-base w-full bg-muted border-transparent py-2.5 pl-10 pr-4 text-[.85rem]"
              placeholder="Search services..."
              aria-label="Search services"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {cartCount > 0 && (
              <button type="button" onClick={toggleCartDrawer} className="relative p-2 rounded-lg hover:bg-gray-100 transition" aria-label="Shopping cart">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[.6rem] font-extrabold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>
              </button>
            )}
            <button type="button" onClick={() => setView('home')} className="hidden sm:inline-flex btn-base btn-secondary px-3 py-1.5 text-xs">Customer</button>
            <button type="button" onClick={() => useStore.getState().adminUnlocked ? setView('admin') : useStore.setState({ adminAuthOpen: true })} className="hidden sm:inline-flex btn-base btn-secondary px-3 py-1.5 text-xs">Admin</button>
          </div>
        </div>
      </div>

      <div className="hidden sm:block border-b border-gray-100 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex">
          <button type="button" onClick={() => setView('home')} className={`flex items-center gap-1.5 px-4 py-2.5 text-[.8rem] font-semibold whitespace-nowrap border-b-[2.5px] transition ${currentView === 'home' ? 'text-brand border-brand' : 'text-secondary border-transparent hover:text-primary hover:bg-gray-50'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>
            All
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} type="button" onClick={() => setView('services', cat.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-[.8rem] font-semibold whitespace-nowrap border-b-[2.5px] transition ${selectedCategory === cat.id && currentView === 'services' ? 'text-brand border-brand' : 'text-secondary border-transparent hover:text-primary hover:bg-gray-50'}`}>
              <img src={CATEGORY_IMAGES[cat.id]} alt={cat.name} className="w-6 h-6 rounded-md object-cover" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
