import { api } from './api'
import type { CategoryMeta, Service } from '../types/domain'

export const serviceService = {
  getCategories: () => api.get<{ data: CategoryMeta[] }>('/categories'),
  getServices: (categoryId?: string) => {
    const query = categoryId ? `?category=${categoryId}` : ''
    return api.get<{ data: Service[] }>(`/services${query}`)
  },
  getServiceById: (id: number) => api.get<{ data: Service }>(`/services/${id}`),
  searchServices: (query: string) => api.get<{ data: Service[] }>(`/services/search?q=${encodeURIComponent(query)}`),
}
