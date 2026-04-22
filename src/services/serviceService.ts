import { api } from './api'
import type { CategoryMeta, Service } from '../types/domain'

export const serviceService = {
  getCategories: () => api.get<{ data: CategoryMeta[] }>('/categories'),
  getServices: (filters?: { category?: string; search?: string }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.set('category', filters.category)
    if (filters?.search?.trim()) params.set('search', filters.search.trim())
    const qs = params.toString()
    return api.get<{ data: Service[] }>(`/services${qs ? `?${qs}` : ''}`)
  },
  getServiceById: (id: number) => api.get<{ data: Service }>(`/services/${id}`),
  searchServices: (query: string) => api.get<{ data: Service[] }>(`/services/search?q=${encodeURIComponent(query)}`),
}
