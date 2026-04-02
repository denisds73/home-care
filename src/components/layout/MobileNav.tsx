import type { ReactElement } from 'react'
import useStore from '../../store/useStore'

interface TabItem {
  id: string
  label: string
  icon: ReactElement
  isCart?: boolean
}

export default function MobileNav() {
  const currentView = useStore(s => s.currentView)
  const setView = useStore(s => s.setView)
  const toggleCartDrawer = useStore(s => s.toggleCartDrawer)
  const cartCount = useStore(s => s.getCartCount())

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/> },
    { id: 'services', label: 'Services', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/> },
    { id: 'cart', label: 'Cart', isCart: true, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/> },
    { id: 'offers', label: 'Offers', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/> },
    { id: 'account', label: 'Account', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/> },
  ]

  const handleClick = (tab: TabItem) => {
    if (tab.id === 'cart') { toggleCartDrawer(); return }
    if (tab.id === 'home') { setView('home'); return }
    if (tab.id === 'services') { setView('home'); setTimeout(() => document.getElementById('categorySection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200); return }
    if (tab.id === 'offers') { setView('home'); setTimeout(() => document.getElementById('offersSection')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200); return }
    if (tab.id === 'account') { useStore.setState({ accountSheetOpen: true }); return }
  }

  const isActive = (id: string) => {
    if (id === 'home' && currentView === 'home') return true
    if (id === 'services' && currentView === 'services') return true
    return false
  }

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-45 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,.06)]" role="navigation" aria-label="Mobile navigation" style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)', paddingTop: '6px' }}>
      <div className="flex justify-around items-center">
        {tabs.map(tab => (
          <button key={tab.id} type="button" onClick={() => handleClick(tab)} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[.7rem] font-semibold transition relative ${isActive(tab.id) ? 'text-brand' : 'text-secondary'}`}>
            {tab.isCart ? (
              <div className="bg-brand rounded-full w-11 h-11 flex items-center justify-center -mt-3.5 mb-[-2px] shadow-[0_4px_12px_rgba(109,40,217,.32)]">
                <svg fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" className="w-5 h-5">{tab.icon}</svg>
                {cartCount > 0 && <span className="absolute -top-4 right-0 bg-red-500 text-white text-[.55rem] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
              </div>
            ) : (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">{tab.icon}</svg>
            )}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
