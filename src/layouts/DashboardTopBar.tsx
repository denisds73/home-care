import { memo } from 'react'
import { useAuthStore } from '../store/useAuthStore'

interface DashboardTopBarProps {
  title: string
  onMenuClick: () => void
  availabilityToggle?: {
    isOnline: boolean
    onToggle: () => void
  }
}

export const DashboardTopBar = memo(
  ({ title, onMenuClick, availabilityToggle }: DashboardTopBarProps) => {
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)

    return (
      <div className="dashboard-topbar">
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <svg
            className="w-5 h-5 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Page title */}
        <h1 className="text-base font-semibold text-primary flex-1">{title}</h1>

        {/* Availability toggle (partner only) */}
        {availabilityToggle && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary hidden sm:inline">
              {availabilityToggle.isOnline ? 'Online' : 'Offline'}
            </span>
            <button
              className={`toggle-track${availabilityToggle.isOnline ? ' on' : ''}`}
              onClick={availabilityToggle.onToggle}
              aria-label={`Set ${availabilityToggle.isOnline ? 'offline' : 'online'}`}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        )}

        {/* Notifications bell */}
        <button className="p-1.5 rounded-lg hover:bg-muted transition" aria-label="Notifications">
          <svg
            className="w-5 h-5 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* User avatar + logout */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-soft flex items-center justify-center text-xs font-bold text-brand">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-primary hidden sm:inline">
            {user?.name || 'User'}
          </span>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-muted transition"
            aria-label="Logout"
          >
            <svg
              className="w-4 h-4 text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  },
)

DashboardTopBar.displayName = 'DashboardTopBar'
