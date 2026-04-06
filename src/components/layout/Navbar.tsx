import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useStore from '../../store/useStore'
import { useAuthStore } from '../../store/useAuthStore'
import { NavbarCategoryChips } from './NavbarCategoryChips'
import { useServiceSearch, type SearchResult } from '../../hooks/useServiceSearch'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function SearchBar({ inputId, onNavigate }: { inputId: string; onNavigate: () => void }) {
  const navigate = useNavigate()
  const { query, setQuery, results, isSearching, isOpen, clear, close } = useServiceSearch()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const showDropdown = isOpen && (results.length > 0 || (query.trim().length >= 2 && !isSearching))

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, close])

  useEffect(() => { setActiveIndex(-1) }, [results])

  const selectResult = (r: SearchResult) => {
    navigate(r.navigateTo)
    clear()
    onNavigate()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); inputRef.current?.blur(); return }
    if (!showDropdown || results.length === 0) return
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActiveIndex(i => (i + 1) % results.length); break
      case 'ArrowUp': e.preventDefault(); setActiveIndex(i => (i <= 0 ? results.length - 1 : i - 1)); break
      case 'Enter': e.preventDefault(); if (activeIndex >= 0) selectResult(results[activeIndex]); break
    }
  }

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Input pill */}
      <div className="relative flex items-center min-h-[42px] rounded-full bg-white border border-text-secondary transition-[border-color] duration-150 focus-within:border-brand">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {isSearching ? (
            <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" aria-hidden style={{ animation: 'spin 0.8s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".2" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 min-w-0 border-0 bg-transparent py-2.5 pl-11 pr-10 text-[.85rem] text-primary placeholder:text-secondary focus:outline-none focus:ring-0"
          placeholder="Search for services..."
          aria-label="Search services"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? `${inputId}-results` : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${inputId}-result-${activeIndex}` : undefined}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/[.05] hover:bg-black/[.08] flex items-center justify-center transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown — absolutely positioned, max 5 results visible */}
      {showDropdown && (
        <div
          id={`${inputId}-results`}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-2xl overflow-hidden max-h-[340px] overflow-y-auto"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)' }}
        >

          {results.length > 0 ? (
            <div className="py-1">
              {results.map((r, i) => (
                <button
                  key={`${r.type}-${r.id}`}
                  id={`${inputId}-result-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  type="button"
                  onClick={() => selectResult(r)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 text-left transition-colors duration-75 mx-0 ${
                    i === activeIndex ? 'bg-brand-soft/30' : 'hover:bg-muted/60'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    r.type === 'category' ? 'bg-brand-soft/60 text-brand' : 'bg-muted text-muted'
                  }`}>
                    {r.type === 'category' ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[.8rem] font-medium text-primary truncate">{r.title}</p>
                    <p className="text-[.65rem] text-muted truncate">{r.subtitle}</p>
                  </div>
                  {r.price !== undefined && (
                    <span className="text-[.75rem] font-semibold text-brand shrink-0">₹{r.price}</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            /* No results */
            <div className="px-4 py-5 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-[.8rem] text-muted">No results for &ldquo;<span className="font-medium text-secondary">{query.trim()}</span>&rdquo;</p>
              <p className="text-[.65rem] text-muted mt-0.5">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const authLoading = useAuthStore(s => s.isLoading)
  const toggleCartDrawer = useStore(s => s.toggleCartDrawer)
  const showToast = useStore(s => s.showToast)
  const cartCount = useStore(s => s.getCartCount())
  const [scrolled, setScrolled] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const prevCartRef = useRef(cartCount)
  const [badgeBounce, setBadgeBounce] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const prev = prevCartRef.current
    prevCartRef.current = cartCount
    if (cartCount <= prev) return
    queueMicrotask(() => setBadgeBounce(true))
  }, [cartCount])

  useEffect(() => {
    if (!badgeBounce) return
    const t = window.setTimeout(() => setBadgeBounce(false), 450)
    return () => window.clearTimeout(t)
  }, [badgeBounce])

  useEffect(() => {
    if (!mobileSearchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSearchOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileSearchOpen])

  useEffect(() => {
    if (!mobileSearchOpen) return
    window.requestAnimationFrame(() => {
      document.getElementById('navbar-search-mobile')?.focus()
    })
  }, [mobileSearchOpen])

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement>(null)

  // Close avatar dropdown on outside click or Escape
  useEffect(() => {
    if (!avatarMenuOpen) return
    const onClick = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) setAvatarMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAvatarMenuOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [avatarMenuOpen])

  const cartLabel =
    cartCount > 0
      ? `Shopping cart, ${cartCount} item${cartCount > 1 ? 's' : ''}`
      : 'Shopping cart, empty'

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-200 nav-shell ${scrolled ? 'nav-shell--scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Three-zone grid: Logo (left) | Search (center) | Actions (right) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-[auto_1fr_auto] items-center h-16 gap-4">
          {/* Left zone — Logo + Location */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0">
            {/* Logo — icon always, text on sm+ */}
            <Link
              to="/app"
              className="flex items-center gap-2 shrink-0 group"
              aria-label="HomeCare home"
            >
              <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
                <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
                </svg>
              </div>
              <span className="hidden sm:inline text-[1.05rem] font-bold font-brand text-primary tracking-tight">
                Home<span className="text-brand">Care</span>
              </span>
            </Link>

            {/* Divider — desktop only */}
            <div className="hidden lg:block w-px h-6 bg-border-default" />

            {/* Location selector — all screens, styled differently */}
            <button
              type="button"
              className="flex items-center gap-1.5 min-w-0 px-1 py-1 rounded-xl hover:bg-muted transition-colors duration-150"
              aria-label="Change location"
            >
              <svg className="w-4 h-4 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="leading-tight text-left min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[.8rem] font-semibold text-primary truncate">Koramangala</p>
                  <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="hidden sm:block text-[.65rem] text-muted max-w-[160px] truncate">Bangalore, 5th Block</p>
              </div>
            </button>
          </div>

          {/* Center zone — Search with live results */}
          <div className="hidden sm:block w-full max-w-md mx-auto">
            <SearchBar inputId="navbar-search-desktop" onNavigate={() => {}} />
          </div>

          {/* Mobile: search icon in center zone */}
          <div className="flex sm:hidden justify-center">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary hover:bg-muted transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
              aria-label="Open search"
              aria-expanded={mobileSearchOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Right zone — Actions */}
          <div className="flex items-center gap-2 shrink-0 justify-end">
            <button
              type="button"
              onClick={toggleCartDrawer}
              className="relative w-11 h-11 rounded-full bg-muted flex items-center justify-center text-secondary hover:bg-muted/80 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(109,40,217,0.22)]"
              aria-label={cartLabel}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              {cartCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 bg-error text-white text-[.6rem] font-extrabold min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center border-2 border-white ${badgeBounce ? 'badge-bounce' : ''}`}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {authLoading && (
              <div className="hidden sm:flex items-center">
                <div className="w-11 h-11 rounded-full bg-muted animate-pulse" />
              </div>
            )}

            {!authLoading && isAuthenticated && user && (
              <div className="relative hidden sm:block" ref={avatarMenuRef}>
                <button
                  type="button"
                  onClick={() => setAvatarMenuOpen(v => !v)}
                  className="flex w-10 h-10 rounded-full items-center justify-center hover:ring-2 hover:ring-brand/20 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 overflow-hidden"
                  aria-label="Open user menu"
                  aria-expanded={avatarMenuOpen}
                  aria-haspopup="menu"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full ring-1 ring-border-default" />
                  ) : (
                    <span className="text-[.7rem] font-bold text-white bg-brand w-full h-full flex items-center justify-center rounded-full">
                      {getInitials(user.name)}
                    </span>
                  )}
                </button>

                {avatarMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-[220px] rounded-2xl overflow-hidden scale-in"
                    role="menu"
                    aria-label="User menu"
                    style={{
                      background: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(20px) saturate(1.6)',
                      WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.5)',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* User header */}
                    <div className="flex items-center gap-2.5 px-3.5 pt-3.5 pb-3">
                      <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center shrink-0">
                        <span className="text-[.65rem] font-bold text-white">{getInitials(user.name)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[.8rem] font-semibold text-primary truncate leading-tight">{user.name}</p>
                        <p className="text-[.65rem] text-muted truncate leading-tight mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    <div className="h-px mx-3" style={{ background: 'rgba(0,0,0,0.06)' }} />

                    {/* Menu items */}
                    <div className="py-1 px-1.5">
                      {[
                        { to: '/app/bookings', label: 'My Bookings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                        { to: '/app/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                        { to: '/app/wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                        { to: '/app/support', label: 'Support', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setAvatarMenuOpen(false)}
                          role="menuitem"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-[.8rem] font-medium text-secondary rounded-lg hover:bg-brand-soft/50 hover:text-primary transition-colors duration-150"
                        >
                          <svg className="w-[15px] h-[15px] text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                          </svg>
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="h-px mx-3" style={{ background: 'rgba(0,0,0,0.06)' }} />

                    {/* Sign out */}
                    <div className="py-1 px-1.5 pb-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMenuOpen(false)
                          useAuthStore.getState().logout()
                          navigate('/app')
                          showToast('Signed out successfully', 'success')
                        }}
                        role="menuitem"
                        className="flex items-center gap-2.5 w-full px-2.5 py-2 text-[.8rem] font-medium text-error/80 rounded-lg hover:bg-error/5 hover:text-error transition-colors duration-150"
                      >
                        <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!authLoading && !isAuthenticated && (
              <Link
                to="/login"
                className="hidden sm:inline-flex btn-base btn-primary px-5 py-2 text-[.8rem]"
              >
                Log in
              </Link>
            )}
          </div>
        </div>

        <NavbarCategoryChips />
      </nav>

      {mobileSearchOpen && (
        <>
          <button
            type="button"
            className="nav-search-overlay-backdrop sm:hidden"
            aria-label="Close search"
            onClick={() => setMobileSearchOpen(false)}
          />
          <div className="fixed left-0 right-0 top-16 z-[49] sm:hidden px-4 py-3 bg-white border-b border-default shadow-md nav-search-panel">
            <div className="flex gap-2 items-start">
              <div className="flex-1 min-w-0">
                <SearchBar inputId="navbar-search-mobile" onNavigate={() => setMobileSearchOpen(false)} />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="shrink-0 w-11 h-11 rounded-full bg-muted flex items-center justify-center text-secondary hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(109,40,217,0.22)]"
                aria-label="Close search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
