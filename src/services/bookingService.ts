import { api } from './api'
import type {
  Booking,
  BookingReview,
  BookingStatus,
  BookingStatusEvent,
  CreateBookingPayload,
} from '../types/domain'

interface Envelope<T> {
  success?: boolean
  data: T
  message?: string
}

export interface ReviewDto {
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
}

export interface AdminBookingFilters {
  status?: BookingStatus
  category?: string
  vendor_id?: string
  search?: string
}

function toQuery(filters?: Record<string, string | undefined>): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v) params.set(k, v)
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const bookingService = {
  // ----- Create / read -----
  create: async (dto: CreateBookingPayload): Promise<Booking> => {
    const res = await api.post<Envelope<Booking>>('/bookings', dto)
    return res.data
  },
  createBooking: (data: CreateBookingPayload) =>
    api.post<Envelope<Booking>>('/bookings', data),

  listForCustomer: async (): Promise<Booking[]> => {
    const res = await api.get<Envelope<Booking[]>>('/bookings/me')
    return res.data ?? []
  },
  getMyBookings: () => api.get<Envelope<Booking[]>>('/bookings/me'),

  listForVendor: async (query?: { status?: BookingStatus }): Promise<Booking[]> => {
    const qs = toQuery({ status: query?.status })
    const res = await api.get<Envelope<Booking[]>>(`/vendors/me/bookings${qs}`)
    return res.data ?? []
  },

  listForAdmin: async (filters?: AdminBookingFilters): Promise<Booking[]> => {
    const qs = toQuery(filters as Record<string, string | undefined>)
    const res = await api.get<
      Envelope<{ items: Booking[]; total: number; page: number; limit: number }>
    >(`/admin/bookings${qs}`)
    return res.data?.items ?? []
  },

  getById: async (id: string): Promise<Booking> => {
    const res = await api.get<Envelope<Booking>>(`/bookings/${id}`)
    return res.data
  },
  getBookingById: (id: string) =>
    api.get<Envelope<Booking>>(`/bookings/${id}`),

  getEvents: async (id: string): Promise<BookingStatusEvent[]> => {
    const res = await api.get<Envelope<BookingStatusEvent[]>>(
      `/bookings/${id}/events`,
    )
    return res.data ?? []
  },

  // ----- Lifecycle transitions -----
  cancel: async (id: string, note?: string): Promise<Booking> => {
    const res = await api.post<Envelope<Booking>>(
      `/bookings/${id}/cancel`,
      { note },
    )
    return res.data
  },
  cancelBooking: (id: string) =>
    api.post<Envelope<Booking>>(`/bookings/${id}/cancel`, {}),

  assign: async (
    id: string,
    vendor_id: string,
    note?: string,
  ): Promise<Booking> => {
    const res = await api.post<Envelope<Booking>>(
      `/bookings/${id}/assign`,
      { vendor_id, note },
    )
    return res.data
  },

  accept: async (id: string): Promise<Booking> => {
    const res = await api.post<Envelope<Booking>>(
      `/bookings/${id}/accept`,
      {},
    )
    return res.data
  },

  reject: async (id: string, note?: string): Promise<Booking> => {
    const res = await api.post<Envelope<Booking>>(
      `/bookings/${id}/reject`,
      { note },
    )
    return res.data
  },

  start: async (id: string): Promise<Booking> => {
    const res = await api.post<Envelope<Booking>>(`/bookings/${id}/start`, {})
    return res.data
  },

  complete: async (id: string): Promise<Booking> => {
    const res = await api.post<Envelope<Booking>>(
      `/bookings/${id}/complete`,
      {},
    )
    return res.data
  },

  // ----- Reviews -----
  review: async (id: string, dto: ReviewDto): Promise<BookingReview> => {
    const res = await api.post<Envelope<BookingReview>>(
      `/bookings/${id}/review`,
      dto,
    )
    return res.data
  },

  getReview: async (id: string): Promise<BookingReview | null> => {
    try {
      const res = await api.get<Envelope<BookingReview>>(
        `/bookings/${id}/review`,
      )
      return res.data ?? null
    } catch {
      return null
    }
  },
}
