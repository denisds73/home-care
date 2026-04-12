import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'
import type { BookingStatus } from '../../types/domain'

const CASES: { status: BookingStatus; variant: string; label: RegExp }[] = [
  { status: 'pending', variant: 'badge-warning', label: /pending/i },
  { status: 'assigned', variant: 'badge-info', label: /assigned/i },
  { status: 'accepted', variant: 'badge-info', label: /accepted/i },
  { status: 'in_progress', variant: 'badge-info', label: /in progress/i },
  { status: 'completed', variant: 'badge-success', label: /completed/i },
  { status: 'cancelled', variant: 'badge-error', label: /cancelled/i },
  { status: 'rejected', variant: 'badge-error', label: /rejected/i },
]

describe('StatusBadge', () => {
  it.each(CASES)(
    'renders $status with $variant and a human label',
    ({ status, variant, label }) => {
      render(<StatusBadge status={status} />)
      const el = screen.getByText(label)
      expect(el).toBeInTheDocument()
      expect(el).toHaveClass('badge')
      expect(el).toHaveClass(variant)
    },
  )

  it('appends custom className', () => {
    render(<StatusBadge status="pending" className="extra" />)
    const el = screen.getByText(/pending/i)
    expect(el).toHaveClass('extra')
  })
})
