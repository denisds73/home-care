import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BookingManagementPage from './BookingManagementPage'
import { bookingService } from '../../services/bookingService'
import { vendorService } from '../../services/vendorService'

vi.mock('../../services/bookingService', () => ({
  bookingService: {
    listForAdmin: vi.fn(),
    assign: vi.fn(),
  },
}))

vi.mock('../../services/vendorService', () => ({
  vendorService: {
    listActive: vi.fn(() => Promise.resolve([])),
  },
}))

vi.mock('../../store/useStore', () => ({
  default: (selector: (s: { showToast: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ showToast: vi.fn() }),
}))

const listForAdmin = vi.mocked(bookingService.listForAdmin)

describe('BookingManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listForAdmin.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    })
  })

  it('initializes status filter from URL and loads pending bookings', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/bookings?status=pending']}>
        <Routes>
          <Route path="/admin/bookings" element={<BookingManagementPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const select = await screen.findByLabelText(/filter by status/i)
    expect(select).toHaveValue('pending')

    await waitFor(() => {
      expect(listForAdmin).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending', page: 1 }),
      )
    })
    expect(vendorService.listActive).toHaveBeenCalled()
  })
})
