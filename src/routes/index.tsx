/* eslint-disable react-refresh/only-export-components -- router module exports lazy page refs and small route helpers */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import CustomerLayout from '../layouts/CustomerLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'

// ----- Eager-loaded pages (critical path) -----
import HomePage from '../pages/HomePage'
import CategoryPage from '../pages/CategoryPage'

// ----- Lazy-loaded pages -----
const BookingPage = lazy(() => import('../pages/BookingPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

// Auth pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const PartnerLoginPage = lazy(() => import('../pages/auth/PartnerLoginPage'))
const AdminLoginPage = lazy(() => import('../pages/auth/AdminLoginPage'))

// Customer pages
const MyBookingsPage = lazy(() => import('../pages/customer/MyBookingsPage'))
const ProfilePage = lazy(() => import('../pages/customer/ProfilePage'))
const WalletPage = lazy(() => import('../pages/customer/WalletPage'))
const NotificationsPage = lazy(() => import('../pages/customer/NotificationsPage'))
const SupportPage = lazy(() => import('../pages/customer/SupportPage'))

// Partner pages
const PartnerDashboardPage = lazy(() => import('../pages/partner/PartnerDashboardPage'))
const JobsPage = lazy(() => import('../pages/partner/JobsPage'))
const EarningsPage = lazy(() => import('../pages/partner/EarningsPage'))
const SchedulePage = lazy(() => import('../pages/partner/SchedulePage'))
const PartnerProfilePage = lazy(() => import('../pages/partner/PartnerProfilePage'))
const PartnerSupportPage = lazy(() => import('../pages/partner/PartnerSupportPage'))

// Admin pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const BookingManagementPage = lazy(() => import('../pages/admin/BookingManagementPage'))
const CatalogPage = lazy(() => import('../pages/admin/CatalogPage'))
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'))
const PartnerManagementPage = lazy(() => import('../pages/admin/PartnerManagementPage'))
const FinancePage = lazy(() => import('../pages/admin/FinancePage'))
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'))

// Lazy layouts (not on critical path)
const PartnerLayout = lazy(() => import('../layouts/PartnerLayout'))
const AdminLayout = lazy(() => import('../layouts/AdminLayout'))

// ----- Loading fallback -----
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 border-3 border-gray-200 rounded-full"
          style={{
            animation: 'spin .8s linear infinite',
            borderTopColor: 'var(--color-primary)',
          }}
        />
        <p className="text-sm text-muted font-medium">Loading...</p>
      </div>
    </div>
  )
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

function LegacyServiceRedirect() {
  const { categoryId } = useParams<{ categoryId: string }>()
  return <Navigate to={categoryId ? `/app/services/${categoryId}` : '/app'} replace />
}

export const router = createBrowserRouter([
  // ----- Root redirect -----
  { path: '/', element: <Navigate to="/app" replace /> },

  // ----- Auth pages (no layout) -----
  { path: '/login', element: withSuspense(LoginPage) },
  { path: '/partner/login', element: withSuspense(PartnerLoginPage) },
  { path: '/admin/login', element: withSuspense(AdminLoginPage) },

  // ----- Customer routes -----
  {
    path: '/app',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services/:categoryId', element: <CategoryPage /> },
      { path: 'booking', element: withSuspense(BookingPage) },
      { path: 'bookings', element: withSuspense(MyBookingsPage) },
      { path: 'profile', element: withSuspense(ProfilePage) },
      { path: 'wallet', element: withSuspense(WalletPage) },
      { path: 'notifications', element: withSuspense(NotificationsPage) },
      { path: 'support', element: withSuspense(SupportPage) },
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },

  // ----- Partner routes (protected) -----
  {
    path: '/partner',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute requiredRole="partner">
          <PartnerLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: withSuspense(PartnerDashboardPage) },
      { path: 'jobs', element: withSuspense(JobsPage) },
      { path: 'earnings', element: withSuspense(EarningsPage) },
      { path: 'schedule', element: withSuspense(SchedulePage) },
      { path: 'profile', element: withSuspense(PartnerProfilePage) },
      { path: 'support', element: withSuspense(PartnerSupportPage) },
    ],
  },

  // ----- Admin routes (protected) -----
  {
    path: '/admin',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: withSuspense(AdminDashboardPage) },
      { path: 'bookings', element: withSuspense(BookingManagementPage) },
      { path: 'catalog', element: withSuspense(CatalogPage) },
      { path: 'users', element: withSuspense(UserManagementPage) },
      { path: 'partners', element: withSuspense(PartnerManagementPage) },
      { path: 'finance', element: withSuspense(FinancePage) },
      { path: 'settings', element: withSuspense(SettingsPage) },
    ],
  },

  // ----- Legacy redirects -----
  { path: '/services', element: <Navigate to="/app" replace /> },
  { path: '/services/:categoryId', element: <LegacyServiceRedirect /> },
])
