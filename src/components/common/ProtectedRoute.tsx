import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import type { Role } from '../../types/domain'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: Role
}

const LOGIN_ROUTES: Record<Role, string> = {
  customer: '/login',
  partner: '/partner/login',
  admin: '/admin/login',
}

const DASHBOARD_ROUTES: Record<Role, string> = {
  customer: '/app',
  partner: '/partner',
  admin: '/admin',
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.role)
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to={LOGIN_ROUTES[requiredRole]}
        state={{ from: location }}
        replace
      />
    )
  }

  if (role !== requiredRole) {
    return <Navigate to={DASHBOARD_ROUTES[role!]} replace />
  }

  return <>{children}</>
}
