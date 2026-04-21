import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopBar } from './DashboardTopBar'
import Toast from '../components/common/Toast'
import ScrollToTop from '../components/common/ScrollToTop'
import { GoogleMapsProvider } from '../components/maps'
import {
  GridIcon,
  ClipboardIcon,
  PackageIcon,
  TagIcon,
  UsersIcon,
  WalletIcon,
  SettingsIcon,
  BriefcaseIcon,
  BellIcon,
} from '../components/common/Icons'
import type { NavGroup } from './DashboardSidebar'

const ADMIN_NAV: NavGroup[] = [
  {
    items: [{ icon: <GridIcon />, label: 'Dashboard', to: '/admin' }],
  },
  {
    section: 'Operations',
    items: [
      { icon: <ClipboardIcon />, label: 'Bookings', to: '/admin/bookings' },
      { icon: <PackageIcon />, label: 'Catalog', to: '/admin/catalog' },
      { icon: <TagIcon />, label: 'Offers', to: '/admin/offers' },
    ],
  },
  {
    section: 'Management',
    items: [
      { icon: <UsersIcon />, label: 'Users', to: '/admin/users' },
      { icon: <BriefcaseIcon />, label: 'Vendors', to: '/admin/vendors' },
      { icon: <WalletIcon />, label: 'Finance', to: '/admin/finance' },
      { icon: <BellIcon />, label: 'Notifications', to: '/admin/notifications' },
    ],
  },
]

const ADMIN_BOTTOM = [
  { icon: <SettingsIcon />, label: 'Settings', to: '/admin/settings' },
]

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/bookings': 'Booking Management',
  '/admin/catalog': 'Service Catalog',
  '/admin/offers': 'Offers & Discounts',
  '/admin/users': 'User Management',
  '/admin/vendors': 'Vendor Onboarding',
  '/admin/finance': 'Finance & Payouts',
  '/admin/notifications': 'Notifications',
  '/admin/settings': 'Settings',
}

const logo = (
  <>
    <svg
      className="w-7 h-7 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="#6366F1"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
      />
    </svg>
    <span className="sidebar-label text-white text-sm font-bold">
      WeSorters <span className="text-xs font-normal opacity-60">Admin</span>
    </span>
  </>
)

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Admin'

  return (
    <GoogleMapsProvider>
      <div className="theme-admin">
        <ScrollToTop />
        <DashboardSidebar
          groups={ADMIN_NAV}
          logo={logo}
          bottomItems={ADMIN_BOTTOM}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="dashboard-content">
          {/* Bell polls /notifications every 30s while admin is logged in (any admin route). */}
          <DashboardTopBar
            title={title}
            onMenuClick={() => setMobileOpen(true)}
            adminNotificationsEnabled
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
