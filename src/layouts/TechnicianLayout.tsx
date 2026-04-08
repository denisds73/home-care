import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import Toast from '../components/common/Toast'
import ScrollToTop from '../components/common/ScrollToTop'

interface TabItem {
  to: string
  label: string
  icon: React.ReactNode
  end?: boolean
}

const TABS: TabItem[] = [
  {
    to: '/technician',
    end: true,
    label: 'Home',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
        />
      </svg>
    ),
  },
  {
    to: '/technician/jobs',
    label: 'Jobs',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    to: '/technician/profile',
    label: 'Profile',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
]

export default function TechnicianLayout() {
  const userName = useAuthStore((s) => s.user?.name)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <ScrollToTop />

      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-brand"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
              />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="font-brand text-sm font-bold text-primary">
                HomeCare
              </span>
              <span className="text-[10px] text-muted uppercase tracking-widest">
                Technician
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-xs text-secondary hidden sm:inline">
                {userName}
              </span>
            )}
            <button
              type="button"
              onClick={logout}
              className="btn-base btn-ghost text-xs px-3 py-1 min-h-[36px]"
              aria-label="Sign out"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Technician navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100"
      >
        <div className="max-w-2xl mx-auto grid grid-cols-3">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              aria-label={tab.label}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-xs font-semibold ${
                  isActive ? 'text-brand' : 'text-muted'
                }`
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <Toast />
    </div>
  )
}
