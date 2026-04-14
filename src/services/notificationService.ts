import { api } from './api'
import type { Notification } from '../types/domain'
import { ENV } from '../config/env'

export const notificationService = {
  getAll: () => api.get<{ data: Notification[] }>('/notifications'),
  markAsRead: (id: string) => api.patch<{ data: Notification }>(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.patch<{ data: null }>('/notifications/read-all', {}),

  /** Build the SSE stream URL with the given JWT. */
  getStreamUrl: (token: string): string =>
    `${ENV.API_URL}/notifications/stream?token=${encodeURIComponent(token)}`,
}
