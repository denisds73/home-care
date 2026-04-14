import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopBar } from './DashboardTopBar'
import Toast from '../components/common/Toast'
import ScrollToTop from '../components/common/ScrollToTop'
import {
  GridIcon,
  BriefcaseIcon,
  UserIcon,
  UsersIcon,
  BellIcon,
} from '../components/common/Icons'
import type { NavGroup } from './DashboardSidebar'

const VENDOR_NAV: NavGroup[] = [
  {
    items: [
      { icon: <GridIcon />, label: 'Dashboard', to: '/vendor' },
      { icon: <BriefcaseIcon />, label: 'Requests', to: '/vendor/requests' },
      { icon: <UsersIcon />, label: 'Technicians', to: '/vendor/technicians' },
      { icon: <BellIcon />, label: 'Notifications', to: '/vendor/notifications' },
      { icon: <UserIcon />, label: 'Profile', to: '/vendor/profile' },
    ],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/vendor': 'Dashboard',
  '/vendor/requests': 'Service Requests',
  '/vendor/technicians': 'Technicians',
  '/vendor/technicians/new': 'Add Technician',
  '/vendor/notifications': 'Notifications',
  '/vendor/profile': 'Company Profile',
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
      HomeCare <span className="text-xs font-normal opacity-60">Vendor</span>
    </span>
  </>
)

export default function VendorLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title =
    PAGE_TITLES[location.pathname] ??
    (location.pathname.startsWith('/vendor/requests') ? 'Service Requests' : 'Vendor')

  return (
    <div className="theme-partner">
      <ScrollToTop />
      <DashboardSidebar
        groups={VENDOR_NAV}
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
            notificationsPath: '/vendor/notifications',
            bookingDetailPath: (id) => `/vendor/requests/${id}`,
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
