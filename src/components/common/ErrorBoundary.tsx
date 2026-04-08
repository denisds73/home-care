import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional custom fallback — receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Top-level error boundary that catches render-time exceptions anywhere in
 * the React tree and shows a recoverable fallback. Wired around the router in
 * App.tsx so a crash in a lazy-loaded page never leaves the user on a blank
 * screen.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep stack traces discoverable in devtools; hook a telemetry sink here later.
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    const { children, fallback } = this.props

    if (!error) return children
    if (fallback) return fallback(error, this.handleReset)

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="glass-card p-6 md:p-8 max-w-md w-full text-center space-y-4">
          <div>
            <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
              Something went wrong
            </h1>
            <p className="text-sm text-muted mt-2">
              The page crashed unexpectedly. You can try again, or head back to
              the home page.
            </p>
          </div>
          {import.meta.env.DEV && (
            <pre className="text-[11px] text-left text-error bg-error/10 p-3 rounded-lg overflow-auto max-h-40">
              {error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              type="button"
              onClick={this.handleReset}
              className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
            >
              Try again
            </button>
            <a
              href="/"
              className="btn-base btn-ghost text-sm px-5 py-2 min-h-[44px] inline-flex items-center justify-center"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
