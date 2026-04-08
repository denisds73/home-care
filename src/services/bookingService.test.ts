import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the api module BEFORE importing bookingService
vi.mock('./api', () => {
  return {
    api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { api } from './api'
import { bookingService } from './bookingService'

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('bookingService.listForAdmin', () => {
  it('returns the full paginated envelope', async () => {
    mockedApi.get.mockResolvedValueOnce({
      success: true,
      data: {
        items: [{ booking_id: 'b1' }, { booking_id: 'b2' }],
        total: 2,
        page: 1,
        limit: 20,
      },
    })
    const result = await bookingService.listForAdmin()
    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(2)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  it('returns a safe empty envelope when data is missing', async () => {
    mockedApi.get.mockResolvedValueOnce({ success: true, data: null })
    const result = await bookingService.listForAdmin({ page: 3, limit: 50 })
    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
    expect(result.page).toBe(3)
    expect(result.limit).toBe(50)
  })

  it('serialises filters into query string', async () => {
    mockedApi.get.mockResolvedValueOnce({
      success: true,
      data: { items: [], total: 0, page: 1, limit: 20 },
    })
    await bookingService.listForAdmin({
      status: 'pending',
      category: 'ac',
      search: 'Demo',
      page: 2,
      limit: 10,
    })
    const calledWith = mockedApi.get.mock.calls[0][0] as string
    expect(calledWith).toContain('/admin/bookings')
    expect(calledWith).toContain('status=pending')
    expect(calledWith).toContain('category=ac')
    expect(calledWith).toContain('search=Demo')
    expect(calledWith).toContain('page=2')
    expect(calledWith).toContain('limit=10')
  })
})

describe('bookingService.complete', () => {
  it('posts an empty body when no otp provided', async () => {
    mockedApi.post.mockResolvedValueOnce({ success: true, data: { booking_id: 'b1' } })
    await bookingService.complete('b1')
    expect(mockedApi.post).toHaveBeenCalledWith('/bookings/b1/complete', {})
  })

  it('posts the otp body when otp is provided', async () => {
    mockedApi.post.mockResolvedValueOnce({ success: true, data: { booking_id: 'b1' } })
    await bookingService.complete('b1', { otp: '123456' })
    expect(mockedApi.post).toHaveBeenCalledWith('/bookings/b1/complete', {
      otp: '123456',
    })
  })
})

describe('bookingService.assignTechnician', () => {
  it('posts technician_id + optional note', async () => {
    mockedApi.post.mockResolvedValueOnce({ success: true, data: { booking_id: 'b1' } })
    await bookingService.assignTechnician('b1', 't-1', 'first dispatch')
    expect(mockedApi.post).toHaveBeenCalledWith('/bookings/b1/assign-technician', {
      technician_id: 't-1',
      note: 'first dispatch',
    })
  })
})

describe('bookingService.listForTechnician', () => {
  it('calls /technician/bookings with status filter', async () => {
    mockedApi.get.mockResolvedValueOnce({
      success: true,
      data: [{ booking_id: 'b1' }],
    })
    const result = await bookingService.listForTechnician({ status: 'accepted' })
    expect(result).toHaveLength(1)
    const calledWith = mockedApi.get.mock.calls[0][0] as string
    expect(calledWith).toContain('/technician/bookings')
    expect(calledWith).toContain('status=accepted')
  })
})
