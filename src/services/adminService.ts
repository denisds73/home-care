import { api } from './api'
import type { Booking, BookingStatus, Service } from '../types/domain'

export const adminService = {
  getBookings: (filters?: Record<string, string>) => {
    const qs = filters ? new URLSearchParams(filters).toString() : ''
    return api.get<{ data: Booking[] }>(`/admin/bookings${qs ? '?' + qs : ''}`)
  },
  updateBookingStatus: (id: string, status: BookingStatus) => 
    api.patch<{ data: Booking }>(`/admin/bookings/${id}/status`, { status }),
    
  addService: (data: Partial<Service>) => api.post<{ data: Service }>('/admin/services', data),
  updateService: (id: number, data: Partial<Service>) => api.put<{ data: Service }>(`/admin/services/${id}`, data),
  deleteService: (id: number) => api.delete<{ success: boolean }>(`/admin/services/${id}`),
  
  getDashboardStats: () => api.get<{ data: Record<string, unknown> }>('/admin/stats'),
}
