import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopBar } from './DashboardTopBar'
import Toast from '../components/common/Toast'
import ScrollToTop from '../components/common/ScrollToTop'
import {
  GridIcon,
  BriefcaseIcon,
  DollarIcon,
  CalendarIcon,
  UserIcon,
  HelpIcon,
} from '../components/common/Icons'
import type { NavGroup } from './DashboardSidebar'

const PARTNER_NAV: NavGroup[] = [
  {
    items: [
      { icon: <GridIcon />, label: 'Dashboard', to: '/partner' },
      { icon: <BriefcaseIcon />, label: 'My Jobs', to: '/partner/jobs' },
      { icon: <DollarIcon />, label: 'Earnings', to: '/partner/earnings' },
      { icon: <CalendarIcon />, label: 'Schedule', to: '/partner/schedule' },
      { icon: <UserIcon />, label: 'Profile', to: '/partner/profile' },
    ],
  },
]

const PARTNER_BOTTOM = [
  { icon: <HelpIcon />, label: 'Support', to: '/partner/support' },
]

const PAGE_TITLES: Record<string, string> = {
  '/partner': 'Dashboard',
  '/partner/jobs': 'My Jobs',
  '/partner/earnings': 'Earnings',
  '/partner/schedule': 'Schedule',
  '/partner/profile': 'Profile',
  '/partner/support': 'Support',
}

const logo = (
  <>
    <svg
      className="w-7 h-7 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="#14B8A6"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
      />
    </svg>
    <span className="sidebar-label text-white text-sm font-bold">
      HomeCare <span className="text-xs font-normal opacity-60">Partner</span>
    </span>
  </>
)

export default function PartnerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Partner'

  return (
    <div className="theme-partner">
      <ScrollToTop />
      <DashboardSidebar
        groups={PARTNER_NAV}
        logo={logo}
        bottomItems={PARTNER_BOTTOM}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="dashboard-content">
        <DashboardTopBar
          title={title}
          onMenuClick={() => setMobileOpen(true)}
          availabilityToggle={{
            isOnline,
            onToggle: () => setIsOnline((v) => !v),
          }}
        />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}
