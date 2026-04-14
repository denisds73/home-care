import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../../store/useStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useCustomerNotifications } from '../../hooks/useCustomerNotifications'

interface TabItem {
  id: string
  label: string
  icon: ReactElement
  isCart?: boolean
}

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const toggleCartDrawer = useStore(s => s.toggleCartDrawer)
  const cartCount = useStore(s => s.getCartCount())
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const { unreadCount } = useCustomerNotifications()
  const prevCartRef = useRef(cartCount)
  const [cartPulse, setCartPulse] = useState(false)

  useEffect(() => {
    const prev = prevCartRef.current
    prevCartRef.current = cartCount
    if (cartCount <= prev) return
    queueMicrotask(() => setCartPulse(true))
  }, [cartCount])

  useEffect(() => {
    if (!cartPulse) return
    const t = window.setTimeout(() => setCartPulse(false), 600)
    return () => window.clearTimeout(t)
  }, [cartPulse])

  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
        />
      ),
    },
    {
      id: 'services',
      label: 'Services',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      ),
    },
    {
      id: 'cart',
      label: 'Cart',
      isCart: true,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      ),
    },
    {
      id: 'offers',
      label: 'Offers',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      ),
    },
    {
      id: 'account',
      label: 'Account',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
    },
  ]

  if (isAuthenticated) {
    tabs[3] = {
      id: 'notifications',
      label: 'Alerts',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      ),
    }
  }

  const handleClick = (tab: TabItem) => {
    if (tab.id === 'cart') {
      toggleCartDrawer()
      return
    }
    if (tab.id === 'home') {
      navigate('/app')
      return
    }
    if (tab.id === 'services') {
      navigate('/app')
      setTimeout(
        () =>
          document
            .getElementById('categorySection')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        200,
      )
      return
    }
    if (tab.id === 'notifications') {
      navigate('/app/notifications')
      return
    }
    if (tab.id === 'offers') {
      navigate('/app')
      setTimeout(
        () =>
          document
            .getElementById('offersSection')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
        200,
      )
      return
    }
    if (tab.id === 'account') {
      useStore.setState({ accountSheetOpen: true })
    }
  }

  const isActive = (id: string) => {
    if (
      id === 'home' &&
      (location.pathname === '/app' || location.pathname === '/app/')
    )
      return true
    if (id === 'services' && location.pathname.startsWith('/app/services'))
      return true
    if (id === 'notifications' && location.pathname.startsWith('/app/notifications'))
      return true
    return false
  }

  return (
    <div
      className="sm:hidden fixed left-0 right-0 z-40 nav-floating-bar glass px-1 pt-1.5 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))]"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex justify-around items-end min-h-[52px]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleClick(tab)}
            aria-label={
              tab.isCart
                ? cartCount > 0
                  ? `Open shopping cart, ${cartCount} items`
                  : 'Open shopping cart'
                : undefined
            }
            className={`flex flex-col items-center gap-0.5 px-1.5 min-w-[44px] min-h-[44px] justify-end pb-0.5 text-[.65rem] font-semibold transition relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(109,40,217,0.22)] rounded-lg ${
              isActive(tab.id) ? 'text-brand' : 'text-muted'
            }`}
          >
            {tab.isCart ? (
              <div
                className={`bg-brand rounded-2xl w-12 h-12 flex items-center justify-center -mt-5 mb-0 shadow-[0_4px_12px_rgba(109,40,217,.32)] relative ${cartPulse ? 'animate-pulse' : ''}`}
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth="2"
                  className="w-6 h-6"
                  aria-hidden
                >
                  {tab.icon}
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-0.5 bg-error text-white text-[.55rem] font-extrabold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
            ) : (
              <>
                <span className="relative">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-6 h-6"
                    aria-hidden
                  >
                    {tab.icon}
                  </svg>
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full" aria-hidden />
                  )}
                </span>
                {isActive(tab.id) ? (
                  <span
                    className="nav-tab-dot scale-in mt-0.5"
                    aria-hidden
                  />
                ) : (
                  <span className="h-1.5 w-1.5 mt-0.5" aria-hidden />
                )}
                <span className="leading-none">{tab.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
