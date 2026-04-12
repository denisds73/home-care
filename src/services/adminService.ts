import { api } from './api'
import type { Booking, BookingStatus, Service } from '../types/domain'

export interface AdminStats {
  totalRevenue: number
  totalBookings: number
  activeVendors: number
  totalUsers: number
  avgRating: number
  /** Bookings in PENDING status (awaiting vendor assignment). */
  pendingApprovals: number
  /** Vendors in PENDING onboarding status. */
  pendingVendorApprovals: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  bookings: number
  joinedAt: string
  status: 'active' | 'suspended'
}

export interface FinanceSummary {
  totalRevenue: number
  totalPayouts: number
  net: number
}

export const adminService = {
  // Dashboard
  getDashboardStats: () => api.get<{ data: AdminStats }>('/admin/stats'),

  // Bookings
  getBookings: (filters?: Record<string, string>) => {
    const qs = filters ? new URLSearchParams(filters).toString() : ''
    return api.get<{ data: Booking[] }>(`/admin/bookings${qs ? '?' + qs : ''}`)
  },
  updateBookingStatus: (id: string, status: BookingStatus) =>
    api.patch<{ data: Booking }>(`/admin/bookings/${id}/status`, { status }),

  // Catalog (Services)
  addService: (data: Partial<Service>) => api.post<{ data: Service }>('/admin/services', data),
  updateService: (id: number, data: Partial<Service>) => api.put<{ data: Service }>(`/admin/services/${id}`, data),
  deleteService: (id: number) => api.delete<{ success: boolean }>(`/admin/services/${id}`),

  // Users
  getUsers: (role?: string) => {
    const qs = role ? `?role=${encodeURIComponent(role)}` : ''
    return api.get<{ data: AdminUser[] }>(`/admin/users${qs}`)
  },
  updateUserStatus: (id: string, status: 'active' | 'suspended') =>
    api.patch<{ data: AdminUser }>(`/admin/users/${id}/status`, { status }),

  // Finance
  getFinanceSummary: () => api.get<{ data: FinanceSummary }>('/admin/finance'),
}
