import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { useAuthStore } from './store/useAuthStore'
import { ErrorBoundary } from './components/common/ErrorBoundary'

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  useEffect(() => {
    // Background refresh of the persisted session once the store has rehydrated.
    // Persisted state already drives auth gating; this just keeps `user` fresh.
    if (hasHydrated) {
      void restoreSession()
    }
  }, [hasHydrated, restoreSession])

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
