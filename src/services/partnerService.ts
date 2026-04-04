import { api } from './api'
import type { Partner, Job } from '../types/domain'

interface EarningsSummary {
  totalEarnings: number
  completedJobs: number
  averagePerJob: number
}

export const partnerService = {
  getProfile: () => api.get<{ data: Partner }>('/partners/me'),

  updateProfile: (data: { skills?: string[]; service_area?: string }) =>
    api.patch<{ data: Partner }>('/partners/me', data),

  toggleAvailability: (is_online: boolean) =>
    api.patch<{ data: Partner }>('/partners/me/availability', { is_online }),

  getJobs: () => api.get<{ data: Job[] }>('/partners/me/jobs'),

  updateJobStatus: (jobId: string, status: string) =>
    api.patch<{ data: Job }>(`/partners/me/jobs/${jobId}/status`, { status }),

  getEarnings: () =>
    api.get<{ data: EarningsSummary }>('/partners/me/earnings'),

  getSchedule: () => api.get<{ data: Job[] }>('/partners/me/schedule'),
}
