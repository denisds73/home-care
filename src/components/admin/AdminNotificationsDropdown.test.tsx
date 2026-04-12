import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AdminNotificationsDropdown } from './AdminNotificationsDropdown'
import { notificationService } from '../../services/notificationService'
import { bookingService } from '../../services/bookingService'
import type { Booking } from '../../types/domain'

vi.mock('../../services/notificationService', () => ({
  notificationService: {
    getAll: vi.fn(),
    markAsRead: vi.fn(),
  },
}))

vi.mock('../../services/bookingService', () => ({
  bookingService: {
    listForAdmin: vi.fn(),
  },
}))

const pendingBooking: Booking = {
  booking_id: 'bk-pending-1',
  customer_name: 'Test Customer',
  phone: '9999999999',
  address: 'Addr',
  lat: 0,
  lng: 0,
  category: 'ac',
  service_id: 1,
  service_name: 'AC Service',
  price: 1000,
  services_list: [],
  preferred_date: '2026-04-12',
  time_slot: '9AM-12PM',
  payment_mode: 'PAY_NOW',
  payment_status: 'SUCCESS',
  razorpay_order_id: null,
  booking_status: 'pending',
  created_at: '2026-04-01T00:00:00.000Z',
  updated_at: '2026-04-01T00:00:00.000Z',
}

function renderWithRouter() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AdminNotificationsDropdown />,
      },
      {
        path: '/admin/bookings/:id',
        element: <div data-testid="booking-detail">detail</div>,
      },
    ],
    { initialEntries: ['/'] },
  )
  const view = render(<RouterProvider router={router} />)
  return { router, ...view }
}

describe('AdminNotificationsDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(notificationService.getAll).mockResolvedValue({ data: [] })
    vi.mocked(bookingService.listForAdmin).mockResolvedValue({
      items: [pendingBooking],
      total: 1,
      page: 1,
      limit: 15,
    })
  })

  it('shows pending assignment section and navigates to booking detail', async () => {
    const user = userEvent.setup()
    const { router } = renderWithRouter()

    await waitFor(() => {
      expect(bookingService.listForAdmin).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending', limit: 15, page: 1 }),
      )
    })

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    expect(await screen.findByText(/awaiting vendor assignment/i)).toBeInTheDocument()
    expect(screen.getByText('Test Customer')).toBeInTheDocument()
    expect(screen.queryByText(/no other notifications/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^No notifications$/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /test customer/i }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/admin/bookings/bk-pending-1')
    })
    expect(screen.getByTestId('booking-detail')).toBeInTheDocument()
  })
})
