import { Navigate, useLocation } from 'react-router-dom'
import useStore from '../../store/useStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const isLoggedIn = useStore(s => s.isLoggedIn)
  const adminUnlocked = useStore(s => s.adminUnlocked)
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !adminUnlocked) {
    return <Navigate to="/admin/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}
