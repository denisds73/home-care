import { memo, type ReactNode } from 'react'

export type TabId =
  | 'personal'
  | 'addresses'
  | 'payments'
  | 'preferences'
  | 'security'

interface TabDef {
  id: TabId
  label: string
  icon: ReactNode
}

const TABS: TabDef[] = [
  {
    id: 'personal',
    label: 'Personal',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0116 0" />
      </svg>
    ),
  },
  {
    id: 'addresses',
    label: 'Addresses',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.14.36.22.75.22 1.15" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
]

interface ProfileTabsProps {
  active: TabId
  onChange: (id: TabId) => void
}

export const ProfileTabs = memo(({ active, onChange }: ProfileTabsProps) => {
  return (
    <div
      className="sticky top-16 z-20 border-b border-default"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <nav
        className="max-w-5xl mx-auto px-4 md:px-6"
        aria-label="Profile sections"
      >
        <ul className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          {TABS.map((tab) => {
            const isActive = tab.id === active
            return (
              <li key={tab.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onChange(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className="min-h-[44px] px-4 py-2 rounded-full font-semibold text-sm transition-all inline-flex items-center gap-2 border"
                  style={
                    isActive
                      ? {
                          background: 'var(--color-primary)',
                          color: 'var(--color-card)',
                          borderColor: 'var(--color-primary)',
                          boxShadow: '0 4px 14px rgba(109,40,217,0.25)',
                        }
                      : {
                          background: 'transparent',
                          color: 'var(--color-text-secondary)',
                          borderColor: 'var(--color-border)',
                        }
                  }
                >
                  {tab.icon}
                  {tab.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
})

ProfileTabs.displayName = 'ProfileTabs'
