import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never {
  throw new Error('kaboom')
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // React logs caught errors via console.error; silence for clean output.
    consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>safe content</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('shows the default fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('uses a custom fallback when provided', () => {
    render(
      <ErrorBoundary
        fallback={(error) => <div>custom: {error.message}</div>}
      >
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('custom: kaboom')).toBeInTheDocument()
  })

  it('clicking Try again clears the error and re-renders children', () => {
    let shouldThrow = true
    function Recoverable() {
      if (shouldThrow) throw new Error('first render fails')
      return <p>recovered</p>
    }

    render(
      <ErrorBoundary>
        <Recoverable />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByText('recovered')).toBeInTheDocument()
  })
})
