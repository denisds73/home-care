import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopBar } from './DashboardTopBar'
import Toast from '../components/common/Toast'
import ScrollToTop from '../components/common/ScrollToTop'
import { GoogleMapsProvider } from '../components/maps'
import {
  GridIcon,
  BriefcaseIcon,
  BellIcon,
  UserIcon,
} from '../components/common/Icons'
import type { NavGroup } from './DashboardSidebar'
const TECHNICIAN_NAV: NavGroup[] = [
  {
    items: [
      { icon: <GridIcon />, label: 'Dashboard', to: '/technician' },
      { icon: <BriefcaseIcon />, label: 'Jobs', to: '/technician/jobs' },
      { icon: <BellIcon />, label: 'Notifications', to: '/technician/notifications' },
      { icon: <UserIcon />, label: 'Profile', to: '/technician/profile' },
    ],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/technician': 'Dashboard',
  '/technician/jobs': 'Assigned Jobs',
  '/technician/notifications': 'Notifications',
  '/technician/profile': 'Profile',
}

const logo = (
  <>
    <svg
      className="w-7 h-7 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="#14B8A6"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766m-3.704 3.796l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63"
      />
    </svg>
    <span className="sidebar-label text-white text-sm font-bold">
      HomeCare <span className="text-xs font-normal opacity-60">Technician</span>
    </span>
  </>
)

export default function TechnicianLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'Technician'

  return (
    <GoogleMapsProvider>
      <div className="theme-partner">
        <ScrollToTop />
        <DashboardSidebar
          groups={TECHNICIAN_NAV}
          logo={logo}
          bottomItems={[]}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="dashboard-content">
          <DashboardTopBar
            title={title}
            onMenuClick={() => setMobileOpen(true)}
            vendorNotifications={{
              notificationsPath: '/technician/notifications',
              bookingDetailPath: (id) => `/technician/jobs/${id}`,
            }}
          />
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
        <Toast />
      </div>
    </GoogleMapsProvider>
  )
}
