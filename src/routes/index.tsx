/* eslint-disable react-refresh/only-export-components -- router module exports lazy page refs and small route helpers */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import CustomerLayout from '../layouts/CustomerLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import { useAuthStore } from '../store/useAuthStore'
import { DASHBOARD_ROUTES } from '../lib/auth'

// ----- Eager-loaded pages (critical path) -----
import HomePage from '../pages/HomePage'
import CategoryPage from '../pages/CategoryPage'

// ----- Lazy-loaded pages -----
const BookingPage = lazy(() => import('../pages/BookingPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

// Auth pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const VendorLoginPage = lazy(() => import('../pages/auth/VendorLoginPage'))
const AdminLoginPage = lazy(() => import('../pages/auth/AdminLoginPage'))

// Customer pages
const MyBookingsPage = lazy(() => import('../pages/customer/MyBookingsPage'))
const BookingDetailPage = lazy(() => import('../pages/customer/BookingDetailPage'))
const ProfilePage = lazy(() => import('../pages/customer/ProfilePage'))
const WalletPage = lazy(() => import('../pages/customer/WalletPage'))
const NotificationsPage = lazy(() => import('../pages/customer/NotificationsPage'))
const SupportPage = lazy(() => import('../pages/customer/SupportPage'))

// Vendor pages
const VendorDashboardPage = lazy(() => import('../pages/vendor/VendorDashboardPage'))
const VendorRequestsPage = lazy(() => import('../pages/vendor/VendorRequestsPage'))
const VendorRequestDetailPage = lazy(() => import('../pages/vendor/VendorRequestDetailPage'))
const VendorProfilePage = lazy(() => import('../pages/vendor/VendorProfilePage'))

// Admin pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const BookingManagementPage = lazy(() => import('../pages/admin/BookingManagementPage'))
const CatalogPage = lazy(() => import('../pages/admin/CatalogPage'))
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'))
const FinancePage = lazy(() => import('../pages/admin/FinancePage'))
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'))
const VendorListPage = lazy(() => import('../pages/admin/VendorListPage'))
const VendorCreatePage = lazy(() => import('../pages/admin/VendorCreatePage'))
const VendorDetailPage = lazy(() => import('../pages/admin/VendorDetailPage'))

// Lazy layouts (not on critical path)
const VendorLayout = lazy(() => import('../layouts/VendorLayout'))
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

function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.role)

  if (isAuthenticated && role) {
    return <Navigate to={DASHBOARD_ROUTES[role]} replace />
  }
  return <Navigate to="/app" replace />
}

export const router = createBrowserRouter([
  // ----- Root redirect (role-aware) -----
  { path: '/', element: <RootRedirect /> },

  // ----- Auth pages (no layout) -----
  { path: '/login', element: withSuspense(LoginPage) },
  { path: '/vendor/login', element: withSuspense(VendorLoginPage) },
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
      {
        path: 'bookings/:id',
        element: (
          <ProtectedRoute requiredRole="customer">
            {withSuspense(BookingDetailPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute requiredRole="customer">
            {withSuspense(ProfilePage)}
          </ProtectedRoute>
        ),
      },
      { path: 'wallet', element: withSuspense(WalletPage) },
      { path: 'notifications', element: withSuspense(NotificationsPage) },
      { path: 'support', element: withSuspense(SupportPage) },
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },

  // ----- Vendor routes (protected) -----
  {
    path: '/vendor',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute requiredRole="vendor">
          <VendorLayout />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: withSuspense(VendorDashboardPage) },
      { path: 'requests', element: withSuspense(VendorRequestsPage) },
      { path: 'requests/:id', element: withSuspense(VendorRequestDetailPage) },
      { path: 'profile', element: withSuspense(VendorProfilePage) },
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
      { path: 'vendors', element: withSuspense(VendorListPage) },
      { path: 'vendors/new', element: withSuspense(VendorCreatePage) },
      { path: 'vendors/:id', element: withSuspense(VendorDetailPage) },
      { path: 'finance', element: withSuspense(FinancePage) },
      { path: 'settings', element: withSuspense(SettingsPage) },
    ],
  },

  // ----- Legacy redirects -----
  { path: '/services', element: <Navigate to="/app" replace /> },
  { path: '/services/:categoryId', element: <LegacyServiceRedirect /> },
])
