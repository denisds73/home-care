import { api } from './api'
import type {
  Vendor,
  CreateVendorPayload,
  UpdateVendorPayload,
  VendorListQuery,
  VendorStatus,
  PaginatedVendors,
} from '../types/domain'

interface Envelope<T> {
  success: boolean
  data: T
  message?: string
}

function toQueryString(query?: VendorListQuery): string {
  if (!query) return ''
  const params = new URLSearchParams()
  if (query.status) params.set('status', query.status)
  if (query.city) params.set('city', query.city)
  if (query.search) params.set('search', query.search)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const vendorService = {
  list: async (query?: VendorListQuery): Promise<PaginatedVendors> => {
    const res = await api.get<Envelope<PaginatedVendors>>(
      `/admin/vendors${toQueryString(query)}`,
    )
    return res.data
  },

  get: async (id: string): Promise<Vendor> => {
    const res = await api.get<Envelope<Vendor>>(`/admin/vendors/${id}`)
    return res.data
  },

  create: async (payload: CreateVendorPayload): Promise<Vendor> => {
    const res = await api.post<Envelope<Vendor>>('/admin/vendors', payload)
    return res.data
  },

  update: async (id: string, payload: UpdateVendorPayload): Promise<Vendor> => {
    const res = await api.patch<Envelope<Vendor>>(
      `/admin/vendors/${id}`,
      payload,
    )
    return res.data
  },

  updateStatus: async (id: string, status: VendorStatus): Promise<Vendor> => {
    const res = await api.patch<Envelope<Vendor>>(
      `/admin/vendors/${id}/status`,
      { status },
    )
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete<Envelope<{ success: boolean }>>(`/admin/vendors/${id}`)
  },

  // Vendor self-service
  getMe: async (): Promise<Vendor> => {
    const res = await api.get<Envelope<Vendor>>('/vendors/me')
    return res.data
  },

  updateMe: async (payload: UpdateVendorPayload): Promise<Vendor> => {
    const res = await api.patch<Envelope<Vendor>>('/vendors/me', payload)
    return res.data
  },

  // Admin: vendors available to assign (active, optional category filter)
  listActive: async (query?: { category_id?: string }): Promise<Vendor[]> => {
    const params = new URLSearchParams({ status: 'active' })
    if (query?.category_id) params.set('category_id', query.category_id)
    const res = await api.get<Envelope<PaginatedVendors>>(
      `/admin/vendors?${params.toString()}`,
    )
    return res.data?.items ?? []
  },
}
