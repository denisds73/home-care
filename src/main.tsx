import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

// Catch promise rejections that escape a component's try/catch so they surface
// as a user-visible message instead of a silent console warning. The api.ts
// fetch wrapper already throws typed ApiError; anything that reaches here is
// either a bug or a network issue we haven't categorised yet.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // eslint-disable-next-line no-console
    console.error('[unhandledrejection]', event.reason)
    // Best-effort toast; import lazily so we don't widen the entry bundle
    // and so tests can run without the full store graph loaded.
    void import('./store/useStore').then(({ default: useStore }) => {
      const showToast = useStore.getState().showToast
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : 'Something went wrong. Please try again.'
      showToast(message, 'danger')
    })
  })
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
