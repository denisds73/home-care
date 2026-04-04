import { api } from './api'
import type { Booking, NewBookingPayload } from '../types/domain'

export const bookingService = {
  createBooking: (data: NewBookingPayload) => api.post<{ data: Booking }>('/bookings', data),
  getMyBookings: () => api.get<{ data: Booking[] }>('/bookings/me'),
  getBookingById: (id: string) => api.get<{ data: Booking }>(`/bookings/${id}`),
  cancelBooking: (id: string) => api.post<{ data: Booking }>(`/bookings/${id}/cancel`, {}),
}
