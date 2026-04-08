import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuthStore } from '../../store/useAuthStore'
import type { Role } from '../../types/domain'

function setAuthState(patch: {
  isAuthenticated: boolean
  hasHydrated: boolean
  isLoading: boolean
  role: Role | null
}) {
  useAuthStore.setState({
    ...patch,
    user: patch.role
      ? { id: 'u-1', name: 'Demo', email: 'demo@demo.com', role: patch.role }
      : null,
    token: patch.isAuthenticated ? 'fake-token' : null,
    error: null,
  })
}

function renderWithRouter(
  initialPath: string,
  requiredRole: Role,
  child: React.ReactNode,
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/vendor"
          element={
            <ProtectedRoute requiredRole={requiredRole}>{child}</ProtectedRoute>
          }
        />
        <Route path="/vendor/login" element={<div>vendor-login-page</div>} />
        <Route path="/admin/login" element={<div>admin-login-page</div>} />
        <Route path="/admin" element={<div>admin-dashboard</div>} />
        <Route path="/app" element={<div>customer-dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  setAuthState({
    isAuthenticated: false,
    hasHydrated: true,
    isLoading: false,
    role: null,
  })
})

describe('ProtectedRoute', () => {
  it('shows a loader while the store has not hydrated', () => {
    setAuthState({
      isAuthenticated: false,
      hasHydrated: false,
      isLoading: false,
      role: null,
    })
    renderWithRouter('/vendor', 'vendor', <div>secret</div>)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('redirects unauthenticated users to the role-specific login', () => {
    renderWithRouter('/vendor', 'vendor', <div>secret</div>)
    expect(screen.getByText('vendor-login-page')).toBeInTheDocument()
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('redirects wrong-role users to their own dashboard', () => {
    setAuthState({
      isAuthenticated: true,
      hasHydrated: true,
      isLoading: false,
      role: 'admin',
    })
    renderWithRouter('/vendor', 'vendor', <div>secret</div>)
    expect(screen.getByText('admin-dashboard')).toBeInTheDocument()
  })

  it('renders children when the role matches', () => {
    setAuthState({
      isAuthenticated: true,
      hasHydrated: true,
      isLoading: false,
      role: 'vendor',
    })
    renderWithRouter('/vendor', 'vendor', <div>secret</div>)
    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('redirects customer trying to access admin area to customer dashboard', () => {
    setAuthState({
      isAuthenticated: true,
      hasHydrated: true,
      isLoading: false,
      role: 'customer',
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <div>admin-only</div>
              </ProtectedRoute>
            }
          />
          <Route path="/app" element={<div>customer-dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('customer-dashboard')).toBeInTheDocument()
  })
})
