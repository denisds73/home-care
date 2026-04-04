import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { LOGIN_ROUTES, DASHBOARD_ROUTES } from '../../lib/auth'
import type { Role } from '../../types/domain'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: Role
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const role = useAuthStore((s) => s.role)
  const location = useLocation()

  // Show loading spinner while auth session is being restored
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-brand"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated — redirect to role-specific login with returnTo param
  if (!isAuthenticated) {
    const loginUrl = `${LOGIN_ROUTES[requiredRole]}?returnTo=${encodeURIComponent(location.pathname)}`
    return <Navigate to={loginUrl} replace />
  }

  // Wrong role — redirect to their own dashboard
  if (role !== requiredRole) {
    return <Navigate to={DASHBOARD_ROUTES[role!]} replace />
  }

  return <>{children}</>
}
