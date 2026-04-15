import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import VendorListPage from './VendorListPage'
import { vendorService } from '../../services/vendorService'

vi.mock('../../services/vendorService', () => ({
  vendorService: {
    list: vi.fn(),
  },
}))

vi.mock('../../store/useStore', () => ({
  default: (selector: (s: { showToast: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ showToast: vi.fn() }),
}))

const list = vi.mocked(vendorService.list)

describe('VendorListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Element.prototype.scrollIntoView = vi.fn()
    list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    })
  })

  it('initializes status tab from URL for pending vendors', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/vendors?status=pending']}>
        <Routes>
          <Route path="/admin/vendors" element={<VendorListPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(list).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending', page: 1 }),
      )
    })
  })

  it('updates URL when changing status tab', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/admin/vendors']}>
        <Routes>
          <Route path="/admin/vendors" element={<VendorListPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await screen.findByRole('button', { name: /all/i })
    await user.click(screen.getByRole('button', { name: /all/i }))
    await user.click(await screen.findByRole('option', { name: 'Pending' }))

    await waitFor(() => {
      expect(list).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' }),
      )
    })
  })
})
