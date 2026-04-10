import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { LOGIN_ROUTES } from '../../lib/auth'
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
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const role = useAuthStore((s) => s.role)
  const location = useLocation()

  // Wait for the persisted store to rehydrate before deciding anything,
  // otherwise a refresh redirects to /login before state is restored.
  if (!hasHydrated || isLoading) {
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

  // Wrong role — redirect to the requested portal login so users can switch
  // accounts without first logging out of the current role session.
  if (role !== requiredRole) {
    const loginUrl = `${LOGIN_ROUTES[requiredRole]}?returnTo=${encodeURIComponent(location.pathname)}`
    return <Navigate to={loginUrl} replace />
  }

  return <>{children}</>
}
