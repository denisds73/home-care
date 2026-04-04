import { api } from './api'
import type { Notification } from '../types/domain'

export const notificationService = {
  getAll: () => api.get<{ data: Notification[] }>('/notifications'),
  markAsRead: (id: string) => api.patch<{ data: Notification }>(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.patch<{ data: null }>('/notifications/read-all', {}),
}
