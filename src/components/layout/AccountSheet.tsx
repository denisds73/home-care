import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { useAuthStore } from '../../store/useAuthStore'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const sheetLinkClass =
  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left text-primary hover:bg-muted transition min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(109,40,217,0.22)]'

export default function AccountSheet() {
  const accountSheetOpen = useStore(s => s.accountSheetOpen)
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.role)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const logout = useAuthStore(s => s.logout)
  const showToast = useStore(s => s.showToast)
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

  const close = () => useStore.setState({ accountSheetOpen: false })

  useEffect(() => {
    if (!accountSheetOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [accountSheetOpen])

  useEffect(() => {
    if (!accountSheetOpen || !panelRef.current) return
    const el = panelRef.current.querySelector<HTMLElement>(
      'a[href], button:not([disabled])',
    )
    el?.focus()
  }, [accountSheetOpen])

  if (!accountSheetOpen) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[54] bg-black/40 border-0 cursor-default p-0 m-0 w-full h-full"
        aria-label="Close account menu"
        onClick={close}
      />
      <div
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 z-[56] bg-white rounded-t-2xl border-t border-default shadow-[0_-8px_40px_rgba(0,0,0,.12)] slide-up"
        role="dialog"
        aria-modal="true"
        aria-label="Account"
      >
        <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-2 shrink-0" />
        <div className="px-5 pb-6 max-h-[min(85vh,520px)] overflow-y-auto">
          {!isAuthenticated && (
            <div className="pt-2 pb-2">
              <p className="text-sm font-semibold text-primary mb-1">Welcome</p>
              <p className="text-xs text-muted mb-4">
                Sign in to book services and manage your account.
              </p>
              <Link
                to="/login"
                onClick={close}
                className="btn-base btn-primary w-full justify-center min-h-[44px] text-sm"
              >
                Log in
              </Link>
            </div>
          )}

          {isAuthenticated && user && (
            <>
              <div className="flex items-center gap-3 mb-4 mt-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-border-default shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white bg-brand shrink-0">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-sm text-primary truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
              </div>
              <nav className="space-y-1" aria-label="Account links">
                <Link
                  to="/app/bookings"
                  onClick={close}
                  className={sheetLinkClass}
                >
                  <svg
                    className="w-5 h-5 text-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  My Bookings
                </Link>
                <Link
                  to="/app/profile"
                  onClick={close}
                  className={sheetLinkClass}
                >
                  <svg
                    className="w-5 h-5 text-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </Link>
                <Link
                  to="/app/wallet"
                  onClick={close}
                  className={sheetLinkClass}
                >
                  <svg
                    className="w-5 h-5 text-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Wallet
                </Link>
                <Link
                  to="/app/support"
                  onClick={close}
                  className={sheetLinkClass}
                >
                  <svg
                    className="w-5 h-5 text-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Support
                </Link>
              </nav>
              <div className="mt-3 pt-3 border-t border-default space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    close()
                    if (role === 'admin') navigate('/admin')
                    else navigate('/admin/login')
                  }}
                  className={sheetLinkClass}
                >
                  <svg
                    className="w-5 h-5 text-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Admin Panel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    close()
                    logout()
                    showToast('Signed out successfully', 'success')
                    navigate('/app')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left text-error hover:bg-error/5 transition min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(220,38,38,0.25)]"
                >
                  <svg
                    className="w-5 h-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
