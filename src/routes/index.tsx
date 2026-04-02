import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'

// ----- Eager-loaded pages (critical path) -----
import HomePage from '../pages/HomePage'
import CategoryPage from '../pages/CategoryPage'

// ----- Lazy-loaded pages -----
const BookingPage = lazy(() => import('../pages/BookingPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const AdminAuthPage = lazy(() => import('../pages/admin/AdminAuthPage'))

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // ----- Home -----
      { index: true, element: <HomePage /> },

      // ----- Service browsing -----
      { path: 'services/:categoryId', element: <CategoryPage /> },

      // ----- Booking flow -----
      { path: 'booking', element: withSuspense(BookingPage) },

      // ----- Auth -----
      { path: 'login', element: withSuspense(LoginPage) },

      // ----- Catch-all (inside layout) -----
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },

  // ----- Admin (separate layout) -----
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: withSuspense(AdminDashboardPage) },
      { path: 'auth', element: withSuspense(AdminAuthPage) },
    ],
  },

  // ----- Redirect legacy paths -----
  { path: '/services', element: <Navigate to="/" replace /> },
])
